-- Helper function to check if a user is the landlord of a given property.
CREATE OR REPLACE FUNCTION public.properties_landlord_id_match(property_id_to_check bigint, user_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = property_id_to_check AND landlord_id = user_id_to_check
  );
END;
$$;

-- This policy allows a user to insert an image if they are the landlord of the property being referenced.
CREATE POLICY "Allow landlord to insert property images v3"
ON public.property_images
FOR INSERT
WITH CHECK ( public.properties_landlord_id_match(property_id, auth.uid()) );
