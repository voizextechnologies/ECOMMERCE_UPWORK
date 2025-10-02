# Quick Start Guide

Get your EcoConnect Supply Chain e-commerce platform up and running in minutes.

## Step 1: Set Up Supabase Database (5 minutes)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click your project or create a new one
3. Click **SQL Editor** in the sidebar
4. Click **New query**
5. Open `supabase/migrations/20251002000000_complete_database_setup.sql` in your code editor
6. Copy the entire file contents (Cmd/Ctrl + A, then Cmd/Ctrl + C)
7. Paste into Supabase SQL Editor (Cmd/Ctrl + V)
8. Click **Run** or press Cmd/Ctrl + Enter
9. Wait for "Success. No rows returned" message

**What this does:** Creates all 16 database tables, sets up security policies, and adds sample data.

## Step 2: Configure Environment Variables (2 minutes)

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. In your project, open `.env` file
4. Update these values:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Install Dependencies (1 minute)

```bash
npm install
```

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 5: Verify Setup (2 minutes)

### Check Database Connection

```bash
npm run db:check
```

You should see:
- ✓ All 16 tables exist
- Sample data counts for departments, categories, products, etc.

### Browse the Site

1. **Homepage** - You should see 3 sample products
2. **Shop** - Browse products by department and category
3. **Services** - View professional services
4. **DIY Advice** - Read DIY articles

### Test Authentication

1. Click **Sign Up** or **Login** in the header
2. Create an account with email and password
3. Check you can access:
   - Account Dashboard
   - Shopping Cart
   - Wishlist

## Step 6: Create Admin User (Optional)

To access the admin panel:

1. Register an account through the app first
2. Get your user ID from Supabase Dashboard → Authentication → Users
3. In Supabase SQL Editor, run:

```sql
INSERT INTO user_profiles (id, first_name, last_name, role)
VALUES ('paste-your-user-id-here', 'Your', 'Name', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

4. Log out and log back in
5. Access Admin Panel at `/admin`

## You're Done!

Your e-commerce platform is now running with:

- ✓ 3 departments
- ✓ 6 categories
- ✓ 3 sample products
- ✓ Shopping cart
- ✓ User authentication
- ✓ Order management
- ✓ Delivery tracking
- ✓ 7 shipping carriers
- ✓ Tax and shipping configuration

## Next Steps

### For Customers
- Browse products
- Add items to cart
- Place test orders
- Track deliveries

### For Sellers
- Register as seller
- Add your products
- Set custom pricing
- Manage inventory

### For Admins
- Manage all products
- View all orders
- Configure global settings
- Manage users and roles

## Need Help?

- **Database Setup**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Full Documentation**: See [README.md](./README.md)
- **Implementation Details**: See [DATABASE_IMPLEMENTATION_SUMMARY.md](./DATABASE_IMPLEMENTATION_SUMMARY.md)

## Troubleshooting

### "No tables found" when running db:check

**Fix:** The migration hasn't been applied. Go back to Step 1 and apply the SQL migration in Supabase Dashboard.

### "Missing environment variables" error

**Fix:** Make sure `.env` file exists and has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set.

### Can't log in after creating account

**Fix:**
1. Check Supabase Dashboard → Authentication → Email Auth is enabled
2. For development, you may need to disable email confirmation

### Build fails

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

**That's it! You're ready to start building.**
