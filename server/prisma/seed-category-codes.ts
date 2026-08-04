import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Maps Russian category names to URL-friendly codes.
 * These codes match the ones defined in seed-menu.ts.
 */
const CATEGORY_CODE_MAP: Record<string, string> = {
  // Основное меню
  'Холодные закуски': 'cold-appetisers',
  'Cold Appetisers': 'cold-appetisers',
  'Горячие закуски': 'hot-appetisers',
  'Hot Appetisers': 'hot-appetisers',
  'Салаты': 'salads',
  'Salads': 'salads',
  'Супы': 'soups',
  'Soups': 'soups',
  'Вторые блюда': 'main-courses',
  'Main Courses': 'main-courses',
  'Лепим сами': 'we-sculpt',
  'We Sculpt Ourselves': 'we-sculpt',
  'Гарниры': 'side-dishes',
  'Side Dishes': 'side-dishes',
  'Соусы': 'sauces',
  'Sauces': 'sauces',
  'Хлебная корзина': 'bread-basket',
  'Bread Basket': 'bread-basket',

  // Барное меню
  'Вина': 'wine',
  'Wine': 'wine',
  'Виски': 'whisky',
  'Whisky': 'whisky',
  'Коньяки': 'cognac',
  'Cognac': 'cognac',
  'Водка': 'vodka',
  'Vodka': 'vodka',
  'Пиво': 'beer',
  'Beer': 'beer',
  'Закуски к пиву': 'beer-snacks',
  'Snacks to Beer': 'beer-snacks',
  'Прохладные напитки': 'cool-drinks',
  'Cool Drinks': 'cool-drinks',

  // Десерты и напитки
  'Десерты': 'desserts',
  'Desserts': 'desserts',
  'Мороженое': 'ice-cream',
  'Ice Cream': 'ice-cream',
  'Сезонные фрукты': 'seasonal-fruits',
  'Seasonal Fruits': 'seasonal-fruits',
  'Кофе': 'coffee',
  'Coffee': 'coffee',
  'Чай': 'tea',
  'Tea': 'tea',
  'Лимонады': 'lemonades',
  'Lemonades': 'lemonades',
};

async function main() {
  console.log('Seeding category codes...');

  const categories = await prisma.category.findMany({
    include: { translations: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const cat of categories) {
    // Skip if already has a code
    if (cat.code) {
      skipped++;
      continue;
    }

    // Try to find code from translations
    let code: string | null = null;
    for (const tr of cat.translations) {
      if (CATEGORY_CODE_MAP[tr.name]) {
        code = CATEGORY_CODE_MAP[tr.name];
        break;
      }
    }

    if (!code) {
      // Fallback: generate code from first translation name
      const fallbackTr = cat.translations[0];
      if (fallbackTr) {
        code = fallbackTr.name
          .toLowerCase()
          .replace(/[^a-z0-9а-яё]+/gi, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 30);
      } else {
        code = `category-${cat.id.substring(0, 8)}`;
      }
      console.log(`  ⚠ Generated fallback code for category ${cat.id}: "${code}"`);
    }

    // Check for code collision within same menuType
    const existing = await prisma.category.findFirst({
      where: {
        menuTypeId: cat.menuTypeId,
        code,
        id: { not: cat.id },
      },
    });

    if (existing) {
      // Append index to make unique
      code = `${code}-${cat.sortOrder}`;
    }

    await prisma.category.update({
      where: { id: cat.id },
      data: { code },
    });

    const name = cat.translations.find((t) => t.locale === 'ru')?.name || cat.id;
    console.log(`  ✓ ${name} → /${code}`);
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${skipped} already had codes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
