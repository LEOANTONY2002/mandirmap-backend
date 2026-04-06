import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  controllers: [AdminAuthController, AdminController],
  providers: [AdminAuthService, AdminService, AdminGuard],
})
export class AdminModule {}
