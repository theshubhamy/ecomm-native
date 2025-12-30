-- Fix RLS Policies for Seeding
-- Run this in Supabase SQL Editor if you're getting RLS policy violations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage products" ON products;
DROP POLICY IF EXISTS "Service role can manage offers" ON offers;

-- Add policies that allow service role to insert/update/delete
CREATE POLICY "Service role can manage categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage products" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage offers" ON offers
  FOR ALL USING (auth.role() = 'service_role');

-- Alternative: If you want to allow authenticated users to insert (for admin panel)
-- Uncomment these if you have an admin role or authenticated users who should manage data:

-- CREATE POLICY "Authenticated users can manage categories" ON categories
--   FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can manage products" ON products
--   FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can manage offers" ON offers
--   FOR ALL USING (auth.role() = 'authenticated');

