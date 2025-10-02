-- Fix RLS policies for agent functionality without recreating existing structures

-- Add missing columns to properties table if they don't exist
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS agent_status text DEFAULT 'unassigned' CHECK (agent_status IN ('unassigned','requested','assigned','rejected','exclusive')),
ADD COLUMN IF NOT EXISTS allow_agents boolean DEFAULT true;

-- Create agent_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id bigint REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  requested_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  commission_offer numeric, -- optional commission percent offered by agent
  message text,
  responded_by uuid REFERENCES public.user_profiles(id), -- owner/admin who responded
  responded_at timestamptz
);

-- Create agent_leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.user_profiles(id),
  title text,
  address text,
  city text,
  latitude double precision,
  longitude double precision,
  photos jsonb,
  owner_contact jsonb, -- phone/email if known
  status text DEFAULT 'lead' CHECK (status IN ('lead', 'owner_contacted', 'owner_claimed', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_agent_requests_property_id ON public.agent_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_agent_requests_agent_id ON public.agent_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_leads_agent_id ON public.agent_leads(agent_id);

-- Drop existing policies that might be causing recursion and create new clean ones
-- Remove overlapping policies for properties table
DROP POLICY IF EXISTS "Properties are viewable by everyone." ON public.properties;
DROP POLICY IF EXISTS "Landlords can insert their own properties." ON public.properties;
DROP POLICY IF EXISTS "Landlords can update their own properties." ON public.properties;
DROP POLICY IF EXISTS "Agents can update properties assigned to them." ON public.properties;
DROP POLICY IF EXISTS "Landlords can delete their own properties." ON public.properties;

-- Properties table policies - non-overlapping and non-recursive
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
-- Policy 1: Active properties visible to authenticated users
CREATE POLICY "Active properties viewable by users" ON public.properties FOR SELECT USING (status = 'active');
-- Policy 2: Property owners have full access to their properties
CREATE POLICY "Property owners manage properties" ON public.properties FOR ALL USING (landlord_id = auth.uid()) WITH CHECK (landlord_id = auth.uid());
-- Policy 3: Agents have access to properties assigned to them
CREATE POLICY "Agents manage assigned properties" ON public.properties FOR ALL USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());
-- Policy 4: Agents can view discoverable properties (unassigned and allow_agents=true)
CREATE POLICY "Agents view discoverable properties" ON public.properties FOR SELECT USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'agent'
  AND agent_id IS NULL
  AND allow_agents IS true
  AND status = 'active'
);
-- Policy 5: Admins have full access
CREATE POLICY "Admins manage all properties" ON public.properties FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin') WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Property Images policies - clean and non-overlapping
DROP POLICY IF EXISTS "Property images are viewable by everyone." ON public.property_images;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
-- Policy 1: Images for active properties are visible to authenticated users
CREATE POLICY "Images for active properties viewable" ON public.property_images FOR SELECT USING ((SELECT status FROM public.properties WHERE id = property_images.property_id) = 'active');
-- Policy 2: Property owners can manage their property images
CREATE POLICY "Property owners manage images" ON public.property_images FOR ALL USING ((SELECT landlord_id FROM public.properties WHERE id = property_images.property_id) = auth.uid()) WITH CHECK ((SELECT landlord_id FROM public.properties WHERE id = property_images.property_id) = auth.uid());
-- Policy 3: Agents can manage images for assigned properties
CREATE POLICY "Agents manage assigned property images" ON public.property_images FOR ALL USING ((SELECT agent_id FROM public.properties WHERE id = property_images.property_id) = auth.uid()) WITH CHECK ((SELECT agent_id FROM public.properties WHERE id = property_images.property_id) = auth.uid());

-- Agent Requests policies
ALTER TABLE public.agent_requests ENABLE ROW LEVEL SECURITY;
-- Agents can create requests to represent properties
CREATE POLICY "Agents request property representation" ON public.agent_requests FOR INSERT WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'agent' AND agent_id = auth.uid());
-- Property owners can see and manage requests for their properties
CREATE POLICY "Property owners view requests" ON public.agent_requests FOR SELECT USING (auth.uid() = (SELECT landlord_id FROM public.properties WHERE id = agent_requests.property_id));
CREATE POLICY "Property owners manage requests" ON public.agent_requests FOR UPDATE USING (auth.uid() = (SELECT landlord_id FROM public.properties WHERE id = agent_requests.property_id)) WITH CHECK (auth.uid() = (SELECT landlord_id FROM public.properties WHERE id = agent_requests.property_id));
-- Agents can see and manage their own requests
CREATE POLICY "Agents view own requests" ON public.agent_requests FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Agents manage own requests" ON public.agent_requests FOR UPDATE USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());
-- Admins have full access
CREATE POLICY "Admins manage all agent requests" ON public.agent_requests FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin') WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Agent Leads policies
ALTER TABLE public.agent_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents manage own leads" ON public.agent_leads FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'agent' AND agent_id = auth.uid()) WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'agent' AND agent_id = auth.uid());
CREATE POLICY "Admins manage all agent leads" ON public.agent_leads FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin') WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Create functions
CREATE OR REPLACE FUNCTION accept_agent_request(request_id uuid, responder_id uuid)
RETURNS void AS $$
DECLARE
  req_property_id bigint;
  req_agent_id uuid;
BEGIN
  -- Get the property and agent IDs from the request
  SELECT property_id, agent_id INTO req_property_id, req_agent_id
  FROM agent_requests
  WHERE id = request_id;

  -- Update the agent request status
  UPDATE agent_requests
  SET 
    status = 'accepted',
    responded_by = responder_id,
    responded_at = now()
  WHERE id = request_id;

  -- Update the property to assign the agent
  UPDATE properties
  SET 
    agent_id = req_agent_id,
    agent_status = 'assigned'
  WHERE id = req_property_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update agent performance
CREATE OR REPLACE FUNCTION update_agent_performance_on_assignment(agent_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO agent_performance (agent_id, successful_deals)
  VALUES (agent_id_param, 1)
  ON CONFLICT (agent_id) 
  DO UPDATE SET successful_deals = agent_performance.successful_deals + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update agent performance when a property gets assigned to an agent
CREATE OR REPLACE FUNCTION handle_property_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if agent is newly assigned (not previously assigned)
  IF NEW.agent_id IS NOT NULL AND OLD.agent_id IS NULL THEN
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
$$ LANGUAGE plpgsql;

-- Create the trigger on properties table
DROP TRIGGER IF EXISTS update_agent_performance_trigger ON properties;
CREATE TRIGGER update_agent_performance_trigger
  AFTER UPDATE OF agent_id ON properties
  FOR EACH ROW
  WHEN (OLD.agent_id IS DISTINCT FROM NEW.agent_id)  -- Only fire when agent_id actually changes
  EXECUTE FUNCTION handle_property_assignment();