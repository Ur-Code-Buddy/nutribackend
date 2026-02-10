import IORedis from 'ioredis';
require('dotenv').config();

async function checkRedis() {
    console.log(`Checking Redis Connection to: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}...`);
    const redis = new IORedis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        maxRetriesPerRequest: 1,
    });

    redis.on('error', (err) => {
        console.error('❌ Redis Connection Failed:', err.message);
        redis.disconnect();
        process.exit(1);
    });

    redis.on('connect', () => {
        console.log('✅ Redis Connection Successful!');
        redis.disconnect();
    });
}

checkRedis();
