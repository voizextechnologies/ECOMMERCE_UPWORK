/*
  # Fixed EcoConnect Supply Chain Database Setup

  This migration creates all tables in the correct order to avoid dependency issues.
  Tables that are referenced in RLS policies are created first.
*/

-- ============================================================================
-- USER PROFILES TABLE (MUST BE FIRST - referenced by other policies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- DEPARTMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to departments"
  ON departments FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage departments"
  ON departments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'seller')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'seller')
    )
  );

CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  product_count integer DEFAULT 0,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage categories"
  ON categories FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'seller')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'seller')
    )
  );

CREATE INDEX IF NOT EXISTS idx_categories_department ON categories(department_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  images text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  brand text DEFAULT '',
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  specifications jsonb DEFAULT '{}',
  seller_id uuid REFERENCES auth.users(id),
  is_taxable boolean DEFAULT true,
  is_shipping_exempt boolean DEFAULT false,
  override_global_settings boolean DEFAULT false,
  custom_tax_rate numeric(5,2),
  custom_shipping_cost numeric(10,2),
  shipping_sla_days integer DEFAULT 5,
  express_shipping_days integer DEFAULT 2,
  discount_type text CHECK (discount_type IN ('percentage', 'flat_amount')),
  discount_value numeric(10,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage products"
  ON products FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.role = 'admin' OR (user_profiles.role = 'seller' AND products.seller_id = auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.role = 'admin' OR (user_profiles.role = 'seller' AND products.seller_id = auth.uid()))
    )
  );

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department ON products(department_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);

-- ============================================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  attributes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to product variants"
  ON product_variants FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage product variants"
  ON product_variants FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN products p ON p.id = product_variants.product_id
      WHERE up.id = auth.uid()
      AND (up.role = 'admin' OR (up.role = 'seller' AND p.seller_id = auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN products p ON p.id = product_variants.product_id
      WHERE up.id = auth.uid()
      AND (up.role = 'admin' OR (up.role = 'seller' AND p.seller_id = auth.uid()))
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- ============================================================================
-- ADDRESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('billing', 'shipping')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  address1 text NOT NULL,
  address2 text,
  city text NOT NULL,
  state text NOT NULL,
  postcode text NOT NULL,
  country text NOT NULL DEFAULT 'Australia',
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ============================================================================
-- CART ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- ============================================================================
-- WISHLIST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlist FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) NOT NULL,
  shipping_address_id uuid REFERENCES addresses(id),
  billing_address_id uuid REFERENCES addresses(id),
  delivery_method text DEFAULT 'shipping' CHECK (delivery_method IN ('shipping', 'click-collect')),
  tracking_number text,
  carrier text,
  delivery_type text DEFAULT 'standard' CHECK (delivery_type IN ('standard', 'express', 'prime', 'scheduled')),
  estimated_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  fulfillment_method text DEFAULT 'self' CHECK (fulfillment_method IN ('platform', 'self')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seller policies will be added after order_items table is created

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL TO authenticated
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

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL TO authenticated
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

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================================================
-- ADD SELLER POLICIES TO ORDERS (After order_items exists)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Sellers can read orders with their products'
  ) THEN
    CREATE POLICY "Sellers can read orders with their products"
      ON orders FOR SELECT TO authenticated
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

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Sellers can update orders with their products'
  ) THEN
    CREATE POLICY "Sellers can update orders with their products"
      ON orders FOR UPDATE TO authenticated
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

-- ============================================================================
-- CARRIERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  tracking_url_template text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active carriers"
  ON carriers FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage carriers"
  ON carriers FOR ALL TO authenticated
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

