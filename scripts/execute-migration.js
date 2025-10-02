import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('🚀 Executing migration...\n');

  try {
    const migrationPath = join(__dirname, '../supabase/migrations/20251002120000_fixed_database_setup.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`✅ Executed ${successCount} statements...`);
          }
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

executeMigration();
