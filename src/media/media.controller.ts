import {
  Controller,
  Get,
  Post,
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
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: MediaType,
    @Query('locationId') locationId?: string,
  ) {
    // In a real app, we'd get the userId from the request (via Guard)
    // and save the record to Prisma.
    return this.mediaService.uploadAndSave(file, type, locationId);
  }
}
