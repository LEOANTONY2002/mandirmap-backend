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
      SELECT a.id, a.name, a.experience_years as "experienceYears", 
             a.languages, a.hourly_rate as "hourlyRate", a.bio, a.rating,
             a.latitude, a.longitude,
             ST_Distance(a.coords, ST_MakePoint(${lng}, ${lat})::geography) as distance
      FROM "Astrologer" a
      WHERE ST_DWithin(a.coords, ST_MakePoint(${lng}, ${lat})::geography, ${radiusInMeters})
      ORDER BY distance ASC
    `;
  }

  async findOne(id: string) {
    return this.prisma.astrologer.findUnique({
      where: { id },
    });
  }
}
