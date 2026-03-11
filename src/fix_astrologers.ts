import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Updating astrologers with district info...');
  const astrologers = await prisma.astrologer.findMany();

  for (const ast of astrologers) {
    let district = 'Kannur';
    // Rough coordinates check based on seed values
    if (ast.latitude < 9.0) district = 'Thiruvananthapuram';
    else if (ast.latitude < 10.3) district = 'Ernakulam';
    else if (ast.latitude < 11.0) district = 'Thrissur';
    else if (ast.latitude < 11.5) district = 'Kozhikode';

    await prisma.astrologer.update({
      where: { id: ast.id },
      data: { district, state: 'Kerala' },
    });
  }
  console.log('Finished updating 30 astrologers.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
