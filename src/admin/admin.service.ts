import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Language, MediaType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type SaveLocationInput = {
  name: string;
  nameMl?: string | null;
  category: Category;
  description?: string | null;
  descriptionMl?: string | null;
  addressText: string;
  addressTextMl?: string | null;
  latitude: number;
  longitude: number;
  district?: string | null;
  districtMl?: string | null;
  state?: string | null;
  stateMl?: string | null;
  temple?: {
    history?: string | null;
    historyMl?: string | null;
    openTime?: string | null;
    closeTime?: string | null;
    vazhipaduData?: unknown;
    deityIds?: number[];
  } | null;
  hotel?: {
    pricePerDay: number | string;
    contactPhone?: string | null;
    whatsapp?: string | null;
    amenityIds?: number[];
  } | null;
  restaurant?: {
    isPureVeg?: boolean;
    menuItems?: Array<{
      id?: string;
      name: string;
      image?: string | null;
      price: number | string;
    }>;
  } | null;
  media?: Array<{
    id?: string;
    url: string;
    thumbnailUrl?: string | null;
    type: MediaType;
  }>;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      users,
      locations,
      festivals,
      astrologers,
      reviews,
      media,
      deities,
      amenities,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.location.count(),
      this.prisma.festival.count(),
      this.prisma.astrologer.count(),
      this.prisma.review.count(),
      this.prisma.mediaContent.count(),
      this.prisma.deity.count(),
      this.prisma.amenity.count(),
    ]);

    const categories = await this.prisma.location.groupBy({
      by: ['category'],
      _count: { _all: true },
    });

    return {
      stats: {
        users,
        locations,
        festivals,
        astrologers,
        reviews,
        media,
        deities,
        amenities,
      },
      categories,
    };
  }

  listUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phoneNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        language: true,
        district: true,
        state: true,
        createdAt: true,
      },
    });
  }

  updateUser(
    id: string,
    body: Partial<{
      fullName: string;
      email: string;
      phoneNumber: string;
      language: Language;
      address1: string | null;
      address2: string | null;
      address3: string | null;
      district: string | null;
      state: string | null;
      avatarUrl: string | null;
    }>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: body,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        language: true,
        district: true,
        state: true,
        createdAt: true,
      },
    });
  }

  listLocations(params: { category?: Category; search?: string }) {
    return this.prisma.location.findMany({
      where: {
        category: params.category,
        ...(params.search
          ? {
              OR: [
                { name: { contains: params.search, mode: 'insensitive' } },
                {
                  addressText: { contains: params.search, mode: 'insensitive' },
                },
                { district: { contains: params.search, mode: 'insensitive' } },
                { state: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        temple: {
          include: {
            deities: {
              include: { deity: true },
            },
          },
        },
        hotel: {
          include: {
            amenities: {
              include: { amenity: true },
            },
          },
        },
        restaurant: {
          include: {
            menuItems: true,
          },
        },
        festivals: true,
        media: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getLocation(id: string) {
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
        hotel: {
          include: {
            amenities: {
              include: { amenity: true },
            },
          },
        },
        restaurant: {
          include: {
            menuItems: true,
          },
        },
        media: {
          orderBy: { createdAt: 'desc' },
        },
        festivals: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async createLocation(body: SaveLocationInput, uploaderId: string) {
    return this.saveLocation(null, body, uploaderId);
  }

  async updateLocation(id: string, body: SaveLocationInput, uploaderId: string) {
    return this.saveLocation(id, body, uploaderId);
  }

  async deleteLocation(id: string) {
    await this.prisma.location.delete({ where: { id } });
    return { success: true };
  }

  listDeities(search?: string) {
    return this.prisma.deity.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  createDeity(body: { name: string; nameMl?: string | null; photoUrl?: string | null }) {
    return this.prisma.deity.create({ data: body });
  }

  updateDeity(
    id: number,
    body: { name?: string; nameMl?: string | null; photoUrl?: string | null },
  ) {
    return this.prisma.deity.update({ where: { id }, data: body });
  }

  async deleteDeity(id: number) {
    await this.prisma.deity.delete({ where: { id } });
    return { success: true };
  }

  listAmenities(search?: string) {
    return this.prisma.amenity.findMany({
      where: search
        ? { title: { contains: search, mode: 'insensitive' } }
        : undefined,
      orderBy: { title: 'asc' },
    });
  }

  createAmenity(body: { title: string; image?: string | null }) {
    return this.prisma.amenity.create({ data: body });
  }

  updateAmenity(id: number, body: { title?: string; image?: string | null }) {
    return this.prisma.amenity.update({ where: { id }, data: body });
  }

  async deleteAmenity(id: number) {
    await this.prisma.amenity.delete({ where: { id } });
    return { success: true };
  }

  listFestivals(search?: string) {
    return this.prisma.festival.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: {
        location: {
          select: { id: true, name: true },
        },
        deity: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  createFestival(body: {
    name: string;
    nameMl?: string | null;
    description?: string | null;
    descriptionMl?: string | null;
    startDate: string;
    endDate: string;
    locationId: string;
    deityId?: number | null;
    photoUrl?: string | null;
  }) {
    return this.prisma.festival.create({
      data: {
        ...body,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
      include: {
        location: { select: { id: true, name: true } },
        deity: { select: { id: true, name: true } },
      },
    });
  }

  updateFestival(
    id: string,
    body: Partial<{
      name: string;
      nameMl: string | null;
      description: string | null;
      descriptionMl: string | null;
      startDate: string;
      endDate: string;
      locationId: string;
      deityId: number | null;
      photoUrl: string | null;
    }>,
  ) {
    const data: Record<string, unknown> = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);

    return this.prisma.festival.update({
      where: { id },
      data,
      include: {
        location: { select: { id: true, name: true } },
        deity: { select: { id: true, name: true } },
      },
    });
  }

  async deleteFestival(id: string) {
    await this.prisma.festival.delete({ where: { id } });
    return { success: true };
  }

  listAstrologers(search?: string) {
    return this.prisma.astrologer.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async createAstrologer(body: Record<string, any>) {
    const astrologer = await this.prisma.astrologer.create({
      data: this.astrologerData(body),
    });
    await this.syncAstrologerCoords(astrologer.id, astrologer.latitude, astrologer.longitude);
    return astrologer;
  }

  async updateAstrologer(id: string, body: Record<string, any>) {
    const astrologer = await this.prisma.astrologer.update({
      where: { id },
      data: this.astrologerData(body),
    });
    await this.syncAstrologerCoords(astrologer.id, astrologer.latitude, astrologer.longitude);
    return astrologer;
  }

  async deleteAstrologer(id: string) {
    await this.prisma.astrologer.delete({ where: { id } });
    return { success: true };
  }

  async getOptions() {
    const [deities, amenities, locations] = await Promise.all([
      this.prisma.deity.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.amenity.findMany({ orderBy: { title: 'asc' } }),
      this.prisma.location.findMany({
        select: { id: true, name: true, category: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { deities, amenities, locations, categories: Object.values(Category) };
  }

  private async saveLocation(
    id: string | null,
    body: SaveLocationInput,
    uploaderId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const location = id
        ? await tx.location.update({
            where: { id },
            data: this.locationData(body),
          })
        : await tx.location.create({
            data: this.locationData(body),
          });

      await this.syncLocationCoords(tx, location.id, body.latitude, body.longitude);

      if (body.category === Category.TEMPLE) {
        await tx.temple.upsert({
          where: { locationId: location.id },
          create: {
            locationId: location.id,
            history: body.temple?.history ?? null,
            historyMl: body.temple?.historyMl ?? null,
            openTime: body.temple?.openTime ?? null,
            closeTime: body.temple?.closeTime ?? null,
            vazhipaduData: body.temple?.vazhipaduData ?? Prisma.JsonNull,
          },
          update: {
            history: body.temple?.history ?? null,
            historyMl: body.temple?.historyMl ?? null,
            openTime: body.temple?.openTime ?? null,
            closeTime: body.temple?.closeTime ?? null,
            vazhipaduData: body.temple?.vazhipaduData ?? Prisma.JsonNull,
          },
        });

        await tx.templeDeity.deleteMany({ where: { templeId: location.id } });
        if (body.temple?.deityIds?.length) {
          await tx.templeDeity.createMany({
            data: body.temple.deityIds.map((deityId) => ({
              templeId: location.id,
              deityId,
            })),
          });
        }
      } else {
        await tx.temple.deleteMany({ where: { locationId: location.id } });
      }

      if (
        body.category === Category.HOTEL ||
        body.category === Category.RENTAL
      ) {
        await tx.hotel.upsert({
          where: { locationId: location.id },
          create: {
            locationId: location.id,
            pricePerDay: new Prisma.Decimal(body.hotel?.pricePerDay ?? 0),
            contactPhone: body.hotel?.contactPhone ?? null,
            whatsapp: body.hotel?.whatsapp ?? null,
          },
          update: {
            pricePerDay: new Prisma.Decimal(body.hotel?.pricePerDay ?? 0),
            contactPhone: body.hotel?.contactPhone ?? null,
            whatsapp: body.hotel?.whatsapp ?? null,
          },
        });

        await tx.hotelAmenity.deleteMany({
          where: { hotelLocationId: location.id },
        });
        if (body.hotel?.amenityIds?.length) {
          await tx.hotelAmenity.createMany({
            data: body.hotel.amenityIds.map((amenityId) => ({
              hotelLocationId: location.id,
              amenityId,
            })),
          });
        }
      } else {
        await tx.hotel.deleteMany({ where: { locationId: location.id } });
      }

      if (body.category === Category.RESTAURANT) {
        await tx.restaurant.upsert({
          where: { locationId: location.id },
          create: {
            locationId: location.id,
            isPureVeg: body.restaurant?.isPureVeg ?? true,
          },
          update: {
            isPureVeg: body.restaurant?.isPureVeg ?? true,
          },
        });

        await tx.restaurantMenuItem.deleteMany({
          where: { restaurantLocationId: location.id },
        });
        if (body.restaurant?.menuItems?.length) {
          await tx.restaurantMenuItem.createMany({
            data: body.restaurant.menuItems.map((item) => ({
              id: item.id,
              restaurantLocationId: location.id,
              name: item.name,
              image: item.image ?? null,
              price: new Prisma.Decimal(item.price),
            })),
          });
        }
      } else {
        await tx.restaurant.deleteMany({ where: { locationId: location.id } });
      }

      await tx.mediaContent.deleteMany({
        where: { locationId: location.id },
      });
      if (body.media?.length) {
        await tx.mediaContent.createMany({
          data: body.media.map((item) => ({
            id: item.id,
            uploaderId,
            locationId: location.id,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl ?? null,
            type: item.type,
          })),
        });
      }

      return this.getLocation(location.id);
    });
  }

  private locationData(body: SaveLocationInput) {
    return {
      name: body.name,
      nameMl: body.nameMl ?? null,
      category: body.category,
      description: body.description ?? null,
      descriptionMl: body.descriptionMl ?? null,
      addressText: body.addressText,
      addressTextMl: body.addressTextMl ?? null,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      district: body.district ?? null,
      districtMl: body.districtMl ?? null,
      state: body.state ?? null,
      stateMl: body.stateMl ?? null,
    };
  }

  private astrologerData(body: Record<string, any>) {
    return {
      name: body.name,
      avatarUrl: body.avatarUrl ?? null,
      experienceYears: Number(body.experienceYears ?? 0),
      languages: Array.isArray(body.languages) ? body.languages : [],
      hourlyRate: new Prisma.Decimal(body.hourlyRate ?? 0),
      bio: body.bio ?? null,
      rating: Number(body.rating ?? 0),
      totalRatings: Number(body.totalRatings ?? 0),
      isVerified: Boolean(body.isVerified),
      phoneNumber: body.phoneNumber ?? null,
      whatsappNumber: body.whatsappNumber ?? null,
      photoUrls: Array.isArray(body.photoUrls) ? body.photoUrls : [],
      latitude: Number(body.latitude ?? 0),
      longitude: Number(body.longitude ?? 0),
      district: body.district ?? null,
      state: body.state ?? null,
    };
  }

  private async syncLocationCoords(
    tx: Prisma.TransactionClient,
    locationId: string,
    latitude: number,
    longitude: number,
  ) {
    await tx.$executeRaw`
      UPDATE "Location"
      SET "coords" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      WHERE "id" = ${locationId}
    `;
  }

  private async syncAstrologerCoords(
    astrologerId: string,
    latitude: number,
    longitude: number,
  ) {
    await this.prisma.$executeRaw`
      UPDATE "Astrologer"
      SET "coords" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      WHERE "id" = ${astrologerId}
    `;
  }
}
