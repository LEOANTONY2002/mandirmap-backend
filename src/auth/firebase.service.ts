import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    // This assumes GOOGLE_APPLICATION_CREDENTIALS env var is set or firebase-config.json exists
    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  async verifyToken(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
