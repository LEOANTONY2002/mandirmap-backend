import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private prisma: PrismaService,
  ) {}

  @Post('toggle')
  @UseGuards(FirebaseAuthGuard)
  async toggle(@Req() req, @Body('locationId') locationId: string) {
    const firebaseUid = req.user.uid;
    const user = await this.prisma.user.findFirst({
      // @ts-ignore
      where: { firebaseUid },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return this.favoritesService.toggleFavorite(user.id, locationId);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getFavorites(@Req() req) {
    const firebaseUid = req.user.uid;
    const user = await this.prisma.user.findFirst({
      // @ts-ignore
      where: { firebaseUid },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return this.favoritesService.getFavorites(user.id);
  }

  @Get('status/:locationId')
  @UseGuards(FirebaseAuthGuard)
  async getStatus(@Req() req, @Param('locationId') locationId: string) {
    const firebaseUid = req.user.uid;
    const user = await this.prisma.user.findFirst({
      // @ts-ignore
      where: { firebaseUid },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const isFavorite = await this.favoritesService.isFavorite(
      user.id,
      locationId,
    );
    return { isFavorite };
  }
}
