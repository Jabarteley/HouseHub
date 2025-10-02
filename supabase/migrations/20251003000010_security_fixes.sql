-- Final fix for agent performance update in accept function

-- Update the accept_agent_request function to handle agent performance update properly
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
  
  -- Update or insert agent performance, bypassing RLS for internal operation
  -- Use a more secure approach by ensuring we're acting on behalf of admin
  INSERT INTO agent_performance (agent_id, successful_deals)
  VALUES (req_agent_id, 1)
  ON CONFLICT (agent_id) 
  DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the handle_property_assignment trigger function
CREATE OR REPLACE FUNCTION handle_property_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if agent is newly assigned (not previously assigned)
  IF NEW.agent_id IS NOT NULL AND OLD.agent_id IS NULL THEN
    -- Update or insert agent performance using a direct approach
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Also update the RPC function for frontend usage
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
  
  -- Update agent performance
  INSERT INTO agent_performance (agent_id, successful_deals)
  VALUES (req_agent_id, 1)
  ON CONFLICT (agent_id) 
  DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION accept_agent_request_frontend(uuid) TO authenticated;