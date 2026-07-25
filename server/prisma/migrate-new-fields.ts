import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Safe migration script: adds Regions, Wine Classifications,
 * and links existing wine items. Does NOT delete any data.
 */

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

// Map wine names to region + classification (based on the physical menu flags)
const WINE_MAPPINGS: Record<string, { regionCode?: string; classificationCode?: string; glassPrice?: number }> = {
  // Uzbekistan wines (🇺🇿) — Bagizagan, Peri, Rundweiss, Cabernet Sauvignon, Nuara
  'Cabernet Sauvignon (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 110000 },
  'Rundweiss (белое сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 90000 },
  'Bagizagan «Bella Ozkhidea» (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 50000 },
  'Bagizagan «Bella Lilia» (белое сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 50000 },
  'Bagizagan Select (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 60000 },
  'Bagizagan Samarkand (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 75000 },
  'Bagizagan Peri (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 90000 },
  'Peri Cabernet Sauvignon (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 90000 },
  'Peri Bagizagan (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 90000 },
  'Peri Riesling (белое сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 90000 },
  'Nuara Uzumfermer (красное сухое)': { regionCode: 'uzbekistan', classificationCode: 'dry', glassPrice: 100000 },
  'Bagizagan Salute Sparkling Brut': { regionCode: 'uzbekistan', classificationCode: 'sparkling', glassPrice: 75000 },
  'Bagizagan Salute Sparkling Brut Rosé': { regionCode: 'uzbekistan', classificationCode: 'sparkling', glassPrice: 75000 },
  // Georgia wines (🇬🇪) — Alazani Valley, Pirosmani, Khvanchkara, Tsinandali
  'Alazani Valley (белое полусладкое)': { regionCode: 'kakheti', classificationCode: 'semi-sweet', glassPrice: 100000 },
  'Pirosmani (красное полу-сухое)': { regionCode: 'kakheti', classificationCode: 'semi-dry', glassPrice: 100000 },
  'Khvanchkara (красное полусладкое)': { regionCode: 'imereti', classificationCode: 'semi-sweet', glassPrice: 200000 },
  'Tsinandali (белое сухое)': { regionCode: 'kakheti', classificationCode: 'dry', glassPrice: 100000 },
  // France wines (🇫🇷) — Mouton Cadet, J.P. Chenet
  'Mouton Cadet Blanc (белое сухое)': { regionCode: 'bordeaux', classificationCode: 'dry', glassPrice: 150000 },
  'Mouton Cadet Rouge (красное сухое)': { regionCode: 'bordeaux', classificationCode: 'dry', glassPrice: 150000 },
  'J.P. Chenet Medium Sweet Blanc (белое полусладкое)': { regionCode: 'bordeaux', classificationCode: 'semi-sweet', glassPrice: 128000 },
  'J.P. Chenet Medium Sweet Rouge (красное полусладкое)': { regionCode: 'bordeaux', classificationCode: 'semi-sweet', glassPrice: 128000 },
  // Italy wines (🇮🇹) — Piccini
  'Piccini Pinot Grigio delle Venezie (белое сухое)': { regionCode: 'tuscany', classificationCode: 'dry', glassPrice: 140000 },
  'Piccini Prosecco Extra Dry (игристое белое сухое)': { regionCode: 'tuscany', classificationCode: 'sparkling', glassPrice: 160000 },
};

async function upsertRegion(code: string, nameRu: string, nameEn: string, sortOrder: number): Promise<string> {
  const existing = await prisma.region.findFirst({
    where: { translations: { some: { locale: 'ru', name: nameRu } } },
  });
  if (existing) {
    console.log(`  Region "${nameRu}" already exists (id: ${existing.id})`);
    return existing.id;
  }
  const region = await prisma.region.create({
    data: {
      sortOrder,
      translations: {
        create: [
          { locale: 'ru', name: nameRu },
          { locale: 'en', name: nameEn },
        ],
      },
    },
  });
  console.log(`  Region "${nameRu}" created (id: ${region.id})`);
  return region.id;
}

async function upsertClassification(code: string, nameRu: string, nameEn: string, sortOrder: number): Promise<string> {
  const existing = await prisma.wineClassification.findUnique({ where: { code } });
  if (existing) {
    console.log(`  Classification "${nameRu}" already exists (id: ${existing.id})`);
    return existing.id;
  }
  const cls = await prisma.wineClassification.create({
    data: {
      code,
      sortOrder,
      translations: {
        create: [
          { locale: 'ru', name: nameRu },
          { locale: 'en', name: nameEn },
        ],
      },
    },
  });
  console.log(`  Classification "${nameRu}" created (id: ${cls.id})`);
  return cls.id;
}

