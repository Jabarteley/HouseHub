-- Final fix to ensure agent performance updates work properly

-- Drop and recreate the update_agent_performance_manual function with proper SECURITY DEFINER
DROP FUNCTION IF EXISTS update_agent_performance_manual(uuid);

CREATE OR REPLACE FUNCTION update_agent_performance_manual(agent_id_param uuid)
RETURNS void AS $
BEGIN
  -- Insert or update agent performance with conflict resolution
  INSERT INTO agent_performance (agent_id, successful_deals)
  VALUES (agent_id_param, 1)
  ON CONFLICT (agent_id) 
  DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
  
  -- Also ensure we can update the agent_performance table directly if needed
  -- This is a fallback mechanism
  EXCEPTION WHEN insufficient_privilege THEN
    -- If we get a privilege error, try to insert without conflict handling
    BEGIN
      INSERT INTO agent_performance (agent_id, successful_deals)
      VALUES (agent_id_param, 1);
    EXCEPTION WHEN unique_violation THEN
      UPDATE agent_performance 
      SET successful_deals = successful_deals + 1
      WHERE agent_id = agent_id_param;
    END;
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a specific function to get agent performance data that avoids 406 errors
CREATE OR REPLACE FUNCTION get_agent_commission_data(agent_id_param uuid)
RETURNS TABLE(total_commission numeric, successful_deals int) AS $
BEGIN
  RETURN QUERY
  SELECT 
    ap.total_commission,
    ap.successful_deals
  FROM agent_performance ap
  WHERE ap.agent_id = agent_id_param;
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_agent_performance_manual(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_commission_data(uuid) TO authenticated;

-- Also update the handle_property_assignment trigger function
CREATE OR REPLACE FUNCTION handle_property_assignment()
RETURNS TRIGGER AS $
BEGIN
  -- Only trigger if agent is newly assigned (not previously assigned)
  IF NEW.agent_id IS NOT NULL AND OLD.agent_id IS NULL THEN
    -- Call our secure function to update agent performance
    PERFORM update_agent_performance_manual(NEW.agent_id);
  ELSIF NEW.agent_id IS NOT NULL AND OLD.agent_id IS NOT NULL AND NEW.agent_id != OLD.agent_id THEN
    -- Agent changed from one to another, update new agent's performance
    PERFORM update_agent_performance_manual(NEW.agent_id);
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_agent_performance_trigger ON properties;
CREATE TRIGGER update_agent_performance_trigger
  AFTER UPDATE OF agent_id ON properties
  FOR EACH ROW
  WHEN (OLD.agent_id IS DISTINCT FROM NEW.agent_id)  -- Only fire when agent_id actually changes
  EXECUTE FUNCTION handle_property_assignment();