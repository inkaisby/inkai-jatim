/**
 * Apply Supabase migrations.
 *
 * Option A (recommended): set SUPABASE_DB_URL (PostgreSQL connection string)
 * Option B: run SQL manually in Supabase SQL Editor
 *
 * Usage: npm run db:migrate
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import pg from "pg";

const { Client } = pg;

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Missing SUPABASE_DB_URL or DATABASE_URL.");
    console.error("Copy connection string from Supabase > Project Settings > Database.");
    process.exit(1);
  }

  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    create table if not exists public._portal_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  for (const file of files) {
    const { rows } = await client.query(
      "select 1 from public._portal_migrations where filename = $1",
      [file],
    );
    if (rows.length > 0) {
      console.log(`skip ${file}`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`apply ${file}...`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public._portal_migrations (filename) values ($1)", [file]);
      await client.query("commit");
      console.log(`ok ${file}`);
    } catch (error) {
      await client.query("rollback");
      console.error(`failed ${file}`, error);
      process.exit(1);
    }
  }

  await client.end();
  console.log("All migrations applied.");
}

main();