async function main() {
  console.log('=== Safe Migration: Regions + Wine Classifications ===\n');

  // 1. Create regions
  console.log('1. Upserting regions...');
  const regionMap: Record<string, string> = {};
  for (let i = 0; i < REGIONS.length; i++) {
    const r = REGIONS[i];
    regionMap[r.code] = await upsertRegion(r.code, r.nameRu, r.nameEn, i);
  }

  // 2. Create classifications
  console.log('\n2. Upserting wine classifications...');
  const classMap: Record<string, string> = {};
  for (let i = 0; i < CLASSIFICATIONS.length; i++) {
    const c = CLASSIFICATIONS[i];
    classMap[c.code] = await upsertClassification(c.code, c.nameRu, c.nameEn, i);
  }

  // 3. Link existing wine items
  console.log('\n3. Linking existing wine items to regions/classifications...');
  const wineItems = await prisma.menuItem.findMany({
    where: { translations: { some: { name: { contains: '(' } } } },
    include: { translations: true, category: { include: { translations: true } } },
  });

  // Filter to wine category items
  const wineCategoryItems = wineItems.filter((item) => {
    const catName = item.category.translations.find((t) => t.locale === 'ru')?.name || '';
    return catName === 'Вина' || catName === 'Wine';
  });

  let linked = 0;
  for (const item of wineCategoryItems) {
    const ruName = item.translations.find((t) => t.locale === 'ru')?.name || '';
    const mapping = WINE_MAPPINGS[ruName];

    if (!mapping) {
      console.log(`  No mapping for: "${ruName}"`);
      continue;
    }

    const updateData: any = {};
    if (mapping.regionCode && regionMap[mapping.regionCode]) {
      updateData.regionId = regionMap[mapping.regionCode];
    }
    if (mapping.classificationCode && classMap[mapping.classificationCode]) {
      updateData.classificationId = classMap[mapping.classificationCode];
    }
    if (mapping.glassPrice) {
      updateData.prices = { glass: mapping.glassPrice };
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: updateData,
      });
      linked++;
      console.log(`  Linked: "${ruName}" → region=${mapping.regionCode || '-'}, class=${mapping.classificationCode || '-'}`);
    }
  }

  // 4. Add badges to vegetarian items
  console.log('\n4. Adding badges to vegetarian items...');
  const vegetarianNames = ['Хумус', 'Свежие овощи', 'Самса с зеленью', 'Самса с тыквой', 'Долма из грибов'];
  let badged = 0;
  for (const namePart of vegetarianNames) {
    const items = await prisma.menuItem.findMany({
      where: { translations: { some: { name: { contains: namePart } } } },
    });
    for (const item of items) {
      const existingBadges = (item.badges as string[]) || [];
      const newBadges = [...new Set([...existingBadges, 'vegetarian'])];
      // Долма — also top
      if (namePart === 'Долма из грибов') newBadges.push('top');
      const uniqueBadges = [...new Set(newBadges)];
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { badges: uniqueBadges },
      });
      badged++;
      console.log(`  Badged: "${namePart}" → ${uniqueBadges.join(', ')}`);
    }
  }

  // 5. Add shot prices to spirits
  console.log('\n5. Adding shot prices to spirits...');
  const spiritMappings: Record<string, number> = {
    'Johnnie Walker Black Label': 165000,
    'Johnnie Walker Red Label': 112000,
    'Macallan 12': 645000,
    'Tanbour 5': 100000,
    'Hennessy': 285000,
    'Gold Bukhara': 48000,
    'Beluga noble': 287000,
    'Stolichnaya': 63000,
    'Stolichnaya Sever': 68000,
  };
  let spiritUpdated = 0;
  for (const [name, shotPrice] of Object.entries(spiritMappings)) {
    const items = await prisma.menuItem.findMany({
      where: { translations: { some: { name: { contains: name } } } },
    });
    for (const item of items) {
      const existingPrices = (item.prices as Record<string, number>) || {};
      if (!existingPrices.shot) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { prices: { ...existingPrices, shot: shotPrice } },
        });
        spiritUpdated++;
        console.log(`  Added shot price to: "${name}" → ${shotPrice}`);
      }
    }
  }

  console.log(`\n=== Migration complete ===`);
  console.log(`  Regions: ${REGIONS.length}`);
  console.log(`  Classifications: ${CLASSIFICATIONS.length}`);
  console.log(`  Wine items linked: ${linked}`);
  console.log(`  Items badged: ${badged}`);
  console.log(`  Spirits with shot prices: ${spiritUpdated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
