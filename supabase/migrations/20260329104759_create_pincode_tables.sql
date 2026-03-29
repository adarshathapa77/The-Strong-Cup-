/*
  # Create Pincode Search System Tables

  1. New Tables
    - `pincodes`
      - `id` (uuid, primary key)
      - `pincode` (varchar(6), unique, indexed)
      - `area` (text) - locality/area name
      - `city` (text, indexed)
      - `district` (text)
      - `state` (text, indexed)
      - `state_code` (varchar(2))
      - `is_serviceable` (boolean) - delivery available
      - `delivery_days` (integer) - estimated delivery time
      - `last_verified_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `pincode_searches`
      - `id` (uuid, primary key)
      - `search_query` (varchar(10), indexed)
      - `result_pincode` (varchar(6))
      - `searched_at` (timestamptz, indexed)
      - `user_session_id` (text)

  2. Security
    - Enable RLS on both tables
    - Add public read-only policies for pincodes
    - Add public insert policy for pincode_searches (analytics)

  3. Performance
    - Add indexes for fast pincode lookups
    - Add trigger for automatic updated_at timestamp
*/

-- Create pincodes table
CREATE TABLE IF NOT EXISTS pincodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode varchar(6) NOT NULL UNIQUE,
  area text,
  city text NOT NULL,
  district text,
  state text NOT NULL,
  state_code varchar(2),
  is_serviceable boolean DEFAULT true,
  delivery_days integer DEFAULT 5,
  last_verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast searches
CREATE INDEX IF NOT EXISTS idx_pincodes_pincode ON pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_pincodes_city ON pincodes(city);
CREATE INDEX IF NOT EXISTS idx_pincodes_state ON pincodes(state);
CREATE INDEX IF NOT EXISTS idx_pincodes_serviceable ON pincodes(is_serviceable);

-- Create pincode_searches table for analytics
CREATE TABLE IF NOT EXISTS pincode_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query varchar(10) NOT NULL,
  result_pincode varchar(6),
  searched_at timestamptz DEFAULT now(),
  user_session_id text
);

-- Create indexes for search analytics
CREATE INDEX IF NOT EXISTS idx_pincode_searches_query ON pincode_searches(search_query);
CREATE INDEX IF NOT EXISTS idx_pincode_searches_date ON pincode_searches(searched_at);

-- Enable Row Level Security
ALTER TABLE pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pincode_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pincodes (public read-only)
CREATE POLICY "Anyone can read pincodes"
  ON pincodes FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for pincode_searches (public insert for analytics)
CREATE POLICY "Anyone can insert searches"
  ON pincode_searches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read searches"
  ON pincode_searches FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_pincodes_updated_at ON pincodes;
CREATE TRIGGER update_pincodes_updated_at
  BEFORE UPDATE ON pincodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed some initial popular pincodes for testing
INSERT INTO pincodes (pincode, area, city, district, state, state_code, is_serviceable, delivery_days) VALUES
  ('110001', 'Connaught Place', 'New Delhi', 'Central Delhi', 'Delhi', 'DL', true, 2),
  ('400001', 'Fort', 'Mumbai', 'Mumbai City', 'Maharashtra', 'MH', true, 3),
  ('560001', 'Malleshwaram', 'Bangalore', 'Bangalore Urban', 'Karnataka', 'KA', true, 3),
  ('600001', 'Parrys', 'Chennai', 'Chennai', 'Tamil Nadu', 'TN', true, 3),
  ('700001', 'Dalhousie', 'Kolkata', 'Kolkata', 'West Bengal', 'WB', true, 4),
  ('781001', 'Fancy Bazar', 'Guwahati', 'Kamrup Metropolitan', 'Assam', 'AS', true, 2),
  ('781005', 'Ulubari', 'Guwahati', 'Kamrup Metropolitan', 'Assam', 'AS', true, 2),
  ('781006', 'Ganeshguri', 'Guwahati', 'Kamrup Metropolitan', 'Assam', 'AS', true, 2),
  ('781007', 'Hatigaon', 'Guwahati', 'Kamrup Metropolitan', 'Assam', 'AS', true, 2),
  ('781008', 'Beltola', 'Guwahati', 'Kamrup Metropolitan', 'Assam', 'AS', true, 2),
  ('110002', 'Bara Hindu Rao', 'New Delhi', 'North Delhi', 'Delhi', 'DL', true, 2),
  ('110003', 'Kamla Nagar', 'New Delhi', 'North Delhi', 'Delhi', 'DL', true, 2),
  ('400002', 'Kalbadevi', 'Mumbai', 'Mumbai City', 'Maharashtra', 'MH', true, 3),
  ('400003', 'Masjid', 'Mumbai', 'Mumbai City', 'Maharashtra', 'MH', true, 3),
  ('560002', 'Bangalore City', 'Bangalore', 'Bangalore Urban', 'Karnataka', 'KA', true, 3),
  ('560003', 'Shantinagar', 'Bangalore', 'Bangalore Urban', 'Karnataka', 'KA', true, 3),
  ('600002', 'Sowcarpet', 'Chennai', 'Chennai', 'Tamil Nadu', 'TN', true, 3),
  ('600003', 'Pudupet', 'Chennai', 'Chennai', 'Tamil Nadu', 'TN', true, 3),
  ('700002', 'Bowbazar', 'Kolkata', 'Kolkata', 'West Bengal', 'WB', true, 4),
  ('700003', 'Burrabazar', 'Kolkata', 'Kolkata', 'West Bengal', 'WB', true, 4)
ON CONFLICT (pincode) DO NOTHING;