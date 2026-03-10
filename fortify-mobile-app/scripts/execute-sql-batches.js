/**
 * Execute SQL batch files against Supabase using REST API
 * Uses service role key for elevated permissions
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Use service role key if available, otherwise anon key
const API_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !API_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const batchDir = path.join(__dirname, '..', 'sql-batches');

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ sql_query: sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

async function main() {
  const files = fs.readdirSync(batchDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} batch files to execute\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(batchDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      await executeSql(sql);
      success++;
      console.log(`✓ ${file}`);
    } catch (error) {
      failed++;
      console.error(`✗ ${file}: ${error.message}`);
    }

    // Small delay between batches
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nComplete: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);
