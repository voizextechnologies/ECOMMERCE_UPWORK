# Database Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the complete EcoConnect Supply Chain database in Supabase.

## Prerequisites

- A Supabase account (free tier works)
- Access to your Supabase project dashboard

## Database Architecture

The database includes **16 core tables** organized into 4 main categories:

### 1. Product Management (4 tables)
- `departments` - Top-level product categories
- `categories` - Sub-categories within departments
- `products` - Main products catalog
- `product_variants` - Product variations (size, color, material, etc.)

### 2. User Management (4 tables)
- `user_profiles` - Extended user information (roles: customer, seller, admin)
- `addresses` - Shipping and billing addresses
- `cart_items` - Shopping cart contents
- `wishlist` - Saved/favorited products

### 3. Order Management (4 tables)
- `orders` - Customer orders with delivery tracking
- `order_items` - Line items within orders
- `carriers` - Shipping carriers (FedEx, DHL, UPS, etc.)
- `order_tracking_events` - Delivery timeline events

### 4. Configuration & Content (4 tables)
- `global_settings` - Platform-wide tax and shipping defaults
- `seller_settings` - Seller-specific overrides
- `services` - Professional services (installation, consultation)
- `diy_articles` - DIY guides and tutorials

## Migration File

The complete database schema is in:
```
supabase/migrations/20251002000000_complete_database_setup.sql
```

This migration file includes:
- All table definitions with proper data types and constraints
- Complete Row Level Security (RLS) policies
- Indexes for optimized queries
- Sample data for testing (3 departments, 6 categories, 3 products, 7 carriers, etc.)

## Setup Instructions

### Option 1: Supabase Dashboard (Recommended)

1. **Open your Supabase project**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Execute the migration**
   - Open `supabase/migrations/20251002000000_complete_database_setup.sql` in your code editor
   - Copy the entire file contents
   - Paste into the Supabase SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify the setup**
   - Go to "Database" → "Tables" in the sidebar
   - You should see all 16 tables listed
   - Click on any table to verify it has data

### Option 2: Supabase CLI

If you have the Supabase CLI installed locally:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Option 3: Using Supabase Studio

1. Open your local Supabase Studio
2. Navigate to SQL Editor
3. Load the migration file
4. Execute it

## Verifying the Setup

### Check Tables Exist

In the Supabase Dashboard, go to Database → Tables. You should see:

- ✓ departments
- ✓ categories
- ✓ products
- ✓ product_variants
- ✓ user_profiles
- ✓ addresses
- ✓ cart_items
- ✓ wishlist
- ✓ orders
- ✓ order_items
- ✓ carriers
- ✓ order_tracking_events
- ✓ global_settings
- ✓ seller_settings
- ✓ services
- ✓ diy_articles

### Check Sample Data

Execute these queries in the SQL Editor to verify sample data was inserted:

```sql
-- Check departments
SELECT COUNT(*) FROM departments;
-- Expected: 3 records

-- Check categories
SELECT COUNT(*) FROM categories;
-- Expected: 6 records

-- Check products
SELECT COUNT(*) FROM products;
-- Expected: 3 records

-- Check carriers
SELECT COUNT(*) FROM carriers;
-- Expected: 7 records

-- Check global settings
SELECT * FROM global_settings;
-- Expected: 1 record with default tax rate (10%) and shipping ($9.95)
```

### Check RLS Policies

In Database → Tables, click on any table and check the "Policies" tab. Each table should have appropriate RLS policies enabled.

## Security Configuration

### Public Access (No Authentication Required)
These tables are readable by anyone:
- departments, categories, products, product_variants
- services, diy_articles
- global_settings (read-only)
- carriers (active carriers only)

### Authenticated User Access
Users can manage their own:
- user_profiles (own profile)
- addresses (own addresses)
- cart_items (own cart)
- wishlist (own wishlist)
- orders (own orders - read/create only)

### Seller Access
Sellers can:
- Manage their own products
- View orders containing their products
- Update tracking information for their product orders
- Manage their seller settings

### Admin Access
Admins have full access to:
- All tables
- All user profiles
- Global settings
- Carrier management

## Sample Data Details

### Departments (3)
1. Building & Hardware
2. Tools & Equipment
3. Garden & Outdoor

### Categories (6)
- Fasteners & Fixings (Building & Hardware)
- Timber & Lumber (Building & Hardware)
- Power Tools (Tools & Equipment)
- Hand Tools (Tools & Equipment)
- Gardening (Garden & Outdoor)
- Outdoor Furniture (Garden & Outdoor)

### Products (3)
1. Premium Concrete Mix 50kg - $12.95
2. 18V Cordless Drill with Battery - $149.99
3. 30m Heavy Duty Garden Hose - $89.99

### Carriers (7)
- FedEx
- DHL
- UPS
- USPS
- Amazon Logistics
- Australia Post
- Self Delivery

### Global Settings
- Default Tax Rate: 10%
- Default Shipping Cost: $9.95
- Free Shipping Threshold: $99.00
- Apply Tax to Shipping: No

## Environment Variables

Ensure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in:
- Supabase Dashboard → Settings → API

## Troubleshooting

### Issue: "relation does not exist" error

**Solution:** The table hasn't been created. Re-run the migration SQL.

### Issue: "permission denied" error

**Solution:** Check that Row Level Security policies are correctly configured. Verify your user role in the `user_profiles` table.

### Issue: Can't insert data

**Solution:**
1. Check RLS policies for the table
2. Ensure you're authenticated
3. Verify the foreign key relationships exist

### Issue: Migration fails partway through

**Solution:**
1. Check for syntax errors in the SQL
2. Drop any partially created tables
3. Re-run the entire migration

## Next Steps

After successfully setting up the database:

1. **Create an admin user**
   ```sql
   -- After signing up through your app, run this to make yourself an admin:
   INSERT INTO user_profiles (id, first_name, last_name, role)
   VALUES ('your-auth-user-id', 'Your', 'Name', 'admin')
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```

2. **Test the API endpoints**
   - Products listing: `GET /products`
   - Categories: `GET /categories`
   - Departments: `GET /departments`

3. **Verify authentication flow**
   - Sign up
   - Sign in
   - User profile creation

4. **Test cart functionality**
   - Add items to cart
   - Update quantities
   - Remove items

5. **Test order creation**
   - Create order
   - View order history
   - Track order status

## Database Maintenance

### Backing Up

Use Supabase's built-in backup feature:
- Dashboard → Database → Backups

### Monitoring

Check database performance:
- Dashboard → Database → Performance

### Updating Schema

For future schema changes:
1. Create new migration files
2. Use incremental migrations (don't recreate tables)
3. Test on staging environment first

## Support

For issues related to:
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Database setup**: Check this guide and the migration file comments
- **RLS policies**: [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** 2025-10-02
**Migration Version:** 20251002000000_complete_database_setup.sql
