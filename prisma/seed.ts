import { PrismaClient, Category, Language, MediaType } from '@prisma/client';

import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'dev@mandirmap.com' },
    update: {},
    create: {
      fullName: 'Dev User',
      email: 'dev@mandirmap.com',
      phoneNumber: '+919999999999',
      password: hashedPassword,
      language: Language.ENGLISH,
      avatarUrl:
        'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=200&q=80',
    },
  });

  // 2. Create Deities
  const deities = [
    { name: 'Lord Shiva', nameMl: 'ശിവൻ' },
    { name: 'Lord Vishnu', nameMl: 'വിഷ്ണു' },
    { name: 'Lord Ganesha', nameMl: 'ഗണപതി' },
    { name: 'Lord Krishna', nameMl: 'കൃഷ്ണൻ' },
    { name: 'Lord Hanuman', nameMl: 'ഹനുമാൻ' },
  ];
  const deityRecords: any[] = [];
  for (const item of deities) {
    const d = await prisma.deity.upsert({
      where: { name: item.name },
      update: { nameMl: item.nameMl },
      create: {
        name: item.name,
        nameMl: item.nameMl,
        photoUrl: `https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=200&q=80`,
      },
    });
    deityRecords.push(d);
  }

  // Helper to generate clustered coordinates
  const generateCluster = (
    baseLat: number,
    baseLng: number,
    count: number,
    spread: number = 0.02,
  ) => {
    return Array.from({ length: count }).map((_, i) => ({
      lat: baseLat + (Math.random() - 0.5) * spread,
      lng: baseLng + (Math.random() - 0.5) * spread,
    }));
  };

  const safeCreateLocation = async (data: any) => {
    try {
      await prisma.location.upsert({
        where: { id: data.name },
        update: {},
        create: { ...data, id: data.name },
      });
    } catch (e) {
      console.log(`Skipping duplicate or error for ${data.name}`);
    }
  };

  // 3. Create Locations (Temples) - 20+
  const baseTemples = [
    {
      name: 'Sree Subrahmanya Swamy',
      lat: 12.1031,
      lng: 75.2023,
      dist: 'Kannur',
    },
    {
      name: 'Parassinikadavu Muthappan',
      lat: 11.9839,
      lng: 75.4011,
      dist: 'Kannur',
    },
    { name: 'Guruvayur Temple', lat: 10.5946, lng: 76.0402, dist: 'Thrissur' },
    {
      name: 'Sabarimala Temple',
      lat: 9.4402,
      lng: 77.0696,
      dist: 'Pathanamthitta',
    },
    {
      name: 'Padmanabhaswamy Temple',
      lat: 8.4831,
      lng: 76.9436,
      dist: 'Trivandrum',
    },
    {
      name: 'Chottanikkara Bhagavathy',
      lat: 9.9329,
      lng: 76.3913,
      dist: 'Ernakulam',
    },
  ];

  const templeRecords: any[] = [];
  let templeCount = 0;

  for (const base of baseTemples) {
    // Create the main temple
    templeCount++;
    try {
      const t = await prisma.location.upsert({
        where: { id: base.name },
        update: {},
        create: {
          id: base.name,
          name: base.name,
          category: Category.TEMPLE,
          addressText: `${base.dist}, Kerala`,
          district: base.dist,
          state: 'Kerala',
          latitude: base.lat,
          longitude: base.lng,
          temple: {
            create: {
              history: `Historic temple in ${base.dist}...`,
              openTime: '5:00 AM',
              closeTime: '8:00 PM',
              vazhipaduData: [{ name: 'Pushpanjali', price: 20 }],
            },
          },
          media: {
            create: {
              url: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&q=80',
              type: MediaType.IMAGE,
              user: { connect: { id: user.id } },
            },
          },
        },
      });
      templeRecords.push(t);
    } catch (e) {
      console.log(`Main temple ${base.name} might already exist or error.`);
    }

    // Create 3-4 nearby smaller temples for each main temple
    const nearbyCoords = generateCluster(base.lat, base.lng, 4);
    for (const [i, coord] of nearbyCoords.entries()) {
      templeCount++;
      const name = `Nearby Temple ${templeCount} - ${base.dist}`;
      await safeCreateLocation({
        name: name,
        category: Category.TEMPLE,
        addressText: `Near ${base.name}, ${base.dist}`,
        district: base.dist,
        state: 'Kerala',
        latitude: coord.lat,
        longitude: coord.lng,
        temple: {
          create: {
            history: 'A smaller shrine nearby...',
            openTime: '6:00 AM',
            closeTime: '7:30 PM',
          },
        },
        media: {
          create: {
            url: 'https://images.unsplash.com/photo-1623838615748-0c6756857643?w=800&q=80',
            type: MediaType.IMAGE,
            user: { connect: { id: user.id } },
          },
        },
      });
    }

    // Link some deities to the main temple (using the first available deity for simplicity)
    if (deityRecords.length > 0) {
      try {
        await (prisma as any).templeDeity.upsert({
          where: {
            templeId_deityId: {
              templeId: base.name,
              deityId: deityRecords[0].id,
            },
          },
          update: {},
          create: {
            templeId: base.name,
            deityId: deityRecords[0].id,
          },
        });
      } catch (e) {}
    }
  }

  // 4. Create Festivals - Each main temple gets a festival
  for (const t of templeRecords) {
    if (!t) continue;
    try {
      if (deityRecords.length > 0) {
        await (prisma as any).festival.create({
          data: {
            name: `${t.name} Mahotsavam`,
            nameMl: 'മഹോത്സവം',
            description: 'A grand celebration featuring sacred rituals.',
            startDate: new Date('2026-02-20'),
            endDate: new Date('2026-02-25'),
            locationId: t.id,
            deityId: deityRecords[0].id,
            photoUrl:
              'https://images.unsplash.com/photo-1590760461230-8f453ddb8c0d?w=800&q=80',
          },
        });
      }
    } catch (e) {
      console.log(`Festival for ${t.name} might already exist or error.`);
    }
  }

  // 5. Create Hotels - 10+ (Clustered)
  let hotelCount = 0;
  for (const base of baseTemples) {
    const coords = generateCluster(base.lat, base.lng, 2, 0.015);
    for (const coord of coords) {
      hotelCount++;
      await safeCreateLocation({
        name: `Royal Hotel ${base.dist} ${hotelCount}`,
        category: Category.HOTEL,
        addressText: `Luxury Stay near ${base.name}`,
        district: base.dist,
        state: 'Kerala',
        latitude: coord.lat,
        longitude: coord.lng,
        hotel: {
          create: {
            pricePerDay: 2500 + Math.floor(Math.random() * 5000),
            amenities: ['Wifi', 'AC', 'Pool', 'Breakfast', 'Parking'],
            contactPhone: '+919876543210',
            whatsapp: '+919876543210',
          },
        },
        media: {
          create: {
            url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
            type: MediaType.IMAGE,
            user: { connect: { id: user.id } },
          },
        },
      });
    }
  }

  // 5.5 Create Rentals/Rooms - 10+ (Clustered)
  let rentalCount = 0;
  for (const base of baseTemples) {
    const coords = generateCluster(base.lat, base.lng, 3, 0.01);
    for (const coord of coords) {
      rentalCount++;
      await safeCreateLocation({
        name: `Sree ${base.dist} Lodge ${rentalCount}`,
        category: Category.RENTAL,
        addressText: `Affordable rooms near ${base.name}`,
        district: base.dist,
        state: 'Kerala',
        latitude: coord.lat,
        longitude: coord.lng,
        hotel: {
          // Reusing Hotel model for simplicity as schema matches
          create: {
            pricePerDay: 500 + Math.floor(Math.random() * 800),
            amenities: ['Basic Bed', 'Fan', 'Shared Bath'],
            contactPhone: '+919876543211',
            whatsapp: '+919876543211',
          },
        },
        media: {
          create: {
            url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
            type: MediaType.IMAGE,
            user: { connect: { id: user.id } },
          },
        },
      });
    }
  }

  // 6. Create Restaurants - 20+ (Clustered)
  let restCount = 0;
  for (const base of baseTemples) {
    const coords = generateCluster(base.lat, base.lng, 4, 0.015);
    for (const coord of coords) {
      restCount++;
      await safeCreateLocation({
        name: `Tasty Bites ${base.dist} ${restCount}`,
        category: Category.RESTAURANT,
        addressText: `Opposite ${base.name}`,
        district: base.dist,
        state: 'Kerala',
        latitude: coord.lat,
        longitude: coord.lng,
        restaurant: {
          create: {
            isPureVeg: Math.random() > 0.3, // 70% chance Veg
            menuItems: ['Meals', 'Biriyani', 'Tea', 'Snacks'],
          },
        },
        media: {
          create: {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800&q=80',
            type: MediaType.IMAGE,
            user: { connect: { id: user.id } },
          },
        },
      });
    }
  }

  // 7. Create Astrologers - 20+
  const astroBase = [
    { baseLat: 11.8745, baseLng: 75.3704, count: 5 }, // Kannur
    { baseLat: 10.5, baseLng: 76.2, count: 5 }, // Thrissur
    { baseLat: 8.5, baseLng: 76.9, count: 5 }, // Trivandrum
    { baseLat: 11.25, baseLng: 75.77, count: 5 }, // Kozhikode
  ];

  let astroCount = 0;
  for (const area of astroBase) {
    const coords = generateCluster(
      area.baseLat,
      area.baseLng,
      area.count,
      0.05,
    );
    for (const coord of coords) {
      astroCount++;
      try {
        await prisma.astrologer.upsert({
          where: { id: `astro_${astroCount}` },
          update: {},
          create: {
            id: `astro_${astroCount}`,
            name: `Jyothishi ${astroCount}`,
            experienceYears: 5 + Math.floor(Math.random() * 30),
            hourlyRate: 200 + Math.floor(Math.random() * 1000),
            rating: 3 + Math.random() * 2,
            latitude: coord.lat,
            longitude: coord.lng,
            languages: ['Malayalam', 'English'],
            bio: 'Vedic scholar with deep knowledge.',
          },
        });
      } catch (e) {
        // Fallback create if schema doesn't support ID override or upsert fails
        await prisma.astrologer.create({
          data: {
            name: `Jyothishi ${astroCount}`,
            experienceYears: 5 + Math.floor(Math.random() * 30),
            hourlyRate: 200 + Math.floor(Math.random() * 1000),
            rating: 3 + Math.random() * 2,
            latitude: coord.lat,
            longitude: coord.lng,
            languages: ['Malayalam', 'English'],
            bio: 'Vedic scholar with deep knowledge.',
          },
        });
      }
    }
  }

  // 8. Update PostGIS coordinates for all locations and astrologers
  console.log('Updating PostGIS coordinates...');
  await prisma.$executeRawUnsafe(
    `UPDATE "Location" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;`,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "Astrologer" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;`,
  );

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
