import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const allowedEmails = this.configService
      .get<string>('ADMIN_EMAILS', '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!allowedEmails.includes(normalizedEmail)) {
      throw new ForbiddenException('Admin access denied');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      admin: true,
    });

    const { password: _password, ...sanitizedUser } = user;

    return {
      token,
      user: sanitizedUser,
    };
  }
}
