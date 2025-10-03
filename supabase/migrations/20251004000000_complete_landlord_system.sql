-- Complete Landlord System Implementation
-- This migration adds all the missing landlord features from the detailed guide

-- Add landlord verification fields to user_profiles table
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_landlord_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS landlord_rating numeric DEFAULT 0;

-- Create verifications table for KYC documents
CREATE TABLE IF NOT EXISTS public.verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type text, -- 'id', 'ownership', 'address'
  document_path text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  verified_by uuid REFERENCES public.user_profiles(id)
);

-- Create landlord settings table for payout info
CREATE TABLE IF NOT EXISTS public.landlord_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  payout_method text, -- 'bank','mobile_money'
  payout_details jsonb, -- { bank_name, account_no (masked), account_name }
  preferred_currency text DEFAULT 'USD',
  auto_payout boolean DEFAULT false,
  min_payout_amount numeric DEFAULT 1000,
  created_at timestamptz DEFAULT now()
);

-- Create payouts table for tracking landlord payments
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES public.user_profiles(id),
  amount numeric,
  currency text DEFAULT 'USD',
  method text,
  provider_ref text,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'paid', 'failed')),
  requested_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Create property units table for multi-unit properties
CREATE TABLE IF NOT EXISTS public.property_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id bigint REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_identifier text,
  bedrooms int,
  bathrooms int,
  floor int,
  price numeric,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create activity log for auditing landlord actions
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id),
  action text,
  object_type text,
  object_id uuid,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON public.verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications(status);
CREATE INDEX IF NOT EXISTS idx_landlord_settings_landlord_id ON public.landlord_settings(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payouts_landlord_id ON public.payouts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_property_units_property_id ON public.property_units(property_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);

-- Enable RLS for all new tables
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verifications table
DROP POLICY IF EXISTS "Users can view their own verifications" ON public.verifications;
CREATE POLICY "Users can view their own verifications" ON public.verifications
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all verifications" ON public.verifications;
CREATE POLICY "Admins can view all verifications" ON public.verifications
FOR SELECT TO authenticated USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can create their own verifications" ON public.verifications;
CREATE POLICY "Users can create their own verifications" ON public.verifications
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update verifications" ON public.verifications;
CREATE POLICY "Admins can update verifications" ON public.verifications
FOR UPDATE TO authenticated USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for landlord_settings table
DROP POLICY IF EXISTS "Landlords can view their own settings" ON public.landlord_settings;
CREATE POLICY "Landlords can view their own settings" ON public.landlord_settings
FOR SELECT TO authenticated USING (landlord_id = auth.uid());

DROP POLICY IF EXISTS "Landlords can manage their own settings" ON public.landlord_settings;
CREATE POLICY "Landlords can manage their own settings" ON public.landlord_settings
FOR ALL TO authenticated USING (landlord_id = auth.uid()) WITH CHECK (landlord_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all landlord settings" ON public.landlord_settings;
CREATE POLICY "Admins can view all landlord settings" ON public.landlord_settings
FOR SELECT TO authenticated USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for payouts table
DROP POLICY IF EXISTS "Landlords can view their own payouts" ON public.payouts;
CREATE POLICY "Landlords can view their own payouts" ON public.payouts
FOR SELECT TO authenticated USING (landlord_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.payouts;
CREATE POLICY "Admins can manage all payouts" ON public.payouts
FOR ALL TO authenticated USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for property_units table
DROP POLICY IF EXISTS "Property owners can manage units for their properties" ON public.property_units;
CREATE POLICY "Property owners can manage units for their properties" ON public.property_units
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_units.property_id 
    AND properties.landlord_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_units.property_id 
    AND properties.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage all property units" ON public.property_units;
CREATE POLICY "Admins can manage all property units" ON public.property_units
FOR ALL TO authenticated USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for activity_log table
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_log;
CREATE POLICY "Users can view their own activity logs" ON public.activity_log
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_log;
CREATE POLICY "Admins can view all activity logs" ON public.activity_log
FOR SELECT TO authenticated USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Add a function to log landlord activities
CREATE OR REPLACE FUNCTION log_landlord_activity(
  p_action text,
  p_object_type text,
  p_object_id uuid,
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, object_type, object_id, meta)
  VALUES (auth.uid(), p_action, p_object_type, p_object_id, p_meta);
END;
$$ LANGUAGE plpgsql;


-- Add a function to request property verification
CREATE OR REPLACE FUNCTION request_property_verification(p_property_id bigint)
RETURNS uuid AS $$
DECLARE
  verification_id uuid;
BEGIN
  -- Insert a new property verification request
  INSERT INTO property_verifications (property_id, status, notes)
  VALUES (p_property_id, 'pending', 'Landlord requested verification')
  RETURNING id INTO verification_id;
  
  -- Log the activity
  PERFORM log_landlord_activity('request_verification', 'property', p_property_id::uuid);
  
  RETURN verification_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to request payout
CREATE OR REPLACE FUNCTION request_payout(p_amount numeric, p_method text)
RETURNS uuid AS $$
DECLARE
  payout_id uuid;
  landlord_id uuid;
BEGIN
  landlord_id := auth.uid();
  
  INSERT INTO payouts (landlord_id, amount, method, status)
  VALUES (landlord_id, p_amount, p_method, 'requested')
  RETURNING id INTO payout_id;
  
  PERFORM log_landlord_activity('request_payout', 'payout', payout_id, jsonb_build_object('amount', p_amount, 'method', p_method));
  
  RETURN payout_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to upload KYC documents
CREATE OR REPLACE FUNCTION upload_kyc_document(p_type text, p_document_path text)
RETURNS uuid AS $$
DECLARE
  verification_id uuid;
BEGIN
  INSERT INTO verifications (user_id, type, document_path, status)
  VALUES (auth.uid(), p_type, p_document_path, 'pending')
  RETURNING id INTO verification_id;
  
  PERFORM log_landlord_activity('upload_kyc', 'verification', verification_id, jsonb_build_object('type', p_type));
  
  RETURN verification_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to get landlord dashboard stats
CREATE OR REPLACE FUNCTION get_landlord_dashboard_stats()
RETURNS TABLE(
  total_properties bigint,
  active_listings bigint,
  total_inquiries bigint,
  monthly_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM properties WHERE landlord_id = auth.uid()) as total_properties,
    (SELECT COUNT(*) FROM properties WHERE landlord_id = auth.uid() AND status = 'active') as active_listings,
    (SELECT COUNT(*) FROM property_inquiries pi 
     JOIN properties p ON p.id = pi.property_id 
     WHERE p.landlord_id = auth.uid()) as total_inquiries,
    (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
     JOIN properties p ON p.id = t.property_id 
     WHERE p.landlord_id = auth.uid() 
     AND t.payment_status = 'completed' 
     AND t.created_at >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue;
END;
$$ LANGUAGE plpgsql;


-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_landlord_activity(text, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION request_property_verification(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION request_payout(numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION upload_kyc_document(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_landlord_dashboard_stats() TO authenticated;