import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Starting migration application...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251002120000_fixed_database_setup.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded successfully');
    console.log('📊 Executing SQL migration...\n');

    // Execute the migration using Supabase's RPC or raw SQL
    // Note: This requires using the service role key for full access
    // Since we only have anon key, we'll need to guide the user to do it manually

    console.log('⚠️  IMPORTANT: This script cannot apply migrations with the anon key.');
    console.log('📋 Please follow these steps:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the left sidebar');
    console.log('4. Click "New query"');
    console.log('5. Copy the contents of: supabase/migrations/20251002120000_fixed_database_setup.sql');
    console.log('6. Paste into the SQL Editor');
    console.log('7. Click "Run" (or press Cmd/Ctrl + Enter)');
    console.log('\n✅ The migration will create all tables, policies, and sample data.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
