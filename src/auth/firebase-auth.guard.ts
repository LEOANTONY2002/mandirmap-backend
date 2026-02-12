import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // --- Dev Bypass ---
    if (token === 'dev-token') {
      request.user = { uid: 'dev-uid', email: 'dev@mandirmap.com' };
      return true;
    }

    try {
      const decodedToken = await this.firebaseService.verifyToken(token);
      // Attach the user info to the request object
      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
