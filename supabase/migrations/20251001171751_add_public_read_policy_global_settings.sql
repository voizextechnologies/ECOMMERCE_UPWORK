/*
  # Add Public Read Policy for Global Settings

  ## Summary
  Add a public read policy to global_settings table so the settings can be accessed for calculations.

  ## Changes Made
  
  1. **Add Public Read Policy**
     - Allow anyone to read global settings
     - Needed for tax and shipping calculations on the frontend
  
  ## Security
  - Read-only access for public
  - Write access still restricted to admins only
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can read global settings" ON global_settings;

-- Add public read policy
CREATE POLICY "Public can read global settings"
ON global_settings
FOR SELECT
TO public
USING (true);