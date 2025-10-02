import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║         Creating EcoConnect Database Tables                     ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

console.log('✓ Supabase URL:', supabaseUrl);
console.log('✓ Credentials loaded\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('📋 Reading migration file...\n');

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251002000000_complete_database_setup.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  console.log(`✓ Migration file loaded (${sql.length} characters)\n`);
  console.log('⚠️  Note: The anon key cannot execute raw SQL directly.');
  console.log('   Tables must be created via Supabase Dashboard.\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('                  MANUAL STEPS REQUIRED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('To create your database tables:\n');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Click "New query"');
  console.log('5. Open this file in your editor:');
  console.log('   → supabase/migrations/20251002000000_complete_database_setup.sql');
  console.log('6. Copy ALL the content (Cmd/Ctrl + A, then Cmd/Ctrl + C)');
  console.log('7. Paste into Supabase SQL Editor (Cmd/Ctrl + V)');
  console.log('8. Click "Run" or press Cmd/Ctrl + Enter');
  console.log('9. Wait 10 seconds for completion\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('After applying the migration, run:');
  console.log('  npm run db:check\n');

  console.log('This will verify all 16 tables were created successfully.\n');

  // Try to check if any tables exist
  console.log('🔍 Checking current database state...\n');

  const tablesToCheck = ['departments', 'categories', 'products'];
  let foundTables = 0;

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`✓ Table '${table}' exists`);
        foundTables++;
      } else if (error.code === '42P01') {
        console.log(`❌ Table '${table}' does not exist yet`);
      }
    } catch (e) {
      console.log(`⚠️  Table '${table}': ${e.message}`);
    }
  }

  console.log('');

  if (foundTables === 0) {
    console.log('❌ Database is empty - migration needs to be applied');
    console.log('   Follow the manual steps above to create tables.\n');
  } else if (foundTables === tablesToCheck.length) {
    console.log('✅ All checked tables exist! Database appears to be set up.');
    console.log('   Run: npm run db:check for full verification\n');
  } else {
    console.log('⚠️  Some tables exist but setup may be incomplete.');
    console.log('   Run: npm run db:check for full verification\n');
  }
}

createTables().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
