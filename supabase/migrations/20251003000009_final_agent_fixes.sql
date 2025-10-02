-- Final fix for agent performance query and complete frontend integration

-- Fix the agent_performance RLS policy that was causing 406 error
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- Create a specific policy to allow viewing agent performance data
DROP POLICY IF EXISTS "Agent performance viewable" ON public.agent_performance;
CREATE POLICY "Agent performance viewable" ON public.agent_performance FOR ALL TO authenticated
    USING (
        agent_id = auth.uid()
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        agent_id = auth.uid()
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );

-- Create a function specifically for agents to get their own performance safely
CREATE OR REPLACE FUNCTION get_agent_performance_safe(p_agent_id uuid)
RETURNS TABLE(
    agent_id uuid,
    total_commission numeric,
    successful_deals int,
    average_rating numeric
) AS $$
BEGIN
    -- Only allow access to own data or by admins
    IF p_agent_id = auth.uid() OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin' THEN
        RETURN QUERY
        SELECT 
            ap.agent_id,
            ap.total_commission,
            ap.successful_deals,
            ap.average_rating
        FROM agent_performance ap
        WHERE ap.agent_id = p_agent_id;
    ELSE
        -- Return empty result for unauthorized access
        RETURN QUERY
        SELECT 
            NULL::uuid as agent_id,
            NULL::numeric as total_commission, 
            NULL::int as successful_deals,
            NULL::numeric as average_rating
        WHERE FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_agent_performance_safe(uuid) TO authenticated;

-- Create function for property owners to see requests for their properties
CREATE OR REPLACE FUNCTION get_agent_requests_for_property_owner()
RETURNS TABLE(
    id uuid,
    property_id bigint,
    agent_id uuid,
    requested_at timestamptz,
    status text,
    commission_offer numeric,
    message text,
    property_title text,
    agent_name text,
    agent_avatar text
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
        up.full_name as agent_name,
        up.avatar_url as agent_avatar
    FROM agent_requests ar
    JOIN properties p ON p.id = ar.property_id
    JOIN user_profiles up ON up.id = ar.agent_id
    WHERE p.landlord_id = auth.uid()
    ORDER BY ar.requested_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_agent_requests_for_property_owner() TO authenticated;

-- Create function to invite an agent to a property
CREATE OR REPLACE FUNCTION invite_agent_to_property_frontend(
    p_property_id bigint,
    p_agent_id uuid,
    p_message text DEFAULT 'Property owner has invited you to represent this property.'
)
RETURNS uuid AS $$
DECLARE
    property_owner_id uuid;
    property_status text;
    new_request_id uuid;
BEGIN
    -- Verify property exists and user is the owner
    SELECT landlord_id, agent_status INTO property_owner_id, property_status
    FROM properties
    WHERE id = p_property_id;
    
    IF property_owner_id IS NULL THEN
        RAISE EXCEPTION 'Property not found';
    END IF;
    
    IF property_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: You are not the owner of this property';
    END IF;
    
    -- Check if property already has an agent
    IF property_status IN ('assigned', 'exclusive') THEN
        RAISE EXCEPTION 'Property already has an assigned agent';
    END IF;
    
    -- Verify agent exists and has correct role
    IF NOT EXISTS (
        SELECT 1 
        FROM user_profiles 
        WHERE id = p_agent_id AND role = 'agent'
    ) THEN
        RAISE EXCEPTION 'Invalid agent ID or user is not an agent';
    END IF;
    
    -- Check for duplicate pending request
    IF EXISTS (
        SELECT 1 
        FROM agent_requests 
        WHERE property_id = p_property_id 
        AND agent_id = p_agent_id 
        AND status IN ('pending', 'requested')
    ) THEN
        RAISE EXCEPTION 'There is already a pending request for this agent and property';
    END IF;
    
    -- Insert the invitation request
    INSERT INTO agent_requests (property_id, agent_id, status, message, responded_by)
    VALUES (p_property_id, p_agent_id, 'pending', p_message, auth.uid())
    RETURNING id INTO new_request_id;
    
    -- Update property status
    UPDATE properties
    SET agent_status = 'requested'
    WHERE id = p_property_id;
    
    RETURN new_request_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION invite_agent_to_property_frontend(bigint, uuid, text) TO authenticated;