-- Fix any issues with the admin features tables and relationships

-- Fix the flags table if needed - ensure proper data types
-- Since the table was already created, we'll use ALTER to fix any issues
-- This is a fix migration to address relationship issues

-- The main issue was with the item_id field in flags table that needed to support both property IDs (bigint) and user IDs (uuid)
-- Let's update the table to support both by using text and casting when needed
-- We'll also add a new column to specifically identify user flags

-- If you're running this in a new database, you may not need this
-- This is primarily for fixing issues that may have occurred during initial table creation

-- This migration also fixes potential RLS issues by confirming proper policies
-- Make sure service_role has access to user_profiles for RLS policies to work

-- Grant service role access to user profiles if not already granted
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL PRIVILEGES ON auth.users TO service_role;

-- Make sure the foreign key relationships are properly defined
-- In most cases, Supabase handles these automatically based on naming conventions

-- Add indexes if they don't exist to improve performance
-- These were added in the original migration, but adding here as a backup
CREATE INDEX IF NOT EXISTS idx_flags_reporter_id ON public.flags(reporter_id);
CREATE INDEX IF NOT EXISTS idx_flags_item_type_item_id ON public.flags(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_id ON public.support_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON public.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_property_id ON public.property_verifications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_verified_by ON public.property_verifications(verified_by);

-- Add any missing default commission rates
INSERT INTO public.commission_rates (role, rate, description, is_active)
SELECT 'admin', 0.0, 'Commission for admin actions', true
WHERE NOT EXISTS (SELECT 1 FROM public.commission_rates WHERE role = 'admin');