import {
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaType } from '@prisma/client';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('reels')
  async getReels(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.mediaService.getReels(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: MediaType,
    @Query('locationId') locationId?: string,
  ) {
    return this.mediaService.uploadAndSave(
      file,
      type,
      req.user.id,
      locationId,
    );
  }
}
