-- Add geolocation columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS year_built integer,
ADD COLUMN IF NOT EXISTS lot_size integer,
ADD COLUMN IF NOT EXISTS parking_spaces integer,
ADD COLUMN IF NOT EXISTS days_on_market integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS mls text,
ADD COLUMN IF NOT EXISTS amenities jsonb; -- Store as array of strings

-- Create indexes for better geolocation queries
CREATE INDEX IF NOT EXISTS idx_properties_latitude ON public.properties(latitude);
CREATE INDEX IF NOT EXISTS idx_properties_longitude ON public.properties(longitude);
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON public.properties(latitude, longitude);