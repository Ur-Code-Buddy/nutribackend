import { Client } from 'pg';
require('dotenv').config();

async function checkDB() {
  console.log(
    `Checking Database Connection to: ${process.env.DB_HOST}:${process.env.DB_PORT}...`,
  );
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }, // Required for Supabase Pooler usually
  });

  try {
    await client.connect();
    console.log('✅ Database Connection Successful!');
    const res = await client.query('SELECT NOW()');
    console.log('Server Time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('❌ Database Connection Failed:', err);
    process.exit(1);
  }
}

checkDB();
