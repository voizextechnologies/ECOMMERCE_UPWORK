# 🚀 Apply Database Migration - Do This Now!

Your database migration is ready. Follow these steps to set up your database in **5 minutes**.

## Prerequisites Check ✓

- [x] Supabase account created
- [x] Project environment variables configured in `.env`
- [x] Migration file created: `supabase/migrations/20251002000000_complete_database_setup.sql`

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Select your project (or create a new one if needed)

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click the **"New query"** button (top right)

### Step 3: Copy Migration SQL

1. Open this file in your code editor:
   ```
   supabase/migrations/20251002000000_complete_database_setup.sql
   ```

2. Select all content:
   - Press **Cmd/Ctrl + A** (select all)

3. Copy the content:
   - Press **Cmd/Ctrl + C** (copy)

### Step 4: Paste and Execute

1. Go back to Supabase SQL Editor
2. Paste the SQL:
   - Press **Cmd/Ctrl + V** (paste)

3. Execute the migration:
   - Click **"Run"** button, OR
   - Press **Cmd/Ctrl + Enter**

4. Wait for completion (should take 5-10 seconds)

### Step 5: Verify Success

You should see a message like:
```
Success. No rows returned
```

This is GOOD! It means all tables were created successfully.

## What Just Happened?

The migration created:

✅ **16 Database Tables:**
- departments, categories, products, product_variants
- user_profiles, addresses, cart_items, wishlist
- orders, order_items, carriers, order_tracking_events
- global_settings, seller_settings, services, diy_articles

✅ **35+ Security Policies** (Row Level Security)

✅ **19+ Performance Indexes**

✅ **Sample Data:**
- 3 departments
- 6 categories
- 3 products
- 7 carriers
- 2 services
- 2 DIY articles
- Default settings (10% tax, $9.95 shipping)

## Next Steps

### 1. Verify Database Setup

Run this command in your terminal:

```bash
npm run db:check
```

You should see:
- ✓ All 16 tables exist
- Sample data counts

### 2. Test with SQL Queries (Optional)

To test the database directly:

1. Go to Supabase Dashboard → SQL Editor
2. Open `TEST_QUERIES.sql` from your project
3. Copy and paste the "SUMMARY CHECK" query (at the bottom)
4. Run it to verify everything

Expected results:
- Tables: 16
- Departments: 3
- Categories: 6
- Products: 3
- Carriers: 7
- Services: 2
- DIY Articles: 2
- Global Settings: 1
- RLS Policies: 35+
- Indexes: 19+

### 3. View Your Data

In Supabase Dashboard:

1. Click **"Table Editor"** in the sidebar
2. Browse your tables:
   - Click **"departments"** - see 3 departments
   - Click **"categories"** - see 6 categories
   - Click **"products"** - see 3 sample products
   - Click **"carriers"** - see 7 shipping carriers

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 and you should see:
- Products on the homepage
- Working navigation
- Functional shopping experience

### 5. Create Your First Admin User

1. Go to your app at http://localhost:5173
2. Click **"Sign Up"** and register an account
3. Go to Supabase Dashboard → Authentication → Users
4. Copy your user ID
5. Go to SQL Editor and run:

```sql
INSERT INTO user_profiles (id, first_name, last_name, role)
VALUES ('your-user-id-here', 'Your', 'Name', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

6. Log out and log back in
7. Access admin panel at http://localhost:5173/admin

## Troubleshooting

### ❌ Error: "relation already exists"

**Cause:** Tables already exist from a previous attempt

**Fix:** Either:
1. Drop existing tables first, OR
2. Ignore the error if tables are already set up correctly

To drop all tables and start fresh:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run the migration.

### ❌ Error: "permission denied"

**Cause:** Not enough permissions

**Fix:** Make sure you're using the Supabase Dashboard SQL Editor, not trying to run the SQL from code.

### ❌ npm run db:check shows "fetch failed"

**Cause:** Environment variables not set correctly

**Fix:**
1. Check `.env` file exists
2. Verify `VITE_SUPABASE_URL` is set
3. Verify `VITE_SUPABASE_ANON_KEY` is set
4. Get correct values from Supabase Dashboard → Settings → API

### ❌ Can't see any data in the app

**Possible causes:**
1. Migration not applied - apply it now
2. RLS policies blocking access - check you're querying public tables
3. Environment variables wrong - verify .env file

## Documentation Links

After migration is applied, check out:

- **QUICK_START.md** - 10-minute guide to get running
- **DATABASE_SETUP.md** - Detailed database documentation
- **README.md** - Full project documentation
- **TEST_QUERIES.sql** - SQL queries to test your database
- **DATABASE_IMPLEMENTATION_SUMMARY.md** - Technical details

## Need Help?

1. Check TEST_QUERIES.sql - run queries to diagnose issues
2. Check DATABASE_SETUP.md - comprehensive troubleshooting
3. Check Supabase logs - Dashboard → Logs
4. Check browser console - for frontend errors

## You're Almost There!

Once the migration is applied:
- ✅ Database is fully configured
- ✅ Sample data is loaded
- ✅ Security policies are active
- ✅ Ready to start developing

---

**Time to apply: 2 minutes**
**Setup difficulty: Easy**
**One-time task: Yes**

🎉 **Let's do this! Copy that SQL and run it now!**
