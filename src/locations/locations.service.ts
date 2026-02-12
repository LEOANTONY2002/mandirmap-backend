import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(lang: string, category?: Category) {
    const locations = await this.prisma.location.findMany({
      where: category ? { category } : {},
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
      },
    });
    return locations.map((l) => this.localizeLocation(l, lang));
  }

  async findNearby(
    lang: string,
    lat: number,
    lng: number,
    radiusInMeters: number = 5000,
  ) {
    const locations: any[] = await this.prisma.$queryRaw`
      SELECT l.id, l.name, l.name_ml as "nameMl", l.category, l.description, l.description_ml as "descriptionMl", 
             l.address_text as "addressText", l.address_text_ml as "addressTextMl",
             l.latitude, l.longitude, l.average_rating as "averageRating", 
             l.total_ratings as "totalRatings",
             ST_Distance(l.coords, ST_MakePoint(${lng}, ${lat})::geography) as distance
      FROM "Location" l
      WHERE ST_DWithin(l.coords, ST_MakePoint(${lng}, ${lat})::geography, ${radiusInMeters})
      ORDER BY distance ASC
    `;
    return locations.map((l) => this.localizeLocation(l, lang));
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

  async getFestivals(lang: string, district?: string) {
    const festivals = await this.prisma.festival.findMany({
      where: district
        ? {
            OR: [
              {
                location: {
                  addressText: { contains: district, mode: 'insensitive' },
                },
              },
              {
                name: { contains: district, mode: 'insensitive' },
              },
            ],
          }
        : {},
      include: {
        location: true,
        deity: true,
      },
      orderBy: { startDate: 'asc' },
    });
    return festivals.map((f) => this.localizeFestival(f, lang));
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
        temple: true,
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
        festivals: true,
        reviews: {
          include: { user: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        media: true,
      },
    });
    return location ? this.localizeLocation(location, lang) : null;
  }

  private localizeLocation(l: any, lang: string) {
    if (lang === 'ml') {
      return {
        ...l,
        name: l.nameMl || l.name,
        description: l.descriptionMl || l.description,
        addressText: l.addressTextMl || l.addressText,
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
