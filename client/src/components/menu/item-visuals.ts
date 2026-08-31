import type { ComponentType } from 'react';
import { Leaf, Star } from 'lucide-react';
import type { MenuItemDto } from '@/lib/api';

export const BADGE_ICONS: Record<
  string,
  { icon: ComponentType<{ className?: string }>; color: string; bg: string; label: string }
> = {
  vegetarian: { icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Vegetarian' },
  top: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Top' },
};

export const WINE_COLOR_MAP: Record<string, { bg: string; title: string }> = {
  red: { bg: 'bg-red-500', title: 'Красное' },
  white: { bg: 'bg-amber-200', title: 'Белое' },
  rose: { bg: 'bg-pink-400', title: 'Розовое' },
  sparkling: { bg: 'bg-yellow-300', title: 'Игристое' },
};

// Below this the whole list is on screen at once and the sticky search box
// costs a fifth of the viewport to save nobody any scrolling.
export const SEARCH_MIN_ITEMS = 8;

const PRICE_LABELS: Record<string, Record<string, string>> = {
  glass: { ru: 'Бокал', en: 'Glass' },
  shot: { ru: 'Стопка', en: 'Shot' },
  cup: { ru: 'Кружка', en: 'Cup' },
};

export function priceLabel(key: string, locale: string): string {
  return PRICE_LABELS[key]?.[locale === 'en' ? 'en' : 'ru'] || key;
}

const REGION_FLAGS: Record<string, string> = {
  'Кахетия': '🇬🇪', 'Kakheti': '🇬🇪',
  'Имерети': '🇬🇪', 'Imereti': '🇬🇪',
  'Бордо': '🇫🇷', 'Bordeaux': '🇫🇷',
  'Бургундия': '🇫🇷', 'Burgundy': '🇫🇷',
  'Тоскана': '🇮🇹', 'Tuscany': '🇮🇹',
  'Риоха': '🇪🇸', 'Rioja': '🇪🇸',
  'Маргарет-Ривер': '🇦🇺', 'Margaret River': '🇦🇺',
  'Узбекистан': '🇺🇿', 'Uzbekistan': '🇺🇿',
};

export function getRegionFlag(regionName: string): string {
  return REGION_FLAGS[regionName] || '';
}

function matchSearch(text: string | null, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query.toLowerCase().trim());
}

export function filterItemsBySearch(items: MenuItemDto[], query: string): MenuItemDto[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) => matchSearch(item.name, query) || matchSearch(item.description, query),
  );
}
