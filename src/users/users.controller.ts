import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('fcm-token')
  async updateFcmToken(@Request() req, @Body('token') token: string) {
    const firebaseUid = req.user.uid;
    return this.usersService.updateFcmToken(firebaseUid, token);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const firebaseUid = req.user.uid;
    return this.usersService.findByFirebaseUid(firebaseUid);
  }
}
