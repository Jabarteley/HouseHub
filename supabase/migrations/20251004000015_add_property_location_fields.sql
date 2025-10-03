-- Add location and property details columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS year_built int,
ADD COLUMN IF NOT EXISTS lot_size int,
ADD COLUMN IF NOT EXISTS parking_spaces int,
ADD COLUMN IF NOT EXISTS amenities jsonb,
ADD COLUMN IF NOT EXISTS mls text,
ADD COLUMN IF NOT EXISTS days_on_market int;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_latitude ON public.properties(latitude);
CREATE INDEX IF NOT EXISTS idx_properties_longitude ON public.properties(longitude);
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON public.properties(year_built);