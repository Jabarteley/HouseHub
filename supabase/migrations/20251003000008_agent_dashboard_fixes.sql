-- Fix agent performance query and complete invitation functionality

-- Fix the agent_performance RLS policies that might be causing the 406 error
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- Create more permissive but secure policies for agent performance
DROP POLICY IF EXISTS "Agents can view own performance" ON public.agent_performance;
CREATE POLICY "Agents can view own performance" ON public.agent_performance FOR ALL TO authenticated
    USING (agent_id = auth.uid())
    WITH CHECK (agent_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all agent performance" ON public.agent_performance;
CREATE POLICY "Admins manage all agent performance" ON public.agent_performance FOR ALL TO authenticated 
    USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Create a more permissive SELECT policy that allows broader access for display purposes
DROP POLICY IF EXISTS "Agent performance viewable" ON public.agent_performance;
CREATE POLICY "Agent performance viewable" ON public.agent_performance FOR SELECT TO authenticated
    USING (
        agent_id = auth.uid() 
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
        OR EXISTS (
            SELECT 1 
            FROM public.properties 
            WHERE properties.agent_id = agent_performance.agent_id 
            AND properties.landlord_id = auth.uid()
        )
    );

-- Update the accept_agent_request function to be more robust
CREATE OR REPLACE FUNCTION accept_agent_request(request_id_param uuid)
RETURNS void AS $$
DECLARE
  req_property_id bigint;
  req_agent_id uuid;
  property_owner_id uuid;
  current_agent_id uuid;
BEGIN
  -- Get the property and agent IDs from the request
  SELECT property_id, agent_id INTO req_property_id, req_agent_id
  FROM agent_requests
  WHERE id = request_id_param;

  IF req_property_id IS NULL OR req_agent_id IS NULL THEN
      RAISE EXCEPTION 'Invalid request ID';
  END IF;

  -- Verify that the calling user is the property owner
  SELECT landlord_id INTO property_owner_id
  FROM properties
  WHERE id = req_property_id;
  
  IF property_owner_id IS NULL OR property_owner_id != auth.uid() THEN
      RAISE EXCEPTION 'Unauthorized: You are not the owner of this property';
  END IF;

  -- Check if the property already has an assigned agent
  SELECT agent_id INTO current_agent_id
  FROM properties
  WHERE id = req_property_id;
  
  IF current_agent_id IS NOT NULL THEN
      RAISE EXCEPTION 'Property already has an assigned agent';
  END IF;

  -- Update the agent request status
  UPDATE agent_requests
  SET 
    status = 'accepted',
    responded_by = auth.uid(),
    responded_at = now()
  WHERE id = request_id_param;

  -- Update the property to assign the agent
  UPDATE properties
  SET 
    agent_id = req_agent_id,
    agent_status = 'assigned'
  WHERE id = req_property_id;
  
  -- Update or insert agent performance
  INSERT INTO agent_performance (agent_id, successful_deals)
  VALUES (req_agent_id, 1)
  ON CONFLICT (agent_id) 
  DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
END;
$$ LANGUAGE plpgsql;

-- Create a function specifically to get agent requests for a property owner
CREATE OR REPLACE FUNCTION get_agent_requests_for_owner(owner_id uuid)
RETURNS TABLE(
    id uuid,
    property_id bigint,
    agent_id uuid,
    requested_at timestamptz,
    status text,
    commission_offer numeric,
    message text,
    property_title text,
    agent_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ar.id,
        ar.property_id,
        ar.agent_id,
        ar.requested_at,
        ar.status,
        ar.commission_offer,
        ar.message,
        p.title as property_title,
        up.full_name as agent_name
    FROM agent_requests ar
    JOIN properties p ON p.id = ar.property_id
    JOIN user_profiles up ON up.id = ar.agent_id
    WHERE p.landlord_id = owner_id
    ORDER BY ar.requested_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_agent_requests_for_owner(uuid) TO authenticated;

-- Create a function for landlords to see all requests for their properties
CREATE OR REPLACE FUNCTION get_property_requests_summary()
RETURNS TABLE(
    property_id bigint,
    property_title text,
    total_requests int,
    pending_requests int
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as property_id,
        p.title as property_title,
        COUNT(ar.id)::int as total_requests,
        COUNT(CASE WHEN ar.status = 'pending' THEN 1 END)::int as pending_requests
    FROM properties p
    LEFT JOIN agent_requests ar ON p.id = ar.property_id
    WHERE p.landlord_id = auth.uid()
    GROUP BY p.id, p.title
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_property_requests_summary() TO authenticated;

-- Create a function to invite agent with comprehensive error checking
CREATE OR REPLACE FUNCTION invite_agent_to_property_safe(
    property_id_param bigint,
    agent_id_param uuid,
    message_param text DEFAULT 'Property owner has invited you to represent this property.'
)
RETURNS uuid AS $$
DECLARE
    property_owner_id uuid;
    property_agent_id uuid;
    new_request_id uuid;
BEGIN
    -- Verify property exists and user is the owner
    SELECT landlord_id, agent_id INTO property_owner_id, property_agent_id
    FROM properties
    WHERE id = property_id_param;
    
    IF property_owner_id IS NULL THEN
        RAISE EXCEPTION 'Property not found';
    END IF;
    
    IF property_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: You are not the owner of this property';
    END IF;
    
    -- Check if property already has an agent
    IF property_agent_id IS NOT NULL THEN
        RAISE EXCEPTION 'Property already has an assigned agent';
    END IF;
    
    -- Verify agent exists and has correct role
    IF NOT EXISTS (
        SELECT 1 
        FROM user_profiles 
        WHERE id = agent_id_param AND role = 'agent'
    ) THEN
        RAISE EXCEPTION 'Invalid agent ID or user is not an agent';
    END IF;
    
    -- Check for duplicate pending request
    IF EXISTS (
        SELECT 1 
        FROM agent_requests 
        WHERE property_id = property_id_param 
        AND agent_id = agent_id_param 
        AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'There is already a pending request for this agent and property';
    END IF;
    
    -- Insert the invitation request
    INSERT INTO agent_requests (property_id, agent_id, status, message, responded_by)
    VALUES (property_id_param, agent_id_param, 'pending', message_param, auth.uid())
    RETURNING id INTO new_request_id;
    
    -- Update property status to reflect request
    UPDATE properties
    SET agent_status = CASE 
        WHEN agent_status = 'unassigned' THEN 'requested'
        ELSE agent_status
    END
    WHERE id = property_id_param;
    
    RETURN new_request_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION invite_agent_to_property_safe(bigint, uuid, text) TO authenticated;