
CREATE POLICY "Authenticated users can insert property verifications" ON public.property_verifications
FOR INSERT TO authenticated
WITH CHECK (true);
