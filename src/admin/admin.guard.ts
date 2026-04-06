import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activated = await super.canActivate(context);
    if (!activated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const email = request.user?.email?.toLowerCase?.();
    const allowedEmails = this.configService
      .get<string>('ADMIN_EMAILS', '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!email || !allowedEmails.includes(email)) {
      throw new ForbiddenException('Admin access denied');
    }

    return true;
  }
}
