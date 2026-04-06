import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Language, MediaType, Prisma } from '@prisma/client';
import { MediaService } from '../media/media.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

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

  async listUsers(params: {
    search?: string;
    state?: string;
    language?: string;
    hasAvatar?: string;
    page?: string;
    pageSize?: string;
  }) {
    const pagination = this.getPagination(params.page, params.pageSize);
    const where: Prisma.UserWhereInput = {
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: 'insensitive' } },
              { email: { contains: params.search, mode: 'insensitive' } },
              { phoneNumber: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(params.state
        ? { state: { contains: params.state, mode: 'insensitive' } }
        : {}),
      ...(params.language ? { language: params.language as Language } : {}),
      ...(params.hasAvatar === 'true'
        ? { avatarUrl: { not: null } }
        : params.hasAvatar === 'false'
          ? { avatarUrl: null }
          : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          avatarUrl: true,
          language: true,
          district: true,
          state: true,
          address1: true,
          address2: true,
          address3: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return this.paginated(items, total, pagination);
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

  async listLocations(params: {
    category?: Category;
    search?: string;
    district?: string;
    state?: string;
    hasMedia?: string;
    page?: string;
    pageSize?: string;
  }) {
    const pagination = this.getPagination(params.page, params.pageSize);
    const where: Prisma.LocationWhereInput = {
      ...(params.category ? { category: params.category } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { addressText: { contains: params.search, mode: 'insensitive' } },
              { district: { contains: params.search, mode: 'insensitive' } },
              { state: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(params.district
        ? { district: { contains: params.district, mode: 'insensitive' } }
        : {}),
      ...(params.state
        ? { state: { contains: params.state, mode: 'insensitive' } }
        : {}),
      ...(params.hasMedia === 'true'
        ? { media: { some: {} } }
        : params.hasMedia === 'false'
          ? { media: { none: {} } }
          : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          media: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          restaurant: {
            include: {
              menuItems: {
                take: 1,
              },
            },
          },
          hotel: {
            include: {
              amenities: {
                take: 2,
                include: { amenity: true },
              },
            },
          },
          temple: {
            include: {
              deities: {
                take: 2,
                include: { deity: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    return this.paginated(items, total, pagination);
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

  async listDeities(params: {
    search?: string;
    hasPhoto?: string;
    page?: string;
    pageSize?: string;
  }) {
    const pagination = this.getPagination(params.page, params.pageSize);
    const where: Prisma.DeityWhereInput = {
      ...(params.search
        ? { name: { contains: params.search, mode: 'insensitive' } }
        : {}),
      ...(params.hasPhoto === 'true'
        ? { photoUrl: { not: null } }
        : params.hasPhoto === 'false'
          ? { photoUrl: null }
          : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.deity.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.deity.count({ where }),
    ]);

    return this.paginated(items, total, pagination);
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

  async listAmenities(params: {
    search?: string;
    hasImage?: string;
    page?: string;
    pageSize?: string;
  }) {
    const pagination = this.getPagination(params.page, params.pageSize);
    const where: Prisma.AmenityWhereInput = {
      ...(params.search
        ? { title: { contains: params.search, mode: 'insensitive' } }
        : {}),
      ...(params.hasImage === 'true'
        ? { image: { not: null } }
        : params.hasImage === 'false'
          ? { image: null }
          : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.amenity.findMany({
        where,
        orderBy: { title: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.amenity.count({ where }),
    ]);

    return this.paginated(items, total, pagination);
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

  async listFestivals(params: {
    search?: string;
    locationId?: string;
    deityId?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }) {
    const pagination = this.getPagination(params.page, params.pageSize);
    const now = new Date();
    const where: Prisma.FestivalWhereInput = {
      ...(params.search
        ? { name: { contains: params.search, mode: 'insensitive' } }
        : {}),
      ...(params.locationId ? { locationId: params.locationId } : {}),
      ...(params.deityId ? { deityId: Number(params.deityId) } : {}),
      ...(params.status === 'upcoming'
        ? { startDate: { gt: now } }
        : params.status === 'ongoing'
          ? { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] }
          : params.status === 'completed'
            ? { endDate: { lt: now } }
            : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.festival.findMany({
        where,
        include: {
          location: {
            select: { id: true, name: true },
          },
          deity: {
            select: { id: true, name: true },
          },
        },
        orderBy: { startDate: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.festival.count({ where }),
    ]);

    return this.paginated(items, total, pagination);
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

  async listAstrologers(params: {
    search?: string;
    state?: string;
    district?: string;
    verified?: string;
    hasAvatar?: string;
    page?: string;
    pageSize?: string;
  }) {
    const pagination = this.getPagination(params.page, params.pageSize);
    const where: Prisma.AstrologerWhereInput = {
      ...(params.search
        ? { name: { contains: params.search, mode: 'insensitive' } }
        : {}),
      ...(params.state
        ? { state: { contains: params.state, mode: 'insensitive' } }
        : {}),
      ...(params.district
        ? { district: { contains: params.district, mode: 'insensitive' } }
        : {}),
      ...(params.verified === 'true'
        ? { isVerified: true }
        : params.verified === 'false'
          ? { isVerified: false }
          : {}),
      ...(params.hasAvatar === 'true'
        ? { avatarUrl: { not: null } }
        : params.hasAvatar === 'false'
          ? { avatarUrl: null }
          : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.astrologer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.astrologer.count({ where }),
    ]);

    return this.paginated(items, total, pagination);
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

  async uploadAsset(file: Express.Multer.File, folder?: string) {
    const url = await this.mediaService.uploadFile(file, folder || 'admin');
    return { url };
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

  private getPagination(page?: string, pageSize?: string) {
    const currentPage = Math.max(parseInt(page || '1', 10) || 1, 1);
    const currentPageSize = Math.min(
      Math.max(parseInt(pageSize || '12', 10) || 12, 1),
      50,
    );

    return {
      page: currentPage,
      pageSize: currentPageSize,
      skip: (currentPage - 1) * currentPageSize,
      take: currentPageSize,
    };
  }

  private paginated<T>(
    items: T[],
    total: number,
    pagination: { page: number; pageSize: number },
  ) {
    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pagination.pageSize), 1),
      },
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
