import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
  process.exit(1);
}

console.log('✓ Environment variables loaded');
console.log(`Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('\n=== Checking Database Connection ===\n');

  const tables = [
    'departments',
    'categories',
    'products',
    'product_variants',
    'user_profiles',
    'addresses',
    'cart_items',
    'wishlist',
    'orders',
    'order_items',
    'carriers',
    'order_tracking_events',
    'global_settings',
    'seller_settings',
    'services',
    'diy_articles'
  ];

  let existingTables = [];
  let missingTables = [];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          console.log(`❌ Table '${table}': NOT FOUND`);
          missingTables.push(table);
        } else {
          console.log(`⚠️  Table '${table}': ERROR - ${error.message}`);
        }
      } else {
        console.log(`✓ Table '${table}': EXISTS`);
        existingTables.push(table);
      }
    } catch (error) {
      console.log(`⚠️  Table '${table}': ERROR - ${error.message}`);
    }
  }

  console.log('\n=== Summary ===\n');
  console.log(`Tables found: ${existingTables.length}/${tables.length}`);
  console.log(`Tables missing: ${missingTables.length}/${tables.length}`);

  if (missingTables.length > 0) {
    console.log('\n⚠️  Database setup incomplete!');
    console.log('\nMissing tables:', missingTables.join(', '));
    console.log('\n📝 To apply the migration:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to your project > SQL Editor');
    console.log('3. Open the file: supabase/migrations/20251002000000_complete_database_setup.sql');
    console.log('4. Copy and paste the entire SQL content into the SQL Editor');
    console.log('5. Click "Run" to execute the migration');
    console.log('\nAlternatively, if you have Supabase CLI installed:');
    console.log('Run: supabase db push');
  } else {
    console.log('\n✓ Database setup complete!');
    console.log('\nChecking sample data...');

    const checks = [
      { table: 'departments', name: 'Departments' },
      { table: 'categories', name: 'Categories' },
      { table: 'products', name: 'Products' },
      { table: 'carriers', name: 'Carriers' },
      { table: 'services', name: 'Services' },
      { table: 'diy_articles', name: 'DIY Articles' },
      { table: 'global_settings', name: 'Global Settings' }
    ];

    console.log('\n=== Sample Data ===\n');
    for (const check of checks) {
      const { data, error } = await supabase.from(check.table).select('*', { count: 'exact' });
      if (!error && data) {
        console.log(`${check.name}: ${data.length} records`);
      }
    }
  }

  console.log('\n=== Database check complete ===\n');
}

checkDatabase().catch(console.error);
