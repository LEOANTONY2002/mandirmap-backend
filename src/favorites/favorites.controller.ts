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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  async toggle(@Req() req, @Body('locationId') locationId: string) {
    const userId = req.user.id;
    return this.favoritesService.toggleFavorite(userId, locationId);
  }

  @Get()
  async getFavorites(@Req() req) {
    const userId = req.user.id;
    return this.favoritesService.getFavorites(userId);
  }

  @Get('status/:locationId')
  async getStatus(@Req() req, @Param('locationId') locationId: string) {
    const userId = req.user.id;
    const isFavorite = await this.favoritesService.isFavorite(
      userId,
      locationId,
    );
    return { isFavorite };
  }
}