-- ============================================================================
-- ORDER TRACKING EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('created', 'confirmed', 'processing', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled')),
  event_description text,
  location text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order tracking events"
  ON order_tracking_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_tracking_events.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tracking events"
  ON order_tracking_events FOR ALL TO authenticated
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
  ON order_tracking_events FOR ALL TO authenticated
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

CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order ON order_tracking_events(order_id, created_at DESC);

-- ============================================================================
-- GLOBAL SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_tax_rate numeric(5,2) DEFAULT 10.00,
  default_shipping_cost numeric(10,2) DEFAULT 9.95,
  free_shipping_threshold numeric(10,2) DEFAULT 99.00,
  apply_tax_to_shipping boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read global settings"
  ON global_settings FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage global settings"
  ON global_settings FOR ALL TO authenticated
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

-- ============================================================================
-- SELLER SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS seller_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name text DEFAULT '',
  business_abn text DEFAULT '',
  default_tax_rate numeric(5,2),
  default_shipping_cost numeric(10,2),
  override_global_tax boolean DEFAULT false,
  override_global_shipping boolean DEFAULT false,
  tax_registration_number text,
  gstin text,
  vat_id text,
  tax_inclusive_pricing boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seller_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage own settings"
  ON seller_settings FOR ALL TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all seller settings"
  ON seller_settings FOR ALL TO authenticated
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

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  price numeric(10,2) NOT NULL,
  duration text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to services"
  ON services FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage services"
  ON services FOR ALL TO authenticated
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

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- ============================================================================
-- DIY ARTICLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS diy_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  featured_image text DEFAULT '',
  author text DEFAULT '',
  published_at timestamptz DEFAULT now(),
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diy_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to DIY articles"
  ON diy_articles FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to manage DIY articles"
  ON diy_articles FOR ALL TO authenticated
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

CREATE INDEX IF NOT EXISTS idx_diy_articles_slug ON diy_articles(slug);

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

INSERT INTO global_settings (id, default_tax_rate, default_shipping_cost, free_shipping_threshold, apply_tax_to_shipping)
VALUES ('00000000-0000-0000-0000-000000000001', 10.00, 9.95, 99.00, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO carriers (name, code, tracking_url_template, is_active) VALUES
  ('FedEx', 'FEDEX', 'https://www.fedex.com/fedextrack/?tracknumbers={tracking_number}', true),
  ('DHL', 'DHL', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}', true),
  ('UPS', 'UPS', 'https://www.ups.com/track?tracknum={tracking_number}', true),
  ('USPS', 'USPS', 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking_number}', true),
  ('Amazon Logistics', 'AMAZON', 'https://track.amazon.com/tracking/{tracking_number}', true),
  ('Australia Post', 'AUSPOST', 'https://auspost.com.au/mypost/track/#/details/{tracking_number}', true),
  ('Self Delivery', 'SELF', null, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (id, slug, name, description, image) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'building-hardware', 'Building & Hardware', 'Essential building materials and hardware supplies', 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'tools-equipment', 'Tools & Equipment', 'Professional tools for every job', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440003', 'garden-outdoor', 'Garden & Outdoor', 'Everything for your outdoor spaces', 'https://images.pexels.com/photos/296230/pexels-photo-296230.jpeg')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, slug, name, description, department_id, product_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'fasteners', 'Fasteners & Fixings', 'Screws, nails, bolts and more', '550e8400-e29b-41d4-a716-446655440001', 245),
  ('550e8400-e29b-41d4-a716-446655440012', 'timber', 'Timber & Lumber', 'Quality timber for all projects', '550e8400-e29b-41d4-a716-446655440001', 189),
  ('550e8400-e29b-41d4-a716-446655440013', 'power-tools', 'Power Tools', 'Professional grade power tools', '550e8400-e29b-41d4-a716-446655440002', 156),
  ('550e8400-e29b-41d4-a716-446655440014', 'hand-tools', 'Hand Tools', 'Essential hand tools', '550e8400-e29b-41d4-a716-446655440002', 298),
  ('550e8400-e29b-41d4-a716-446655440015', 'gardening', 'Gardening', 'Tools and supplies for gardening', '550e8400-e29b-41d4-a716-446655440003', 167),
  ('550e8400-e29b-41d4-a716-446655440016', 'outdoor-furniture', 'Outdoor Furniture', 'Furniture for outdoor living', '550e8400-e29b-41d4-a716-446655440003', 89)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, slug, name, description, price, original_price, images, category_id, department_id, brand, rating, review_count, stock, specifications) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'concrete-mix-50kg', 'Premium Concrete Mix 50kg', 'High-strength concrete mix suitable for foundations, driveways, and general construction projects.', 12.95, 15.95, ARRAY['https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg'], '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'BuildPro', 4.5, 127, 45, '{"Weight": "50kg", "Coverage": "25L when mixed", "Setting Time": "2-4 hours", "Compressive Strength": "25MPa"}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440022', 'cordless-drill-18v', '18V Cordless Drill with Battery', 'Professional cordless drill with lithium-ion battery and 13mm keyless chuck.', 149.99, NULL, ARRAY['https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'], '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'PowerMax', 4.8, 89, 23, '{"Voltage": "18V", "Chuck Size": "13mm", "Battery Type": "Lithium-ion", "Torque Settings": "21", "Weight": "1.6kg"}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440023', 'garden-hose-30m', '30m Heavy Duty Garden Hose', 'Durable garden hose with brass fittings and kink-resistant design.', 89.99, 109.99, ARRAY['https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg'], '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'FlowPro', 4.3, 56, 18, '{"Length": "30m", "Diameter": "12mm", "Material": "Reinforced PVC", "Fittings": "Brass", "Warranty": "5 years"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (id, slug, name, description, image, price, duration, category) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', 'kitchen-installation', 'Kitchen Installation Service', 'Professional kitchen installation by certified tradespeople', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 299.00, '1-2 days', 'Installation'),
  ('550e8400-e29b-41d4-a716-446655440032', 'garden-design', 'Garden Design Consultation', 'Expert garden design and landscaping advice', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 150.00, '2-3 hours', 'Consultation')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO diy_articles (id, slug, title, excerpt, content, featured_image, author, category, tags) VALUES
  ('550e8400-e29b-41d4-a716-446655440041', 'build-garden-deck', 'How to Build a Garden Deck', 'Step-by-step guide to building your own garden deck', 'A comprehensive guide to building a beautiful garden deck...', 'https://images.pexels.com/photos/1105325/pexels-photo-1105325.jpeg', 'BuildMart Team', 'Outdoor Projects', ARRAY['deck', 'garden', 'diy', 'outdoor']),
  ('550e8400-e29b-41d4-a716-446655440042', 'organize-garage-storage', 'Garage Storage Solutions', 'Maximize your garage space with smart storage ideas', 'Transform your cluttered garage into an organized space...', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 'BuildMart Team', 'Storage', ARRAY['garage', 'storage', 'organization', 'diy'])
ON CONFLICT (slug) DO NOTHING;
