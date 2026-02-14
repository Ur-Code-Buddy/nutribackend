import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('AWS S3 configuration is missing');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
  }

  async upload(file: Express.Multer.File): Promise<{ image_url: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    const key = `uploads/${filename}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: 'public-read', // Bucket policy usually handles this; omitting ACL to avoid AccessDenied if ACLs disabled
        }),
      );

      // Construct public URL (assuming standard S3 URL structure)
      const imageUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return { image_url: imageUrl };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}
