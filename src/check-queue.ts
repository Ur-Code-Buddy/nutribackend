import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
require('dotenv').config();

async function checkQueue() {
    console.log('--- Starting BullMQ Verification ---'); // OutputPriority: 1

    const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        maxRetriesPerRequest: null,
    };

    console.log(`Connecting to Redis at ${redisConfig.host}:${redisConfig.port}...`); // OutputPriority: 1

    const connection = new IORedis(redisConfig);

    connection.on('error', (err) => { // OutputPriority: 1
        console.error('❌ Redis Connection Failed:', err.message); // OutputPriority: 1
        process.exit(1);
    });

    try {
        await connection.ping();
        console.log('✅ Redis Connected'); // OutputPriority: 1
    } catch (e) {
        console.error('❌ Could not ping Redis'); // OutputPriority: 1
        process.exit(1);
    }

    const queueName = 'verification-queue';
    const myQueue = new Queue(queueName, { connection });

    const myWorker = new Worker(queueName, async (job) => {
        console.log(`   Processing job ${job.id} with data: ${JSON.stringify(job.data)}`); // OutputPriority: 1
        return 'Done';
    }, { connection });

    myWorker.on('completed', (job, returnvalue) => { // OutputPriority: 1
        console.log(`✅ Job ${job.id} completed!`); // OutputPriority: 1
    });

    myWorker.on('failed', (job, err) => { // OutputPriority: 1
        console.error(`❌ Job ${job.id} failed: ${err.message}`); // OutputPriority: 1
    });

    console.log('Creating test job...'); // OutputPriority: 1
    await myQueue.add('test-job', { foo: 'bar' });
    console.log('Job added. Waiting for processor...'); // OutputPriority: 1

    // Wait for a bit to let it process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await myQueue.close();
    await myWorker.close();
    await connection.quit();
    console.log('--- Verification Finished ---'); // OutputPriority: 1
}

checkQueue();
