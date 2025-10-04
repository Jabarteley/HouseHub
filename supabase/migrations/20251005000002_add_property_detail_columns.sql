-- Migration to add missing geolocation and property detail columns to properties table

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add latitude column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'latitude') THEN
    ALTER TABLE public.properties ADD COLUMN latitude DOUBLE PRECISION;
  END IF;

  -- Add longitude column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'longitude') THEN
    ALTER TABLE public.properties ADD COLUMN longitude DOUBLE PRECISION;
  END IF;

  -- Add year_built column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'year_built') THEN
    ALTER TABLE public.properties ADD COLUMN year_built INTEGER;
  END IF;

  -- Add lot_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'lot_size') THEN
    ALTER TABLE public.properties ADD COLUMN lot_size INTEGER;
  END IF;

  -- Add parking_spaces column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'parking_spaces') THEN
    ALTER TABLE public.properties ADD COLUMN parking_spaces INTEGER;
  END IF;

  -- Add days_on_market column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'days_on_market') THEN
    ALTER TABLE public.properties ADD COLUMN days_on_market INTEGER DEFAULT 0;
  END IF;

  -- Add mls column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'mls') THEN
    ALTER TABLE public.properties ADD COLUMN mls TEXT;
  END IF;

  -- Add amenities column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'amenities') THEN
    ALTER TABLE public.properties ADD COLUMN amenities JSONB;
  END IF;
END $$;

-- Create indexes for better geolocation queries
CREATE INDEX IF NOT EXISTS idx_properties_latitude ON public.properties(latitude);
CREATE INDEX IF NOT EXISTS idx_properties_longitude ON public.properties(longitude);
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON public.properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON public.properties(year_built);

-- Update existing properties with default values where needed
UPDATE public.properties 
SET days_on_market = COALESCE(days_on_market, 0) 
WHERE days_on_market IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.properties.latitude IS 'Property latitude coordinate for mapping';
COMMENT ON COLUMN public.properties.longitude IS 'Property longitude coordinate for mapping';
COMMENT ON COLUMN public.properties.year_built IS 'Year the property was constructed';
COMMENT ON COLUMN public.properties.lot_size IS 'Lot size in square feet';
COMMENT ON COLUMN public.properties.parking_spaces IS 'Number of parking spaces available';
COMMENT ON COLUMN public.properties.days_on_market IS 'Number of days the property has been listed';
COMMENT ON COLUMN public.properties.mls IS 'Multiple Listing Service number';
COMMENT ON COLUMN public.properties.amenities IS 'List of property amenities as JSON array';