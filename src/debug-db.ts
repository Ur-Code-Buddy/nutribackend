import { Client } from 'pg';

const configs = [
  {
    name: 'Pooler - Session Mode (5432)',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.uemxmbwxvbxdrzafyjsh',
    password: 'nutritiffin2002',
    database: 'postgres',
  },
  {
    name: 'Pooler - Transaction Mode (6543)',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.uemxmbwxvbxdrzafyjsh',
    password: 'nutritiffin2002',
    database: 'postgres',
  },
  {
    name: 'Pooler - IPv6 Direct (5432)',
    host: '2406:da1a:6b0:f627:357:1c28:1cb8:cc3d',
    port: 5432,
    user: 'postgres',
    password: 'nutritiffin2002',
    database: 'postgres',
  },
];

async function testConnection(config: any) {
  console.log(`\nTesting: ${config.name}`);
  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('✅ Success!');
    const res = await client.query('SELECT version()');
    console.log(res.rows[0]);
    await client.end();
  } catch (err: any) {
    console.log(`❌ Failed: ${err.message} (Code: ${err.code})`);
  }
}

async function run() {
  for (const config of configs) {
    await testConnection(config);
  }
}

run();
