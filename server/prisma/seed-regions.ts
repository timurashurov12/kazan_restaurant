import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGIONS = [
  { code: 'kakheti', nameRu: 'Кахетия', nameEn: 'Kakheti' },
  { code: 'imereti', nameRu: 'Имерети', nameEn: 'Imereti' },
  { code: 'bordeaux', nameRu: 'Бордо', nameEn: 'Bordeaux' },
  { code: 'burgundy', nameRu: 'Бургундия', nameEn: 'Burgundy' },
  { code: 'tuscany', nameRu: 'Тоскана', nameEn: 'Tuscany' },
  { code: 'rioja', nameRu: 'Риоха', nameEn: 'Rioja' },
  { code: 'margaret-river', nameRu: 'Маргарет-Ривер', nameEn: 'Margaret River' },
  { code: 'uzbekistan', nameRu: 'Узбекистан', nameEn: 'Uzbekistan' },
];

const CLASSIFICATIONS = [
  { code: 'dry', nameRu: 'Сухое', nameEn: 'Dry' },
  { code: 'semi-dry', nameRu: 'Полусухое', nameEn: 'Semi-dry' },
  { code: 'semi-sweet', nameRu: 'Полусладкое', nameEn: 'Semi-sweet' },
  { code: 'sweet', nameRu: 'Сладкое', nameEn: 'Sweet' },
  { code: 'red', nameRu: 'Красное', nameEn: 'Red' },
  { code: 'white', nameRu: 'Белое', nameEn: 'White' },
  { code: 'rose', nameRu: 'Розовое', nameEn: 'Rosé' },
  { code: 'sparkling', nameRu: 'Игристое', nameEn: 'Sparkling' },
];

async function main() {
  console.log('Seeding regions and wine classifications...');

  // Seed regions
  for (let i = 0; i < REGIONS.length; i++) {
    const r = REGIONS[i];

    // Check if region with this translation already exists
    const existing = await prisma.regionTranslation.findFirst({
      where: { locale: 'ru', name: r.nameRu },
    });

    if (existing) {
      console.log(`  Region "${r.nameRu}" already exists, skipping.`);
      continue;
    }

    const region = await prisma.region.create({
      data: {
        sortOrder: i,
        translations: {
          create: [
            { locale: 'ru', name: r.nameRu },
            { locale: 'en', name: r.nameEn },
          ],
        },
      },
    });
    console.log(`  Created region: ${r.nameRu} (${region.id})`);
  }

  // Seed wine classifications
  for (let i = 0; i < CLASSIFICATIONS.length; i++) {
    const c = CLASSIFICATIONS[i];

    // Check if classification with this code already exists
    const existing = await prisma.wineClassification.findUnique({
      where: { code: c.code },
    });

    if (existing) {
      console.log(`  Classification "${c.code}" already exists, skipping.`);
      continue;
    }

    const cls = await prisma.wineClassification.create({
      data: {
        code: c.code,
        sortOrder: i,
        translations: {
          create: [
            { locale: 'ru', name: c.nameRu },
            { locale: 'en', name: c.nameEn },
          ],
        },
      },
    });
    console.log(`  Created classification: ${c.code} (${cls.id})`);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
