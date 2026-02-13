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

  // 3. Create Locations (Temples)
  const temples = [
    {
      name: 'Sree Subrahmanya Swamy Temple',
      nameMl: 'ശ്രീ സുബ്രഹ്മണ്യ സ്വാമി ക്ഷേത്രം',
      addressText: 'Payyanur, Kannur, Kerala',
      addressTextMl: 'പയ്യന്നൂർ, കണ്ണൂർ, കേരളം',
      district: 'Kannur',
      districtMl: 'കണ്ണൂർ',
      state: 'Kerala',
      stateMl: 'കേരളം',
      lat: 12.1031,
      lng: 75.2023,
      history: 'A historic temple dedicated to Lord Subrahmanya...',
      historyMl:
        'ശ്രീ സുബ്രഹ്മണ്യ സ്വാമിക്ക് സമർപ്പിച്ചിരിക്കുന്ന ഒരു ചരിത്രപ്രസിദ്ധമായ ക്ഷേത്രം...',
    },
    {
      name: 'Parassinikadavu Muthappan Temple',
      nameMl: 'പറശ്ശിനിക്കടവ് മുത്തപ്പൻ ക്ഷേത്രം',
      addressText: 'Parassinikadavu, Kannur, Kerala',
      addressTextMl: 'പറശ്ശിനിക്കടവ്, കണ്ണൂർ, കേരളം',
      district: 'Kannur',
      districtMl: 'കണ്ണൂർ',
      state: 'Kerala',
      stateMl: 'കേരളം',
      lat: 11.9839,
      lng: 75.4011,
      history: 'Famous for Theyyam performance...',
      historyMl: 'തെയ്യം കെട്ടിയാടുന്നതിന് പ്രശസ്തമായ ക്ഷേത്രം...',
    },
    {
      name: 'Guruvayur Temple',
      nameMl: 'ഗുരുവായൂർ ക്ഷേത്രം',
      addressText: 'Guruvayur, Thrissur, Kerala',
      addressTextMl: 'ഗുരുവായൂർ, തൃശൂർ, കേരളം',
      district: 'Thrissur',
      districtMl: 'തൃശൂർ',
      state: 'Kerala',
      stateMl: 'കേരളം',
      lat: 10.5946,
      lng: 76.0402,
      history: 'Dedicated to Lord Guruvayurappan...',
      historyMl: 'ശ്രീ ഗുരൂവായൂരപ്പന് സമർപ്പിച്ചിരിക്കുന്നത്...',
    },
  ];

  const locRecords: any[] = [];
  for (const t of temples) {
    const loc = await prisma.location.upsert({
      where: { id: t.name },
      update: {
        district: t.district,
        districtMl: t.districtMl,
        state: t.state,
        stateMl: t.stateMl,
      },
      create: {
        id: t.name,
        name: t.name,
        nameMl: t.nameMl,
        category: Category.TEMPLE,
        addressText: t.addressText,
        addressTextMl: t.addressTextMl,
        district: t.district,
        districtMl: t.districtMl,
        state: t.state,
        stateMl: t.stateMl,
        latitude: t.lat,
        longitude: t.lng,
        temple: {
          create: {
            history: t.history,
            historyMl: t.historyMl,
            openTime: '5:00 AM',
            closeTime: '8:00 PM',
            vazhipaduData: [
              { name: 'Pushpanjali', price: 20 },
              { name: 'Neyvilakku', price: 50 },
            ],
          },
        },
      },
    });
    locRecords.push(loc);

    // Link some deities to temples
    await (prisma as any).templeDeity.upsert({
      where: {
        templeId_deityId: {
          templeId: loc.id,
          deityId: deityRecords[0].id,
        },
      },
      update: {},
      create: {
        templeId: loc.id,
        deityId: deityRecords[0].id,
      },
    });

    // 4. Create Festivals
    await (prisma as any).festival.create({
      data: {
        name: `${t.name} Mahotsavam`,
        nameMl: 'മഹോത്സവം',
        description: 'A grand celebration featuring sacred rituals.',
        startDate: new Date('2026-02-20'),
        endDate: new Date('2026-02-25'),
        locationId: loc.id,
        deityId: deityRecords[0].id,
        photoUrl:
          'https://images.unsplash.com/photo-1590760461230-8f453ddb8c0d?w=800&q=80',
      },
    });
  }

  // 5. Create Hotels (Rentals)
  const hotels = [
    {
      name: 'Temple View Residency',
      address: 'Near Payyanur Temple, Kannur',
      district: 'Kannur',
      lat: 12.1035,
      lng: 75.2025,
      price: 1200,
    },
    {
      name: 'Thrissur Comfort Stay',
      address: 'Near Guruvayur Temple, Thrissur',
      district: 'Thrissur',
      lat: 10.595,
      lng: 76.041,
      price: 1500,
    },
  ];

  for (const h of hotels) {
    await prisma.location.create({
      data: {
        name: h.name,
        category: Category.HOTEL,
        addressText: h.address,
        district: h.district,
        state: 'Kerala',
        latitude: h.lat,
        longitude: h.lng,
        hotel: {
          create: {
            pricePerDay: h.price,
            amenities: ['Free Wifi', 'Pure Veg', 'AC'],
            contactPhone: '+919999999999',
          },
        },
        media: {
          create: {
            url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
            type: MediaType.IMAGE,
            user: { connect: { id: user.id } },
          },
        },
      },
    });
  }

  // 6. Create Restaurants
  const restaurants = [
    {
      name: 'Annapoorna Pure Veg',
      address: 'Main Road, Payyanur',
      district: 'Kannur',
      lat: 12.102,
      lng: 75.201,
    },
  ];

  for (const r of restaurants) {
    await prisma.location.create({
      data: {
        name: r.name,
        category: Category.RESTAURANT,
        addressText: r.address,
        district: r.district,
        state: 'Kerala',
        latitude: r.lat,
        longitude: r.lng,
        restaurant: {
          create: {
            isPureVeg: true,
            menuItems: ['Sadhya', 'Dosa', 'Idli'],
          },
        },
        media: {
          create: {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800&q=80',
            type: MediaType.IMAGE,
            user: { connect: { id: user.id } },
          },
        },
      },
    });
  }

  // 4. Create Astrologers
  const astrologers = [
    {
      name: 'Dr. K.P. Sharma',
      exp: 15,
      rate: 500,
      rating: 4.8,
      lat: 11.8745,
      lng: 75.3704,
    },
    {
      name: 'Guru Vishwanath',
      exp: 25,
      rate: 1000,
      rating: 4.9,
      lat: 11.9,
      lng: 75.4,
    },
  ];

  for (const a of astrologers) {
    await prisma.astrologer.create({
      data: {
        name: a.name,
        experienceYears: a.exp,
        hourlyRate: a.rate,
        rating: a.rating,
        latitude: a.lat,
        longitude: a.lng,
        languages: ['English', 'Malayalam', 'Hindi'],
        bio: 'Expert in Vedic Astrology and Palmistry.',
      },
    });
  }

  // 7. Update PostGIS coordinates for all locations and astrologers
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
