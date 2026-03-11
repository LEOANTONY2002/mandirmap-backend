import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.astrologer.count();
  console.log('Astrologer count:', count);
  if (count > 0) {
    const astrologers = await prisma.astrologer.findMany({ take: 5 });
    console.log('Sample astrologers:', JSON.stringify(astrologers, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
