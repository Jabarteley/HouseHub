-- Add columns to properties table for multi-unit properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS available_units INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS property_subtype TEXT; -- e.g., 'Apartment Complex', 'Hostel', 'Dormitory'

-- Update RLS policy for property_images to allow property owners to manage images
DROP POLICY IF EXISTS "Enable insert for property owners" ON public.property_images;
DROP POLICY IF EXISTS "Enable update for property owners" ON public.property_images;
DROP POLICY IF EXISTS "Enable delete for property owners" ON public.property_images;

-- Add proper RLS policies for property_images based on property ownership
CREATE POLICY "Property images are viewable by everyone" ON public.property_images FOR 
  SELECT USING (true);
  
CREATE POLICY "Property owners can insert images for their properties" ON public.property_images FOR 
  INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update images for their properties" ON public.property_images FOR 
  UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can delete images for their properties" ON public.property_images FOR 
  DELETE USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

-- Create units table for individual rooms/apartments within a property
CREATE TABLE public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL, -- e.g., "Room 1A", "Flat 2B"
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Booked', 'Occupied', 'Maintenance', 'Inactive')),
  tenant_id UUID REFERENCES public.user_profiles(id),
  amenities JSONB,
  images TEXT[], -- Array of image URLs specific to this unit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.units IS 'Individual units/rooms within a property complex.';
COMMENT ON COLUMN public.units.status IS 'Unit availability status';

-- Create bookings table to track unit reservations
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.user_profiles(id),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled')),
  booking_date DATE DEFAULT CURRENT_DATE,
  duration INTEGER, -- Duration in months
  start_date DATE,
  end_date DATE,
  amount NUMERIC,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.bookings IS 'Booking requests for individual units.';
COMMENT ON COLUMN public.bookings.duration IS 'Duration of stay in months';
COMMENT ON COLUMN public.bookings.amount IS 'Rent amount for the booking';

-- Enable RLS for new tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for units table
CREATE POLICY "Units are viewable by everyone" ON public.units FOR 
  SELECT USING (true);

CREATE POLICY "Property owners can manage units for their properties" ON public.units FOR 
  ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = units.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

-- RLS Policies for bookings table
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR 
  SELECT USING (auth.uid() = client_id);

CREATE POLICY "Landlords can view bookings for their property units" ON public.bookings FOR 
  SELECT USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN properties ON properties.id = units.property_id
      WHERE units.id = bookings.unit_id 
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings for units" ON public.bookings FOR 
  INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings FOR 
  UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Users can delete their own bookings" ON public.bookings FOR 
  DELETE USING (auth.uid() = client_id);

-- Function to update property units count automatically
CREATE OR REPLACE FUNCTION update_property_units()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the available units count and property status
  UPDATE properties
  SET 
    available_units = (
      SELECT COUNT(*) 
      FROM units 
      WHERE property_id = NEW.property_id 
      AND status = 'Available'
    ),
    status = CASE
      WHEN (
        SELECT COUNT(*) 
        FROM units 
        WHERE property_id = NEW.property_id 
        AND status = 'Available'
      ) = 0 THEN 'Fully Booked'
      ELSE 'active'
    END
  WHERE id = NEW.property_id;

  -- Return the new row for INSERT/UPDATE operations
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update property units count
CREATE OR REPLACE TRIGGER after_unit_insert
  AFTER INSERT ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_property_units();

CREATE OR REPLACE TRIGGER after_unit_update
  AFTER UPDATE ON units
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_property_units();

CREATE OR REPLACE TRIGGER after_unit_delete
  AFTER DELETE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_property_units();

-- Update the property_applications table to reference units instead of properties for multi-unit properties
-- We'll add a unit_id column but keep it optional for backward compatibility
ALTER TABLE public.property_applications 
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE;

-- Update RLS for property_applications to handle unit-based applications
DROP POLICY IF EXISTS "Students can apply for properties" ON public.property_applications;
CREATE POLICY "Students can apply for properties or units" ON public.property_applications FOR 
  INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view their own applications" ON public.property_applications;
CREATE POLICY "Students can view their own applications" ON public.property_applications FOR 
  SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Landlords can view applications for their properties" ON public.property_applications;
CREATE POLICY "Landlords can view applications for their properties" ON public.property_applications FOR 
  SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_applications.property_id 
      AND properties.landlord_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM units
      JOIN properties ON properties.id = units.property_id
      WHERE units.id = property_applications.unit_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Update the property_inquiries table to reference units as well
ALTER TABLE public.property_inquiries 
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE;

-- Update RLS for property_inquiries to handle unit-based inquiries
DROP POLICY IF EXISTS "Students can create inquiries" ON public.property_inquiries;
CREATE POLICY "Students can create inquiries for properties or units" ON public.property_inquiries FOR 
  INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Landlords and Agents can view inquiries for their properties" ON public.property_inquiries;
CREATE POLICY "Landlords and Agents can view inquiries for their properties and units" ON public.property_inquiries FOR 
  SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_inquiries.property_id 
      AND (properties.landlord_id = auth.uid() OR properties.agent_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM units
      JOIN properties ON properties.id = units.property_id
      WHERE units.id = property_inquiries.unit_id
      AND (properties.landlord_id = auth.uid() OR properties.agent_id = auth.uid())
    )
  );