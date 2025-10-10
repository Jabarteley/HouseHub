-- Add missing columns for admin dashboard functionality

-- Extend the user_role enum to include new roles if it exists
DO $ 
BEGIN
    -- Check if the enum type exists and add new values if needed
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'verifier';
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'moderator';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $;

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Add featured columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add missing columns to support_tickets table
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id);

-- Add missing columns to property_inquiries table
ALTER TABLE property_inquiries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create activity log table (optional, for better tracking)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'property', 'user', etc.
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create commission_rates table if it doesn't exist
CREATE TABLE IF NOT EXISTS commission_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role TEXT NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER DEFAULT 1,
    features TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    property_id UUID REFERENCES properties(id),
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'paid', 'refunded')),
    transaction_type TEXT DEFAULT 'payment',
    reference_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create flags table if it doesn't exist
CREATE TABLE IF NOT EXISTS flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_type TEXT NOT NULL, -- 'property', 'user', 'review', etc.
    item_id UUID NOT NULL,
    reporter_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create agent_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES auth.users(id),
    requested_by UUID REFERENCES auth.users(id), -- Landlord who requested
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    message TEXT,
    requested_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP,
    responded_by UUID REFERENCES auth.users(id)
);

-- Create property_showings table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_showings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id),
    scheduled_date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create support_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS) policies as needed
-- These are examples and should be adjusted based on your specific security requirements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_showings ENABLE ROW LEVEL SECURITY;

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    property_id UUID REFERENCES properties(id),
    agent_id UUID REFERENCES auth.users(id), -- For agent reviews
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    review_type TEXT DEFAULT 'property' CHECK (review_type IN ('property', 'agent', 'landlord')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create property_wishlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    property_id UUID REFERENCES properties(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'booking', 'message', 'review', 'payment', 'application')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create property_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id),
    property_id UUID REFERENCES properties(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'withdrawn')),
    message TEXT,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- Create policies for admin access
CREATE POLICY "Admin can manage announcements" ON announcements 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Admin can manage banners" ON banners 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

-- Create policies for reviews
CREATE POLICY "Users can manage their own reviews" ON reviews
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Everyone can view reviews" ON reviews
  FOR SELECT TO authenticated
  USING (true);

-- Create policies for wishlist
CREATE POLICY "Users can manage their own wishlist" ON property_wishlist
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Create policies for notifications
CREATE POLICY "Users can manage their own notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Create policies for applications
CREATE POLICY "Students can manage their own applications" ON property_applications
  FOR ALL TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Property owners can view applications for their properties" ON property_applications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Create policies for agent requests
CREATE POLICY "Landlords can manage their agent requests" ON agent_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = agent_requests.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Agents can view their own requests" ON agent_requests
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Agents can update their own requests" ON agent_requests
  FOR UPDATE TO authenticated
  USING (agent_id = auth.uid());

-- Create policies for property showings
CREATE POLICY "Property owners can manage showings for their properties" ON property_showings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_showings.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own showings" ON property_showings
  FOR ALL TO authenticated
  USING (student_id = auth.uid());