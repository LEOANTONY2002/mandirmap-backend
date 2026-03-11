import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../media/media.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService,
  ) {}

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

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const avatarUrl = await this.mediaService.uploadFile(file, 'avatars');
    return this.usersService.updateAvatar(userId, avatarUrl);
  }
}
