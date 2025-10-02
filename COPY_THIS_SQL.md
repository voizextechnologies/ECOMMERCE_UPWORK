# 🚀 COPY THIS SQL TO CREATE YOUR DATABASE

## Step 1: Copy the SQL Below

The migration SQL is in this file:
```
supabase/migrations/20251002000000_complete_database_setup.sql
```

## Step 2: Where to Paste It

Since you're using Bolt with Supabase integration, follow these steps:

### Option A: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Paste the SQL**
   - Open the file: `supabase/migrations/20251002000000_complete_database_setup.sql`
   - Select all (Cmd/Ctrl + A)
   - Copy (Cmd/Ctrl + C)
   - Paste into SQL Editor (Cmd/Ctrl + V)

4. **Run It**
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait 5-10 seconds
   - You should see "Success. No rows returned"

### Option B: Use Bolt's Database Panel

If Bolt has a database management panel:

1. Look for "Database" or "Supabase" in your Bolt sidebar
2. Find the SQL Editor or Query Console
3. Paste the migration SQL
4. Execute it

## Step 3: Verify It Worked

Run this in your terminal:
```bash
npm run db:check
```

You should see:
- ✓ 16 tables created
- Sample data loaded

## What This Creates

✅ **16 Tables:**
- departments (3 records)
- categories (6 records)
- products (3 records)
- product_variants
- user_profiles
- addresses
- cart_items
- wishlist
- orders
- order_items
- carriers (7 records)
- order_tracking_events
- global_settings (1 record)
- seller_settings
- services (2 records)
- diy_articles (2 records)

✅ **35+ Security Policies** (RLS enabled)

✅ **19+ Performance Indexes**

## Quick Visual Confirmation

After applying, go to Supabase Dashboard → Table Editor:
- Click "departments" - should see 3 rows
- Click "categories" - should see 6 rows
- Click "products" - should see 3 rows

## Having Trouble?

If you can't access Supabase Dashboard, you can:

1. **Check your Bolt project settings** - Look for database configuration
2. **Contact Bolt support** - Ask how to apply SQL migrations
3. **Use the SQL file directly** - The file is ready at:
   `supabase/migrations/20251002000000_complete_database_setup.sql`

---

**The migration file is 990 lines and will set up everything in 10 seconds.**

Let me know once you've applied it and I can help verify it worked!
