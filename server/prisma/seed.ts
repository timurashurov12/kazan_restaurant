import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const LANGUAGES = [
  { code: 'ru', name: 'Русский', sortOrder: 0 },
  { code: 'en', name: 'English', sortOrder: 1 },
];

async function main() {
  for (const lang of LANGUAGES) {
    await prisma.language.upsert({
      where: { code: lang.code },
      create: lang,
      update: lang,
    });
  }

  const menu = await prisma.menu.upsert({
    where: { id: 'seed_menu_default' },
    create: {
      id: 'seed_menu_default',
      name: 'Основное меню',
      sortOrder: 0,
      isActive: true,
    },
    update: {},
  });

  await prisma.siteSettings.upsert({
    where: { id: 'seed_settings' },
    create: { id: 'seed_settings' },
    update: {},
  });

  const adminEmail = 'admin@kazan.local';
  let user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!user) {
    const hash = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: { email: adminEmail, passwordHash: hash },
    });
    console.log('Admin user created: admin@kazan.local / admin123');
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
