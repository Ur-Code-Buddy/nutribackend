import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  onModuleInit() {
    try {
      // Initialize Firebase using the downloaded JSON key
      const serviceAccountPath = path.join(
        process.cwd(),
        'nutritiffinServiceAccountKey.json',
      );
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.logger.log('Firebase Admin initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
    }
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: any,
  ) {
    if (!fcmToken) return;

    try {
      const message = {
        notification: { title, body },
        data: data || {}, // Optional data payload
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(
        `Successfully sent notification to ${fcmToken.substring(0, 10)}...`,
      );
      return response;
    } catch (error) {
      this.logger.error('Error sending push notification', error);
    }
  }
}
