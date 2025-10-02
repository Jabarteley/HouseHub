-- Final security fix for agent performance updates

-- Fix the agent_performance RLS policy to allow proper updates
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows updates through property assignment workflow
-- This allows property owners to update agent performance when assigning agents
DROP POLICY IF EXISTS "Agent performance updatable by assignment" ON public.agent_performance;

-- More permissive policy that allows the specific use case
CREATE POLICY "Agent performance updatable" ON public.agent_performance FOR ALL TO authenticated
    USING (
        agent_id = auth.uid()
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
        OR EXISTS (
            -- Allow if the user is a property owner and the agent_id in the row
            -- matches an agent that was just assigned to one of their properties
            -- This requires checking through a more complex relationship
            SELECT 1 FROM public.properties p
            WHERE p.agent_id = agent_performance.agent_id
            AND p.landlord_id = auth.uid()
        )
    )
    WITH CHECK (
        agent_id = auth.uid()
        OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    );

-- Create a simpler policy to allow performance tracking
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

-- Update the accept_agent_request function without SECURITY DEFINER but with a direct SQL approach
CREATE OR REPLACE FUNCTION accept_agent_request_frontend(request_id_param uuid)
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
  
  -- Create a helper function to update agent performance that bypasses RLS
  -- For now, we'll just update the property and let the trigger handle performance
  -- In a real implementation, we might need to adjust the trigger approach
END;
$$ LANGUAGE plpgsql;

-- Update the trigger function to work with SECURITY DEFINER properly
CREATE OR REPLACE FUNCTION handle_property_assignment()
RETURNS TRIGGER AS $
BEGIN
  -- Only trigger if agent is newly assigned (not previously assigned)
  IF NEW.agent_id IS NOT NULL AND OLD.agent_id IS NULL THEN
    -- Update or insert agent performance - this should run with elevated privileges
    INSERT INTO agent_performance (agent_id, successful_deals)
    VALUES (NEW.agent_id, 1)
    ON CONFLICT (agent_id) 
    DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
  ELSIF NEW.agent_id IS NOT NULL AND OLD.agent_id IS NOT NULL AND NEW.agent_id != OLD.agent_id THEN
    -- Agent changed from one to another, update new agent's performance
    INSERT INTO agent_performance (agent_id, successful_deals)
    VALUES (NEW.agent_id, 1)
    ON CONFLICT (agent_id) 
    DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Now let's add a dedicated function that can be used directly in the UI
CREATE OR REPLACE FUNCTION update_agent_performance_manual(agent_id_param uuid)
RETURNS void AS $
BEGIN
  INSERT INTO agent_performance (agent_id, successful_deals)
  VALUES (agent_id_param, 1)
  ON CONFLICT (agent_id) 
  DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION accept_agent_request_frontend(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_agent_performance_manual(uuid) TO authenticated;

-- Update the properties update trigger to use the new function
DROP TRIGGER IF EXISTS update_agent_performance_trigger ON properties;
CREATE TRIGGER update_agent_performance_trigger
  AFTER UPDATE OF agent_id ON properties
  FOR EACH ROW
  WHEN (OLD.agent_id IS DISTINCT FROM NEW.agent_id)  -- Only fire when agent_id actually changes
  EXECUTE FUNCTION handle_property_assignment();