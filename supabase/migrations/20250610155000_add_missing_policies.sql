-- Add any missing policies for the new tables that may not have been created due to conflicts

-- Check and add policies for agent_requests if they don't exist (using DO block to avoid errors)
DO $$
BEGIN
  -- Check if policy already exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'agent_requests' 
    AND policyname = 'Landlords can manage their agent requests'
  ) THEN
    CREATE POLICY "Landlords can manage their agent requests" ON agent_requests
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM properties 
          WHERE properties.id = agent_requests.property_id
          AND properties.landlord_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'agent_requests' 
    AND policyname = 'Agents can view their own requests'
  ) THEN
    CREATE POLICY "Agents can view their own requests" ON agent_requests
      FOR SELECT TO authenticated
      USING (agent_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'agent_requests' 
    AND policyname = 'Agents can update their own requests'
  ) THEN
    CREATE POLICY "Agents can update their own requests" ON agent_requests
      FOR UPDATE TO authenticated
      USING (agent_id = auth.uid());
  END IF;

  -- Add policies for wishlist if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'property_wishlist' 
    AND policyname = 'Users can manage their own wishlist'
  ) THEN
    CREATE POLICY "Users can manage their own wishlist" ON property_wishlist
      FOR ALL TO authenticated
      USING (user_id = auth.uid());
  END IF;

  -- Add policies for notifications if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Users can manage their own notifications'
  ) THEN
    CREATE POLICY "Users can manage their own notifications" ON notifications
      FOR ALL TO authenticated
      USING (user_id = auth.uid());
  END IF;

  -- Add policies for applications if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'property_applications' 
    AND policyname = 'Students can manage their own applications'
  ) THEN
    CREATE POLICY "Students can manage their own applications" ON property_applications
      FOR ALL TO authenticated
      USING (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'property_applications' 
    AND policyname = 'Property owners can view applications for their properties'
  ) THEN
    CREATE POLICY "Property owners can view applications for their properties" ON property_applications
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM properties
          WHERE properties.id = property_applications.property_id
          AND properties.landlord_id = auth.uid()
        )
      );
  END IF;

  -- Add policies for reviews if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND policyname = 'Users can manage their own reviews'
  ) THEN
    CREATE POLICY "Users can manage their own reviews" ON reviews
      FOR ALL TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND policyname = 'Everyone can view reviews'
  ) THEN
    CREATE POLICY "Everyone can view reviews" ON reviews
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  -- Add policies for property showings if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'property_showings' 
    AND policyname = 'Property owners can manage showings for their properties'
  ) THEN
    CREATE POLICY "Property owners can manage showings for their properties" ON property_showings
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM properties
          WHERE properties.id = property_showings.property_id
          AND properties.landlord_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'property_showings' 
    AND policyname = 'Students can view their own showings'
  ) THEN
    CREATE POLICY "Students can view their own showings" ON property_showings
      FOR ALL TO authenticated
      USING (student_id = auth.uid());
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key constraint for property_wishlist if it doesn't exist
  BEGIN
    ALTER TABLE property_wishlist ADD CONSTRAINT property_wishlist_property_id_fkey 
      FOREIGN KEY (property_id) REFERENCES properties(id);
  EXCEPTION
    WHEN duplicate_object THEN
      -- Foreign key already exists, do nothing
      NULL;
  END;

  -- Add foreign key constraint for property_applications if it doesn't exist
  BEGIN
    ALTER TABLE property_applications ADD CONSTRAINT property_applications_property_id_fkey 
      FOREIGN KEY (property_id) REFERENCES properties(id);
  EXCEPTION
    WHEN duplicate_object THEN
      -- Foreign key already exists, do nothing
      NULL;
  END;

  -- Add foreign key constraint for reviews if it doesn't exist
  BEGIN
    ALTER TABLE reviews ADD CONSTRAINT reviews_property_id_fkey 
      FOREIGN KEY (property_id) REFERENCES properties(id);
  EXCEPTION
    WHEN duplicate_object THEN
      -- Foreign key already exists, do nothing
      NULL;
  END;

  -- Add foreign key constraint for property_showings if it doesn't exist
  BEGIN
    ALTER TABLE property_showings ADD CONSTRAINT property_showings_property_id_fkey 
      FOREIGN KEY (property_id) REFERENCES properties(id);
  EXCEPTION
    WHEN duplicate_object THEN
      -- Foreign key already exists, do nothing
      NULL;
  END;
END $$;