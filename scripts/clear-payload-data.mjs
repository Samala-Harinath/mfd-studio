import dotenv from "dotenv";
import pg from "../node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";

dotenv.config();

const keep = new Set(["payload_migrations"]);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

const tables = await client.query(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
);

const names = tables.rows.map((row) => row.tablename).filter((name) => !keep.has(name));
if (names.length > 0) {
  const list = names.map((name) => `"${name.replaceAll('"', '""')}"`).join(", ");
  await client.query(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}

const counts = await client.query(`
  SELECT relname AS table, n_live_tup AS estimate
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY relname
`);

const exact = [];
for (const row of tables.rows) {
  const result = await client.query(`SELECT count(*)::int AS count FROM "${row.tablename.replaceAll('"', '""')}"`);
  exact.push({ table: row.tablename, count: result.rows[0].count });
}

console.log(JSON.stringify({ truncated: names.length, counts: exact, estimates: counts.rows }, null, 2));
await client.end();
