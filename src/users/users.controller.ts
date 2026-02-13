import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('fcm-token')
  async updateFcmToken(@Request() req, @Body('token') token: string) {
    const userId = req.user.id;
    return this.usersService.updateFcmToken(userId, token);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    return this.usersService.findById(userId);
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() data: any) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, data);
  }
}
