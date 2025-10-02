-- ============================================================================
-- Test Queries for EcoConnect Supply Chain Database
-- Run these in Supabase SQL Editor to verify setup
-- ============================================================================

-- ============================================================================
-- 1. VERIFY ALL TABLES EXIST
-- ============================================================================
-- This should return 16 rows (one for each table)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected tables:
-- addresses, carriers, cart_items, categories, departments, diy_articles,
-- global_settings, order_items, order_tracking_events, orders, product_variants,
-- products, seller_settings, services, user_profiles, wishlist


-- ============================================================================
-- 2. CHECK SAMPLE DATA
-- ============================================================================

-- Departments (should return 3)
SELECT id, name, slug FROM departments ORDER BY name;

-- Categories (should return 6)
SELECT id, name, slug, department_id FROM categories ORDER BY name;

-- Products (should return 3)
SELECT id, name, price, original_price, stock, brand FROM products ORDER BY name;

-- Carriers (should return 7)
SELECT id, name, code, is_active FROM carriers ORDER BY name;

-- Services (should return 2)
SELECT id, name, price, duration, category FROM services ORDER BY name;

-- DIY Articles (should return 2)
SELECT id, title, category, tags FROM diy_articles ORDER BY title;

-- Global Settings (should return 1)
SELECT id, default_tax_rate, default_shipping_cost, free_shipping_threshold
FROM global_settings;


-- ============================================================================
-- 3. VERIFY ROW LEVEL SECURITY (RLS) IS ENABLED
-- ============================================================================
-- This should return 16 rows (one for each table with RLS enabled)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;


-- ============================================================================
-- 4. CHECK RLS POLICIES COUNT
-- ============================================================================
-- This shows how many policies each table has
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;


-- ============================================================================
-- 5. VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================================================
-- This shows all foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;


-- ============================================================================
-- 6. VERIFY INDEXES
-- ============================================================================
-- This shows all indexes created for performance
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;


-- ============================================================================
-- 7. TEST PUBLIC READ ACCESS (Products)
-- ============================================================================
-- This should work without authentication
-- (Run this to test public access)
SELECT
    p.id,
    p.name,
    p.price,
    p.brand,
    c.name as category_name,
    d.name as department_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN departments d ON p.department_id = d.id
ORDER BY p.name;


-- ============================================================================
-- 8. GET PRODUCT WITH FULL DETAILS
-- ============================================================================
-- This demonstrates a complex query joining multiple tables
SELECT
    p.id,
    p.slug,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.images,
    p.brand,
    p.rating,
    p.review_count,
    p.stock,
    p.specifications,
    c.name as category_name,
    c.slug as category_slug,
    d.name as department_name,
    d.slug as department_slug,
    p.is_taxable,
    p.shipping_sla_days,
    p.express_shipping_days
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN departments d ON p.department_id = d.id
WHERE p.slug = 'cordless-drill-18v';


-- ============================================================================
-- 9. GET CATEGORIES WITH PRODUCT COUNTS
-- ============================================================================
SELECT
    c.id,
    c.name,
    c.slug,
    c.product_count,
    d.name as department_name
FROM categories c
LEFT JOIN departments d ON c.department_id = d.id
ORDER BY c.product_count DESC;


-- ============================================================================
-- 10. TEST CARRIER TRACKING URL TEMPLATE
-- ============================================================================
-- This shows how tracking URLs would be generated
SELECT
    name,
    code,
    REPLACE(tracking_url_template, '{tracking_number}', '1234567890') as sample_tracking_url
FROM carriers
WHERE is_active = true
ORDER BY name;


-- ============================================================================
-- 11. VERIFY GLOBAL SETTINGS
-- ============================================================================
-- This shows the default tax and shipping configuration
SELECT
    default_tax_rate as tax_rate_percent,
    default_shipping_cost as shipping_cost_dollars,
    free_shipping_threshold as free_shipping_at_dollars,
    apply_tax_to_shipping,
    created_at,
    updated_at
FROM global_settings
LIMIT 1;


