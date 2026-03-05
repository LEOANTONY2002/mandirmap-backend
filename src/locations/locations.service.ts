import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    lang: string,
    category?: Category,
    deityId?: string,
    district?: string,
  ) {
    const whereClause: any = category ? { category } : {};

    if (district) {
      whereClause.district = { equals: district, mode: 'insensitive' };
    }

    if (deityId && !isNaN(Number(deityId))) {
      whereClause.temple = {
        deities: {
          some: {
            deityId: Number(deityId),
          },
        },
      };
    }

    const locations = await this.prisma.location.findMany({
      where: whereClause,
      include: {
        temple: {
          include: {
            deities: {
              include: { deity: true },
            },
          },
        },
        hotel: true,
        restaurant: true,
        media: true, // Including media to show photos in list
      },
    });
    return locations.map((l) => this.localizeLocation(l, lang));
  }

  async findNearby(
    lang: string,
    lat: number,
    lng: number,
    radiusInMeters: number = 5000,
    category?: Category,
    deityId?: string,
  ) {
    // 1. Get IDs and distances using PostGIS
    const query = category
      ? this.prisma.$queryRaw`
          SELECT l.id,
                 ST_Distance(l.coords, ST_MakePoint(${lng}, ${lat})::geography) as distance
          FROM "Location" l
          WHERE ST_DWithin(l.coords, ST_MakePoint(${lng}, ${lat})::geography, ${radiusInMeters})
          AND l.category = ${category}::"Category"
          ORDER BY distance ASC
        `
      : this.prisma.$queryRaw`
          SELECT l.id,
                 ST_Distance(l.coords, ST_MakePoint(${lng}, ${lat})::geography) as distance
          FROM "Location" l
          WHERE ST_DWithin(l.coords, ST_MakePoint(${lng}, ${lat})::geography, ${radiusInMeters})
          ORDER BY distance ASC
        `;

    const nearbyResults: any[] = await (query as any);

    if (nearbyResults.length === 0) {
      return [];
    }

    const ids = nearbyResults.map((r) => r.id);
    const distanceMap = new Map(nearbyResults.map((r) => [r.id, r.distance]));

    // 2. Build where clause with deity filter if needed
    const whereClause: any = { id: { in: ids } };

    if (deityId && !isNaN(Number(deityId))) {
      whereClause.temple = {
        deities: {
          some: {
            deityId: Number(deityId),
          },
        },
      };
    }

    // 3. Fetch full details using Prisma to ensure all relations (Hotel, Restaurant, Media) are loaded
    const locations = await this.prisma.location.findMany({
      where: whereClause,
      include: {
        temple: {
          include: {
            deities: {
              include: { deity: true },
            },
          },
        },
        hotel: true,
        restaurant: true,
        media: true, // Fetch photos!
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // 4. Merge distance and sort
    const locationsWithDistance = locations.map((l) => ({
      ...l,
      distance: distanceMap.get(l.id),
    }));

    locationsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return locationsWithDistance.map((l) => this.localizeLocation(l, lang));
  }

  async getDeities(lang: string) {
    const deities = await this.prisma.deity.findMany({
      orderBy: { name: 'asc' },
    });
    return deities.map((d) => ({
      ...d,
      name: lang === 'ml' && d.nameMl ? d.nameMl : d.name,
    }));
  }

  async getFestivals(lang: string, district?: string, state?: string) {
    const whereClause: any = {};
    if (district) {
      whereClause.location = {
        district: { equals: district, mode: 'insensitive' },
      };
    } else if (state) {
      whereClause.location = {
        state: { equals: state, mode: 'insensitive' },
      };
    }

    const festivals = await this.prisma.festival.findMany({
      where: whereClause,
      include: {
        location: true,
        deity: true,
      },
      orderBy: { startDate: 'asc' },
    });
    return festivals.map((f) => this.localizeFestival(f, lang));
  }

  async getDistricts(lang: string, state?: string) {
    const whereClause: any = {
      district: { not: null },
    };

    if (state) {
      whereClause.state = { equals: state, mode: 'insensitive' };
    }

    const locations = await this.prisma.location.findMany({
      where: whereClause,
      select: {
        district: true,
        districtMl: true,
      },
      distinct: ['district'],
    });

    return locations.map((l) => ({
      name: lang === 'ml' && l.districtMl ? l.districtMl : l.district,
      id: l.district,
    }));
  }

  async search(lang: string, query: string) {
    const locations = await this.prisma.location.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameMl: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        temple: {
          include: {
            deities: { include: { deity: true } },
          },
        },
        hotel: true,
        restaurant: true,
        media: true,
      },
    });
    return locations.map((l) => this.localizeLocation(l, lang));
  }

  async getTempleDetails(lang: string, id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        temple: {
          include: {
            deities: {
              include: { deity: true },
            },
          },
        },
        hotel: true,
        restaurant: true,
        festivals: true,
        reviews: {
          include: { user: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        media: true,
      },
    });
    return location
      ? this.localizeLocation(this.mapLocationFields(location), lang)
      : null;
  }

  private mapLocationFields(l: any) {
    return {
      ...l,
      addressText: l.addressText,
      averageRating: l.averageRating,
      totalRatings: l.totalRatings,
    };
  }

  private localizeLocation(l: any, lang: string) {
    if (lang === 'ml') {
      return {
        ...l,
        name: l.nameMl || l.name,
        description: l.descriptionMl || l.description,
        addressText: l.addressTextMl || l.addressText,
        district: l.districtMl || l.district,
        state: l.stateMl || l.state,
        temple: l.temple
          ? {
              ...l.temple,
              history: l.temple.historyMl || l.temple.history,
              deities: l.temple.deities?.map((td) => ({
                ...td,
                deity: td.deity
                  ? {
                      ...td.deity,
                      name: td.deity.nameMl || td.deity.name,
                    }
                  : td.deity,
              })),
            }
          : l.temple,
        festivals: l.festivals?.map((f) => this.localizeFestival(f, lang)),
      };
    }
    return l;
  }

  private localizeFestival(f: any, lang: string) {
    if (lang === 'ml') {
      return {
        ...f,
        name: f.nameMl || f.name,
        description: f.descriptionMl || f.description,
        location: f.location
          ? this.localizeLocation(f.location, lang)
          : f.location,
        deity: f.deity
          ? {
              ...f.deity,
              name: f.deity.nameMl || f.deity.name,
            }
          : f.deity,
      };
    }
    return f;
  }
}
