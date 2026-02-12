import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(userId: String, locationId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_locationId: {
          userId: userId as string,
          locationId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorite: false };
    } else {
      await this.prisma.favorite.create({
        data: {
          userId: userId as string,
          locationId,
        },
      });
      return { isFavorite: true };
    }
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        location: {
          include: {
            temple: true,
            media: true,
          },
        },
      },
    });
  }

  async isFavorite(userId: string, locationId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });
    return !!favorite;
  }
}
