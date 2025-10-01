/*
  # Add Delivery Tracking and Tax Registration System

  1. Schema Changes
    **Seller Settings Enhancements:**
    - Add `tax_registration_number` (text) - General tax registration ID
    - Add `gstin` (text) - Goods and Services Tax Identification Number (India)
    - Add `vat_id` (text) - VAT registration number (Europe/other regions)
    - Add `tax_inclusive_pricing` (boolean) - Whether prices include tax or not

    **Orders Table Enhancements:**
    - Add `tracking_number` (text) - Shipment tracking number
    - Add `carrier` (text) - Shipping carrier/courier name
    - Add `delivery_type` (text) - standard, express, prime, scheduled
    - Add `estimated_delivery_date` (timestamptz) - Expected delivery date
    - Add `fulfillment_method` (text) - platform or self (fulfilled by platform or seller)
    - Add `actual_delivery_date` (timestamptz) - Actual delivery date when completed

    **Products Table Enhancements:**
    - Add `shipping_sla_days` (integer) - Standard shipping SLA in days
    - Add `express_shipping_days` (integer) - Express shipping SLA in days

    **New Tables:**
    - `carriers` - Supported shipping carriers/couriers
    - `order_tracking_events` - Delivery tracking timeline events

  2. Security
    - Enable RLS on new tables
    - Add appropriate policies for sellers, admins, and users

  3. Features
    - Complete delivery tracking system
    - Seller tax registration management
    - Fulfillment method tracking (platform vs seller)
    - Multiple shipping carrier support
    - Delivery SLA management
*/

-- Add seller tax registration fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'tax_registration_number'
  ) THEN
    ALTER TABLE seller_settings ADD COLUMN tax_registration_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'gstin'
  ) THEN
    ALTER TABLE seller_settings ADD COLUMN gstin text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'vat_id'
  ) THEN
    ALTER TABLE seller_settings ADD COLUMN vat_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'tax_inclusive_pricing'
  ) THEN
    ALTER TABLE seller_settings ADD COLUMN tax_inclusive_pricing boolean DEFAULT false;
  END IF;
END $$;

-- Add delivery tracking fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'carrier'
  ) THEN
    ALTER TABLE orders ADD COLUMN carrier text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_type text DEFAULT 'standard' CHECK (delivery_type IN ('standard', 'express', 'prime', 'scheduled'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'estimated_delivery_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'fulfillment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN fulfillment_method text DEFAULT 'self' CHECK (fulfillment_method IN ('platform', 'self'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'actual_delivery_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN actual_delivery_date timestamptz;
  END IF;
END $$;

-- Add shipping SLA fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'shipping_sla_days'
  ) THEN
    ALTER TABLE products ADD COLUMN shipping_sla_days integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'express_shipping_days'
  ) THEN
    ALTER TABLE products ADD COLUMN express_shipping_days integer DEFAULT 2;
  END IF;
END $$;

-- Create carriers table
CREATE TABLE IF NOT EXISTS carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  tracking_url_template text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on carriers
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;

-- Policies for carriers (public read, admin manage)
CREATE POLICY "Anyone can read active carriers"
  ON carriers
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage carriers"
  ON carriers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

-- Create order tracking events table
CREATE TABLE IF NOT EXISTS order_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('created', 'confirmed', 'processing', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled')),
  event_description text,
  location text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on order tracking events
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Policies for order tracking events
CREATE POLICY "Users can read own order tracking events"
  ON order_tracking_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_tracking_events.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tracking events"
  ON order_tracking_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Sellers can manage tracking for their product orders"
  ON order_tracking_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN orders o ON o.id = order_tracking_events.order_id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE up.id = auth.uid()
      AND up.role = 'seller'
      AND p.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN orders o ON o.id = order_tracking_events.order_id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE up.id = auth.uid()
      AND up.role = 'seller'
      AND p.seller_id = auth.uid()
    )
  );

-- Insert default carriers
INSERT INTO carriers (name, code, tracking_url_template, is_active) VALUES
  ('FedEx', 'FEDEX', 'https://www.fedex.com/fedextrack/?tracknumbers={tracking_number}', true),
  ('DHL', 'DHL', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}', true),
  ('UPS', 'UPS', 'https://www.ups.com/track?tracknum={tracking_number}', true),
  ('USPS', 'USPS', 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking_number}', true),
  ('Amazon Logistics', 'AMAZON', 'https://track.amazon.com/tracking/{tracking_number}', true),
  ('Australia Post', 'AUSPOST', 'https://auspost.com.au/mypost/track/#/details/{tracking_number}', true),
  ('Self Delivery', 'SELF', null, true)
ON CONFLICT (code) DO NOTHING;

-- Add policy for sellers to update orders containing their products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Sellers can update orders with their products'
  ) THEN
    CREATE POLICY "Sellers can update orders with their products"
      ON orders
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN order_items oi ON oi.order_id = orders.id
          JOIN products p ON p.id = oi.product_id
          WHERE up.id = auth.uid()
          AND up.role = 'seller'
          AND p.seller_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN order_items oi ON oi.order_id = orders.id
          JOIN products p ON p.id = oi.product_id
          WHERE up.id = auth.uid()
          AND up.role = 'seller'
          AND p.seller_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Add policy for sellers to view orders containing their products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Sellers can read orders with their products'
  ) THEN
    CREATE POLICY "Sellers can read orders with their products"
      ON orders
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN order_items oi ON oi.order_id = orders.id
          JOIN products p ON p.id = oi.product_id
          WHERE up.id = auth.uid()
          AND up.role = 'seller'
          AND p.seller_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create index for better performance on order queries by seller
CREATE INDEX IF NOT EXISTS idx_order_items_product_seller
ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_products_seller
ON products(seller_id);

CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order
ON order_tracking_events(order_id, created_at DESC);
