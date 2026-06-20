// Applies supabase/schema.sql to your Supabase Postgres.
// Usage:  npm run db:setup
//
// Needs a direct Postgres connection (DDL can't go through the REST API).
// Provide ONE of these in .env.local (or the environment):
//   DATABASE_URL=postgresql://postgres:<pw>@db.<ref>.supabase.co:5432/postgres
//   (or)  SUPABASE_DB_PASSWORD=<pw>   (host is derived from NEXT_PUBLIC_SUPABASE_URL)
// Get it from Supabase → Project Settings → Database → Connection string.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pkg from 'pg';

const { Client } = pkg;
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// --- load .env.local (simple parser; doesn't override real env) ---
const envPath = join(root, '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let [, k, v] = m;
    v = v.replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
    if (v && process.env[k] === undefined) process.env[k] = v;
  }
}

// --- resolve connection string ---
function connectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const pw = process.env.SUPABASE_DB_PASSWORD;
  if (url && pw) {
    const ref = new URL(url).hostname.split('.')[0];
    return `postgresql://postgres:${encodeURIComponent(pw)}@db.${ref}.supabase.co:5432/postgres`;
  }
  return null;
}

const conn = connectionString();
if (!conn) {
  console.error('✖ Missing connection. Add DATABASE_URL (or SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL) to .env.local');
  console.error('  Supabase → Project Settings → Database → Connection string (URI).');
  process.exit(1);
}

const sql = readFileSync(join(root, 'supabase', 'schema.sql'), 'utf8');

const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('→ Connected. Applying schema…');
  await client.query(sql);
  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name"
  );
  console.log('✓ Schema applied. Public tables:');
  for (const r of rows) console.log('   •', r.table_name);
} catch (err) {
  console.error('✖ Failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
