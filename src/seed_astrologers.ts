import { PrismaClient, Language } from '@prisma/client';

const prisma = new PrismaClient();

const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('✨ Seeding Astrologers Only...');

  const user = await prisma.user.findFirst({
    where: { email: 'dev@mandirmap.com' },
  });
  if (!user) {
    console.error('User dev@mandirmap.com not found. Run main seed first.');
    return;
  }

  await prisma.review.deleteMany({ where: { astrologerId: { not: null } } });
  await prisma.astrologer.deleteMany();

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

  const districts = [
    { name: 'Kannur', lat: 12.0314, lng: 75.3578 },
    { name: 'Thrissur', lat: 10.5199, lng: 76.2133 },
    { name: 'Thiruvananthapuram', lat: 8.4831, lng: 76.9436 },
    { name: 'Ernakulam', lat: 9.9818, lng: 76.2822 },
    { name: 'Kozhikode', lat: 11.2488, lng: 75.7899 },
  ];

  for (const c of districts) {
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
          latitude: c.lat + rand(-50, 50) / 1000,
          longitude: c.lng + rand(-50, 50) / 1000,
          district: c.name,
          state: 'Kerala',
        },
      });

      // Add sample reviews
      await prisma.review.create({
        data: {
          userId: user.id,
          astrologerId: ast.id,
          rating: 5,
          comment:
            'Very professional. Highly recommended for family horoscopes.',
          createdAt: new Date(),
        },
      });
      await prisma.review.create({
        data: {
          userId: user.id,
          astrologerId: ast.id,
          rating: 4,
          comment: 'Good experience, but wait time was long.',
          createdAt: new Date(),
        },
      });
    }
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "Astrologer" SET coords = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography WHERE coords IS NULL;`,
  );

  console.log('✅ Seeding Complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
