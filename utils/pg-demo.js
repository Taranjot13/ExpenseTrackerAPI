const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.PG_CONNECTION_STRING || 'postgres://postgres:postgres@localhost:5432/expensetracker'
  });

  await client.connect();

  const res = await client.query('SELECT NOW() AS now');
  console.log('PostgreSQL connected, server time:', res.rows[0].now);

  await client.end();
}

main().catch((err) => {
  console.error('PostgreSQL demo error:', err);
  process.exit(1);
});
