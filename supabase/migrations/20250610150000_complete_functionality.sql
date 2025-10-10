-- Add missing functionality to existing tables and create new ones

-- Enable Row Level Security (RLS) for agent_requests if not already enabled
ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for agent requests
CREATE POLICY "Landlords can manage their agent requests"
  ON agent_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = agent_requests.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Agents can view their own requests"
  ON agent_requests
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Agents can update their own requests"
  ON agent_requests
  FOR UPDATE TO authenticated
  USING (agent_id = auth.uid());



-- Create property_wishlist table (with correct data types for foreign keys)
CREATE TABLE IF NOT EXISTS property_wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    property_id BIGINT REFERENCES properties(id), -- Using BIGINT to match properties.id type
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'booking', 'message', 'review', 'payment', 'application')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create property_applications table
CREATE TABLE IF NOT EXISTS property_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id),
    property_id BIGINT REFERENCES properties(id), -- Using BIGINT to match properties.id type
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'withdrawn')),
    message TEXT,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    property_id BIGINT REFERENCES properties(id), -- Using BIGINT to match properties.id type
    agent_id UUID REFERENCES auth.users(id), -- For agent reviews
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    review_type TEXT DEFAULT 'property' CHECK (review_type IN ('property', 'agent', 'landlord')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create property_showings table
CREATE TABLE IF NOT EXISTS property_showings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE, -- Using BIGINT to match properties.id type
    student_id UUID REFERENCES auth.users(id),
    scheduled_date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE property_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_showings ENABLE ROW LEVEL SECURITY;

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

-- Create policies for reviews
CREATE POLICY "Users can manage their own reviews" ON reviews
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Everyone can view reviews" ON reviews
  FOR SELECT TO authenticated
  USING (true);

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