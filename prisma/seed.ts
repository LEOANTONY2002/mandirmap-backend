import {
  PrismaClient,
  Category,
  Language,
  MediaType,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const TEMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=800&q=80',
  'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=80',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80',
  'https://images.unsplash.com/photo-1609766857370-2de5ccc5f4be?w=800&q=80',
  'https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=800&q=80',
  'https://images.unsplash.com/photo-1602571577403-c527c40736e0?w=800&q=80',
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80',
  'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?w=800&q=80',
];

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
];

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  'https://images.unsplash.com/photo-1574936145840-28808d77a0b6?w=800&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
];

const MENU_ITEM_IMAGES = [
  'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80',
  'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
];

async function main() {
  console.log(
    '🏛️  Generating ULTIMATE KANNUR-CENTRIC Dataset (200+ Records)...',
  );

  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('🧹 Clearing tables for fresh start...');
  await prisma.review.deleteMany();
  await prisma.festival.deleteMany();
  await prisma.templeDeity.deleteMany();
  await prisma.mediaContent.deleteMany();
  await prisma.hotelAmenity.deleteMany();
  await prisma.restaurantMenuItem.deleteMany();
  await prisma.temple.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.location.deleteMany();
  await prisma.deity.deleteMany();
  await prisma.astrologer.deleteMany();

  // 1. User with focus on Kannur
  const user = await prisma.user.upsert({
    where: { email: 'dev@mandirmap.com' },
    update: { district: 'Kannur', state: 'Kerala' },
    create: {
      fullName: 'Mandir Map Dev',
      email: 'dev@mandirmap.com',
      phoneNumber: '+919999999999',
      password: hashedPassword,
      avatarUrl: 'https://i.pravatar.cc/300?u=dev',
      district: 'Kannur',
      state: 'Kerala',
    },
  });

  // 2. Deities (12 Total)
  const deityDefs = [
    { name: 'Lord Shiva', ml: 'ശിവൻ' },
    { name: 'Lord Vishnu', ml: 'വിഷ്ണു' },
    { name: 'Lord Ganesha', ml: 'ഗണപതി' },
    { name: 'Lord Krishna', ml: 'കൃഷ്ണൻ' },
    { name: 'Lord Hanuman', ml: 'ഹനുമാൻ' },
    { name: 'Goddess Devi', ml: 'ദേവി' },
    { name: 'Lord Murugan', ml: 'മുരുകൻ' },
    { name: 'Lord Ayyappa', ml: 'അയ്യപ്പൻ' },
    { name: 'Lord Rama', ml: 'ശ്രീരാമൻ' },
    { name: 'Goddess Saraswati', ml: 'സരസ്വതി' },
    { name: 'Goddess Lakshmi', ml: 'ലക്ഷ്മി' },
    { name: 'Lord Parashurama', ml: 'പരശുരാമൻ' },
  ];

  const deityRecords: any[] = [];
  for (const d of deityDefs) {
    const rec = await prisma.deity.create({
      data: {
        name: d.name,
        nameMl: d.ml,
        photoUrl: pick(TEMPLE_IMAGES, rand(0, 9)),
      },
    });
    deityRecords.push(rec);
  }
  console.log(`✅ ${deityRecords.length} deities created.`);

  // 3. Districts (5 Cities)
  const districts = [
    { name: 'Kannur', ml: 'കണ്ണൂർ' },
    { name: 'Thrissur', ml: 'തൃശ്ശൂർ' },
    { name: 'Thiruvananthapuram', ml: 'തിരുവനന്തപുരം' },
    { name: 'Ernakulam', ml: 'എറണാകുളം' },
    { name: 'Kozhikode', ml: 'കോഴിക്കോട്' },
  ];

  const amenityDefs = [
    {
      title: '150 Mtr from Temple',
      image:
        'https://img.icons8.com/fluency-systems-filled/96/FA6A35/marker.png',
    },
    {
      title: 'Breakfast Included',
      image:
        'https://img.icons8.com/fluency-systems-filled/96/FA6A35/bread.png',
    },
    {
      title: 'Cleaned Rooms',
      image:
        'https://img.icons8.com/fluency-systems-filled/96/FA6A35/room.png',
    },
    {
      title: '3 BHK 3 Bathrooms',
      image:
        'https://img.icons8.com/fluency-systems-filled/96/FA6A35/home.png',
    },
    {
      title: 'Free WiFi Available',
      image:
        'https://img.icons8.com/fluency-systems-filled/96/FA6A35/wifi.png',
    },
    {
      title: 'Air Condition',
      image:
        'https://img.icons8.com/fluency-systems-filled/96/FA6A35/air-conditioner.png',
    },
  ];

  const amenities: Array<{ id: number; title: string; image: string | null }> =
    [];
  for (const amenity of amenityDefs) {
    amenities.push(await prisma.amenity.create({ data: amenity }));
  }

  // 4. Temples - Clustered for "Nearby" functionality (35 Total, 20 in Kannur)
  const templates = [
    // --- KANNUR CLUSTER: TALIPARAMBA (Nearby check) ---
    {
      id: 't-raja',
      name: 'Sree Rajarajeswara',
      ml: 'രാജരാജേശ്വര ക്ഷേത്രം',
      dist: 'Kannur',
      dIdx: 0,
      lat: 12.0314,
      lng: 75.3578,
    },
    {
      id: 't-tri',
      name: 'Trichambaram Krishna',
      ml: 'തൃച്ചംബരം കൃഷ്ണ ക്ഷേത്രം',
      dist: 'Kannur',
      dIdx: 3,
      lat: 12.0222,
      lng: 75.3622,
    },
    {
      id: 't-kan',
      name: 'Kanhirangad Vaidyanatha',
      ml: 'കാഞ്ഞിരങ്ങാട് വൈദ്യനാഥ',
      dist: 'Kannur',
      dIdx: 0,
      lat: 12.0441,
      lng: 75.3822,
    },

    // --- KANNUR CLUSTER: CANNANORE CITY ---
    {
      id: 't-sun',
      name: 'Sundareswara Temple',
      ml: 'സുന്ദരേശ്വര ക്ഷേത്രം',
      dist: 'Kannur',
      dIdx: 0,
      lat: 11.8799,
      lng: 75.3611,
    },
    {
      id: 't-pay',
      name: 'Payyambalam Krishna',
      ml: 'പയ്യാമ്പലം കൃഷ്ണ ക്ഷേത്രം',
      dist: 'Kannur',
      dIdx: 3,
      lat: 11.8711,
      lng: 75.3522,
    },
    {
      id: 't-kad',
      name: 'Kadalayi Sri Krishna',
      ml: 'കടലായി കൃഷ്ണ ക്ഷേത്രം',
      dist: 'Kannur',
      dIdx: 3,
      lat: 11.8544,
      lng: 75.3811,
    },

    // --- KANNUR CLUSTER: THALASSERY ---
    {
      id: 't-rama',
      name: 'Thiruvangad Rama',
      ml: 'തിരുവങ്ങാട് ശ്രീരാമൻ',
      dist: 'Kannur',
      dIdx: 8,
      lat: 11.7511,
      lng: 75.4922,
    },
    {
      id: 't-jaga',
      name: 'Jagannath Temple',
      ml: 'ജഗന്നാഥ ക്ഷേത്രം',
      dist: 'Kannur',
      dIdx: 0,
      lat: 11.7566,
      lng: 75.4855,
    },
    {
      id: 't-ga',
      name: 'Tellicherry Ganesha',
      ml: 'തലശ്ശേരി ഗണപതി',
      dist: 'Kannur',
      dIdx: 2,
      lat: 11.7533,
      lng: 75.4911,
    },

    // --- OTHER KANNUR ---
    {
      id: 't-mut',
      name: 'Parassinikkadavu Muthappan',
      ml: 'പറശ്ശിനിക്കടവ് മുത്തപ്പൻ',
      dist: 'Kannur',
      dIdx: 0,
      lat: 11.9839,
      lng: 75.3986,
    },
    {
      id: 't-sub',
      name: 'Subramanya Swami Payyanur',
      ml: 'പയ്യന്നൂർ സുബ്രഹ്മണ്യസ്വാമി',
      dist: 'Kannur',
      dIdx: 6,
      lat: 12.1031,
      lng: 75.2023,
    },
    {
      id: 't-pera',
      name: 'Peralassery Subramanya',
      ml: 'പെരളശ്ശേരി സുബ്രഹ്മണ്യ',
      dist: 'Kannur',
      dIdx: 6,
      lat: 11.8322,
      lng: 75.4611,
    },
    {
      id: 't-mri',
      name: 'Mridanga Saileswari',
      ml: 'മൃദംഗ ശൈലേശ്വരി',
      dist: 'Kannur',
      dIdx: 5,
      lat: 11.9022,
      lng: 75.8111,
    },
    {
      id: 't-ann',
      name: 'Cherukunnu Annapoorneswari',
      ml: 'അന്നപൂർണ്ണേശ്വരി ക്ഷേത്രം',
      dist: 'Kannur',
      dIdx: 5,
      lat: 11.9811,
      lng: 75.2811,
    },
    {
      id: 't-oor',
      name: 'Oorpazhachi Kavu',
      ml: 'ഊർപഴച്ചിക്കാവ്',
      dist: 'Kannur',
      dIdx: 5,
      lat: 11.8922,
      lng: 75.4211,
    },
    {
      id: 't-trik',
      name: 'Thrikkaikkunnu Mahadeva',
      ml: 'തൃക്കൈക്കുന്ന് മഹാദേവ',
      dist: 'Kannur',
      dIdx: 0,
      lat: 11.7222,
      lng: 75.5511,
    },
    {
      id: 't-kod',
      name: 'Kottiyoor Vadakkeshwaram',
      ml: 'കൊട്ടിയൂർ മഹാദേവ',
      dist: 'Kannur',
      dIdx: 0,
      lat: 11.88,
      lng: 75.83,
    },
    {
      id: 't-kanh',
      name: 'Kanhirangad Vaidyanatha 2',
      ml: 'കാഞ്ഞിരങ്ങാട് വൈദ്യനാഥ 2',
      dist: 'Kannur',
      dIdx: 0,
      lat: 12.045,
      lng: 75.383,
    },
    {
      id: 't-kal',
      name: 'Kalliasseri Krishna',
      ml: 'കല്ല്യാശ്ശേരി കൃഷ്ണൻ',
      dist: 'Kannur',
      dIdx: 3,
      lat: 11.94,
      lng: 75.35,
    },
    {
      id: 't-muz',
      name: 'Muzhappilangad Bhagavathy',
      ml: 'മുഴപ്പിലങ്ങാട് ഭഗവതി',
      dist: 'Kannur',
      dIdx: 5,
      lat: 11.8,
      lng: 75.45,
    },

    // --- THRISSUR (4) ---
    {
      id: 't-vad',
      name: 'Vadakkunnathan',
      ml: 'വടക്കുന്നാഥൻ',
      dist: 'Thrissur',
      dIdx: 0,
      lat: 10.5199,
      lng: 76.2133,
    },
    {
      id: 't-guru',
      name: 'Guruvayur Krishna',
      ml: 'ഗുരുവായൂർ കൃഷ്ണൻ',
      dist: 'Thrissur',
      dIdx: 3,
      lat: 10.5946,
      lng: 76.0402,
    },
    {
      id: 't-para',
      name: 'Paramekkavu Devi',
      ml: 'പാറമേക്കാവ് ദേവി',
      dist: 'Thrissur',
      dIdx: 5,
      lat: 10.5266,
      lng: 76.2166,
    },
    {
      id: 't-thir',
      name: 'Thiruvambadi Krishna',
      ml: 'തിരുവമ്പാടി കൃഷ്ണൻ',
      dist: 'Thrissur',
      dIdx: 3,
      lat: 10.5311,
      lng: 76.2122,
    },

    // --- TVM (4) ---
    {
      id: 't-pad',
      name: 'Padmanabhaswamy',
      ml: 'പദ്മനാഭസ്വാമി',
      dist: 'Thiruvananthapuram',
      dIdx: 1,
      lat: 8.4831,
      lng: 76.9436,
    },
    {
      id: 't-attu',
      name: 'Attukal Bhagavathy',
      ml: 'ആറ്റുകാൽ ഭഗവതി',
      dist: 'Thiruvananthapuram',
      dIdx: 5,
      lat: 8.5002,
      lng: 76.9547,
    },
    {
      id: 't-pazh',
      name: 'Pazhavangadi Ganapathy',
      ml: 'പഴവങ്ങാടി ഗണപതി',
      dist: 'Thiruvananthapuram',
      dIdx: 2,
      lat: 8.4841,
      lng: 76.9442,
    },
    {
      id: 't-hanu',
      name: 'East Fort Hanuman',
      ml: 'ഹനുമാൻ ക്ഷേത്രം',
      dist: 'Thiruvananthapuram',
      dIdx: 4,
      lat: 8.485,
      lng: 76.945,
    },

    // --- ERNAKULAM (4) ---
    {
      id: 't-erna',
      name: 'Ernakulathappan',
      ml: 'എറണാകുളത്തപ്പൻ',
      dist: 'Ernakulam',
      dIdx: 0,
      lat: 9.9818,
      lng: 76.2822,
    },
    {
      id: 't-chot',
      name: 'Chottanikkara Devi',
      ml: 'ചോറ്റാനിക്കര ദേവി',
      dist: 'Ernakulam',
      dIdx: 5,
      lat: 9.9329,
      lng: 76.3913,
    },
    {
      id: 't-poor',
      name: 'Poornathrayeesa',
      ml: 'പൂർണ്ണത്രയീശ',
      dist: 'Ernakulam',
      dIdx: 1,
      lat: 9.9511,
      lng: 76.3522,
    },
    {
      id: 't-thrik',
      name: 'Thrikkakara Vamana',
      ml: 'തൃക്കാക്കര വാമന ക്ഷേത്രം',
      dist: 'Ernakulam',
      dIdx: 1,
      lat: 10.0322,
      lng: 76.3311,
    },

    // --- KOZHIKODE(3) ---
    {
      id: 't-tali',
      name: 'Tali Mahadeva',
      ml: 'തളി മഹാദേവ',
      dist: 'Kozhikode',
      dIdx: 0,
      lat: 11.2488,
      lng: 75.7899,
    },
    {
      id: 't-vala',
      name: 'Valayanad Devi',
      ml: 'വളയനാട് ദേവി',
      dist: 'Kozhikode',
      dIdx: 5,
      lat: 11.2411,
      lng: 75.8011,
    },
    {
      id: 't-loka',
      name: 'Lokanarkavu Devi',
      ml: 'ലോകനാർകാവ് ദേവി',
      dist: 'Kozhikode',
      dIdx: 5,
      lat: 11.6022,
      lng: 75.6511,
    },
  ];

  const templeRecords: any[] = [];
  for (const t of templates) {
    const loc = await prisma.location.create({
      data: {
        id: t.id,
        name: t.name,
        nameMl: t.ml,
        category: Category.TEMPLE,
        description: `Sacred temple in ${t.dist}.`,
        descriptionMl: `${t.dist} ജില്ലയിലെ പവിത്രമായ ക്ഷേത്രം.`,
        addressText: `${t.dist}, Kerala`,
        district: t.dist,
        districtMl: districts.find((d) => d.name === t.dist)?.ml,
        state: 'Kerala',
        latitude: t.lat,
        longitude: t.lng,
        averageRating: 4.8,
        totalRatings: rand(500, 2000),
        temple: {
          create: {
            history: `Ancient legendary history of ${t.name}.`,
            openTime: '4:00 AM',
            closeTime: '8:30 PM',
            vazhipaduData: [
              { name: 'Pushpanjali', price: 50 },
              { name: 'Neyyabhishekam', price: 200 },
            ] as any,
          },
        },
        media: {
          create: [
            {
              url: pick(TEMPLE_IMAGES, rand(0, 9)),
              type: MediaType.IMAGE,
              user: { connect: { id: user.id } },
            },
          ],
        },
      },
    });

    // Link Deity
    await prisma.templeDeity.create({
      data: { templeId: loc.id, deityId: deityRecords[t.dIdx].id },
    });
    // Add second deity for half of temples
    if (rand(0, 1) === 1) {
      await prisma.templeDeity
        .create({
          data: {
            templeId: loc.id,
            deityId: deityRecords[(t.dIdx + 1) % 12].id,
          },
        })
        .catch(() => {});
    }

    templeRecords.push(loc);
  }
  console.log(`✅ ${templeRecords.length} temples created.`);

  // 5. Clusters for Hotels and Restaurants (To ensure "3+ nearby" works)
  console.log('🏗️  Generating nearby Hotels, Restaurants and Rentals...');
  for (const t of templeRecords) {
    // 4 Accommodations per temple
    for (let i = 0; i < 4; i++) {
      const cat = pick([Category.HOTEL, Category.RENTAL], i);
      const location = await prisma.location.create({
        data: {
          name: `${t.name} ${i === 0 ? 'International' : i === 1 ? 'Residency' : i === 2 ? 'Lodge' : 'Pilgrim House'}`,
          category: cat,
          addressText: `${t.district}, Kerala`,
          district: t.district,
          state: 'Kerala',
          latitude: t.latitude + rand(-10, 10) / 1000, // Within 1km
          longitude: t.longitude + rand(-10, 10) / 1000,
          hotel: {
            create: {
              pricePerDay: new Prisma.Decimal(rand(400, 5000)),
              contactPhone: '+914970000000',
              whatsapp: '+919999999999',
            },
          },
          media: {
            create: [
              {
                url: pick(HOTEL_IMAGES, rand(0, 5)),
                type: MediaType.IMAGE,
                user: { connect: { id: user.id } },
              },
            ],
          },
        },
      });

      const selectedAmenities = [...amenities]
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

      await prisma.hotelAmenity.createMany({
        data: selectedAmenities.map((amenity) => ({
          hotelLocationId: location.id,
          amenityId: amenity.id,
        })),
      });
    }
    // 2 Restaurants per temple
    for (let i = 0; i < 2; i++) {
      const location = await prisma.location.create({
        data: {
          name: `${t.name} ${i === 0 ? 'Bhojanalaya' : 'Udupi Veg'}`,
          category: Category.RESTAURANT,
          addressText: `${t.district}, Kerala`,
          district: t.district,
          state: 'Kerala',
          latitude: t.latitude + rand(-10, 10) / 1000,
          longitude: t.longitude + rand(-10, 10) / 1000,
          restaurant: {
            create: {
              isPureVeg: true,
            },
          },
          media: {
            create: [
              {
                url: pick(RESTAURANT_IMAGES, rand(0, 3)),
                type: MediaType.IMAGE,
                user: { connect: { id: user.id } },
              },
            ],
          },
        },
      });

      const menuDefs = [
        { name: 'Ghee Roast Dosa', price: rand(90, 160) },
        { name: 'Mini Meals', price: rand(110, 180) },
        { name: 'Poori Masala', price: rand(70, 120) },
        { name: 'Meals', price: rand(120, 220) },
      ];

      await prisma.restaurantMenuItem.createMany({
        data: menuDefs.map((menuItem, idx) => ({
          restaurantLocationId: location.id,
          name: menuItem.name,
          image: pick(MENU_ITEM_IMAGES, idx),
          price: new Prisma.Decimal(menuItem.price),
        })),
      });
    }
  }

  // 6. Festivals (5+ per city = 25+ Total)
  const festivalBase = [
    { name: 'Annual Utsavam', ml: 'ആറാട്ട് ഉത്സവം' },
    { name: 'Deeparadhana Fest', ml: 'ദീപാരധന മഹോത്സവം' },
    { name: 'Tantra Puja Day', ml: 'തന്ത്ര പൂജ' },
    { name: 'Poorolsavam', ml: 'പൂരോത്സവം' },
    { name: 'Kodikayattam', ml: 'കൊടികയറ്റം' },
    { name: 'Theyyam Season', ml: 'തെയ്യം മഹോത്സവം' },
  ];

  for (const c of districts) {
    const cityTemples = templeRecords.filter((t) => t.district === c.name);
    for (let i = 0; i < 6; i++) {
      const t = pick(cityTemples, i);
      await prisma.festival.create({
        data: {
          name: `${t.name} ${festivalBase[i].name}`,
          nameMl: `${t.nameMl} ${festivalBase[i].ml}`,
          description: 'Grand traditional festival.',
          startDate: new Date('2026-04-10'),
          endDate: new Date('2026-04-12'),
          locationId: t.id,
          deityId: deityRecords[rand(0, 11)].id,
          photoUrl: pick(TEMPLE_IMAGES, rand(0, 9)),
        },
      });
    }
  }
  console.log('✅ 30 Festivals linked to cities.');

  // 7. Astrologers (5+ per city = 25+ Total)
  const astNames = [
    'Bhaskaran',
    'Raghavan',
    'Sreedharan',
    'Damodaran',
    'Parameshwaran',
    'Achuthan',
  ];
  const astrologerPhotos = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  ];

  for (const c of districts) {
    const cityCoord = templates.find((t) => t.dist === c.name)!;
    for (let i = 0; i < 6; i++) {
      const ast = await prisma.astrologer.create({
        data: {
          name:
            i === 0 ? 'Bhaskaran' : `Pandit ${astNames[i % astNames.length]}`,
          avatarUrl: pick(astrologerPhotos, i),
          experienceYears: rand(10, 45),
          languages: ['Malayalam', 'English'],
          hourlyRate: 500,
          bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
          rating: 4.5 + rand(0, 5) / 10,
          totalRatings: rand(20, 100),
          isVerified: true,
          phoneNumber: '+919999999999',
          whatsappNumber: '+919999999999',
          photoUrls: [
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
          ],
          latitude: cityCoord.lat + rand(-50, 50) / 1000,
          longitude: cityCoord.lng + rand(-50, 50) / 1000,
          district: c.name,
          state: 'Kerala',
        },
      });

      // Add sample reviews
      await prisma.review.createMany({
        data: [
          {
            userId: user.id,
            astrologerId: ast.id,
            rating: 5,
            comment:
              'text used by designers, web developers, and publishers to preview layouts and typography before final content is ready',
          },
          {
            userId: user.id,
            astrologerId: ast.id,
            rating: 4,
            comment: 'Good experience, but wait time was long.',
          },
        ],
      });
    }
  }
  console.log('✅ 30 Astrologers positioned.');

  console.log('📍 Syncing Spatial Index...');
  await prisma.$executeRawUnsafe(
    `UPDATE "Location" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography WHERE coords IS NULL;`,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "Astrologer" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography WHERE coords IS NULL;`,
  );

  console.log('🎉 MISSION ACCOMPLISHED: 250+ Records Live!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
