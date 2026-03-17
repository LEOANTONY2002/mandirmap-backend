import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AstrologersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.astrologer.findMany({
      orderBy: { rating: 'desc' },
    });
  }

  async findNearby(lat: number, lng: number, radiusInMeters: number = 20000) {
    // Spatial query for nearby astrologers
    return this.prisma.$queryRaw`
      SELECT a.id, a.name, a.avatar_url as "avatarUrl", a.experience_years as "experienceYears", 
             a.languages, a.hourly_rate as "hourlyRate", a.bio, a.rating, a.total_ratings as "totalRatings",
             a.is_verified as "isVerified", a.phone_number as "phoneNumber", a.whatsapp_number as "whatsappNumber",
             a.photo_urls as "photoUrls", a.latitude, a.longitude, a.district, a.state,
             ST_Distance(a.coords, ST_MakePoint(${lng}, ${lat})::geography) as distance
      FROM "Astrologer" a
      WHERE ST_DWithin(a.coords, ST_MakePoint(${lng}, ${lat})::geography, ${radiusInMeters})
      ORDER BY distance ASC
    `;
  }

  async findByDistrict(district: string) {
    return this.prisma.astrologer.findMany({
      where: { district: { equals: district, mode: 'insensitive' } },
      orderBy: { rating: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.astrologer.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addReview(
    astrologerId: string,
    userId: string,
    rating: number,
    comment?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          astrologerId,
          userId,
          rating,
          comment,
        },
        include: { user: true },
      });

      // Update astrologer stats
      const allReviews = await tx.review.findMany({
        where: { astrologerId },
      });
      const newTotal = allReviews.length;
      const newRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / newTotal;

      await tx.astrologer.update({
        where: { id: astrologerId },
        data: {
          rating: newRating,
          totalRatings: newTotal,
        },
      });

      return review;
    });
  }

  async updateReview(
    reviewId: string,
    astrologerId: string,
    userId: string,
    rating: number,
    comment?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: reviewId, userId, astrologerId },
        data: { rating, comment },
        include: { user: true },
      });

      // Update astrologer stats
      const allReviews = await tx.review.findMany({
        where: { astrologerId },
      });
      const newTotal = allReviews.length;
      const newRating = newTotal > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / newTotal
        : 0;

      await tx.astrologer.update({
        where: { id: astrologerId },
        data: {
          rating: newRating,
          totalRatings: newTotal,
        },
      });

      return review;
    });
  }

  async deleteReview(reviewId: string, astrologerId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.delete({
        where: { id: reviewId, userId, astrologerId },
      });

      // Update astrologer stats
      const allReviews = await tx.review.findMany({
        where: { astrologerId },
      });
      const newTotal = allReviews.length;
      const newRating = newTotal > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / newTotal
        : 0;

      await tx.astrologer.update({
        where: { id: astrologerId },
        data: {
          rating: newRating,
          totalRatings: newTotal,
        },
      });

      return review;
    });
  }
}
