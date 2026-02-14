import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService for standalone script or just load env
require('dotenv').config();

async function checkS3() {
  console.log('Checking S3 Connection...');
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    const data = await s3.send(new ListBucketsCommand({}));
    console.log('✅ S3 Connection Successful!');
    console.log('Buckets found:', data.Buckets?.map((b) => b.Name).join(', '));
    if (!data.Buckets?.some((b) => b.Name === process.env.AWS_BUCKET_NAME)) {
      console.warn(
        `⚠️ Warning: Configured bucket '${process.env.AWS_BUCKET_NAME}' not found in account.`,
      );
    } else {
      console.log(
        `✅ Configured bucket '${process.env.AWS_BUCKET_NAME}' exists.`,
      );
    }
  } catch (err) {
    console.error('❌ S3 Connection Failed:', err);
    process.exit(1);
  }
}

checkS3();