-- ============================================================================
-- 12. TEST PRODUCT PRICING CALCULATIONS
-- ============================================================================
-- This demonstrates calculating final prices with tax
SELECT
    p.name,
    p.price as base_price,
    p.original_price as was_price,
    ROUND(p.price * (1 + (gs.default_tax_rate / 100)), 2) as price_with_tax,
    CASE
        WHEN p.original_price IS NOT NULL THEN
            ROUND(((p.original_price - p.price) / p.original_price) * 100, 0)
        ELSE 0
    END as discount_percentage,
    p.stock,
    CASE
        WHEN p.stock > 50 THEN 'In Stock'
        WHEN p.stock > 0 THEN 'Low Stock'
        ELSE 'Out of Stock'
    END as stock_status
FROM products p
CROSS JOIN global_settings gs
ORDER BY p.price DESC;


-- ============================================================================
-- 13. GET DEPARTMENTS WITH CATEGORIES AND PRODUCT COUNTS
-- ============================================================================
-- This shows the complete product hierarchy
SELECT
    d.name as department,
    d.slug as department_slug,
    COUNT(DISTINCT c.id) as category_count,
    SUM(c.product_count) as total_products
FROM departments d
LEFT JOIN categories c ON c.department_id = d.id
GROUP BY d.id, d.name, d.slug
ORDER BY d.name;


-- ============================================================================
-- 14. VALIDATE DATA INTEGRITY
-- ============================================================================
-- This checks for any products without valid categories or departments
SELECT
    'Products without category' as issue,
    COUNT(*) as count
FROM products
WHERE category_id IS NULL

UNION ALL

SELECT
    'Products without department' as issue,
    COUNT(*) as count
FROM products
WHERE department_id IS NULL

UNION ALL

SELECT
    'Categories without department' as issue,
    COUNT(*) as count
FROM categories
WHERE department_id IS NULL;


-- ============================================================================
-- 15. GET SERVICE OFFERINGS
-- ============================================================================
SELECT
    id,
    name,
    description,
    price,
    duration,
    category,
    slug
FROM services
ORDER BY price DESC;


-- ============================================================================
-- 16. GET DIY ARTICLES WITH TAGS
-- ============================================================================
SELECT
    id,
    title,
    excerpt,
    category,
    array_to_string(tags, ', ') as tags_list,
    author,
    published_at::date as published_date
FROM diy_articles
ORDER BY published_at DESC;


-- ============================================================================
-- SUMMARY CHECK - RUN THIS TO VERIFY EVERYTHING
-- ============================================================================
SELECT
    'Tables' as item,
    COUNT(*) as count,
    '16 expected' as note
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT
    'Departments' as item,
    COUNT(*) as count,
    '3 expected' as note
FROM departments

UNION ALL

SELECT
    'Categories' as item,
    COUNT(*) as count,
    '6 expected' as note
FROM categories

UNION ALL

SELECT
    'Products' as item,
    COUNT(*) as count,
    '3 expected' as note
FROM products

UNION ALL

SELECT
    'Carriers' as item,
    COUNT(*) as count,
    '7 expected' as note
FROM carriers

UNION ALL

SELECT
    'Services' as item,
    COUNT(*) as count,
    '2 expected' as note
FROM services

UNION ALL

SELECT
    'DIY Articles' as item,
    COUNT(*) as count,
    '2 expected' as note
FROM diy_articles

UNION ALL

SELECT
    'Global Settings' as item,
    COUNT(*) as count,
    '1 expected' as note
FROM global_settings

UNION ALL

SELECT
    'RLS Policies' as item,
    COUNT(*) as count,
    '35+ expected' as note
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
    'Indexes' as item,
    COUNT(*) as count,
    '19+ expected' as note
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%';


-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If all queries above run successfully, your database is properly set up!
-- Next steps:
-- 1. Run npm run db:check from your terminal
-- 2. Start the development server with npm run dev
-- 3. Register a user account
-- 4. Make yourself an admin (see README.md)
-- 5. Start building!
-- ============================================================================
