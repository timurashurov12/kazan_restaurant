import { useState, useMemo, useEffect } from 'react';
import { ChefHat, Search } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { publicUploadUrl, thumbUploadUrl, type MenuItemDto } from '@/lib/api';
import {
  BADGE_ICONS,
  SEARCH_MIN_ITEMS,
  WINE_COLOR_MAP,
  filterItemsBySearch,
  getRegionFlag,
  priceLabel,
} from './item-visuals';
import { ItemModal } from './ItemModal';

/**
 * The dish list shared by the category page and the wine classification page.
 * Both rendered their own copy of this markup and had already drifted apart —
 * only one of them got the coloured classification dot, the collapsing
 * thumbnail column and the item-count-aware search box.
 */
export function MenuItemList({
  items,
  showClassification = true,
}: {
  items: MenuItemDto[];
  /** Off inside a single classification, where repeating it on every row is noise. */
  showClassification?: boolean;
}) {
  const { locale } = useLocale();
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItemDto | null>(null);

  const filteredItems = useMemo(() => filterItemsBySearch(items, searchQuery), [items, searchQuery]);

  useEffect(() => {
    document.body.style.overflow = selectedItem ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  const hasSearch = searchQuery.trim().length > 0;
  const showSearch = items.length >= SEARCH_MIN_ITEMS;
  // Categories like Гарниры and Соусы have no photos at all; reserving the
  // 88px slot there leaves a column of empty squares. Keep it as soon as one
  // item has a photo, so rows stay aligned within a category.
  const anyPhoto = items.some((i) => i.imagePath);
  const numberLocale = locale || 'ru-RU';
  const currency = t('common.currency');

  return (
    <>
      {showSearch && (
        <div
          className="sticky top-0 z-20 pb-4 -mx-4 px-4 pt-4 mb-6 border-b border-[var(--color-border)]"
          style={{ backgroundColor: 'var(--color-app-bg)' }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
            <input
              type="search"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-app-panel)] border border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
            />
          </div>
        </div>
      )}

      {filteredItems.length > 0 ? (
        <ul className="space-y-3">
          {filteredItems.map((item) => {
            const itemImg = publicUploadUrl(item.imagePath);
            const itemThumb = thumbUploadUrl(item.imagePath);
            const cls = item.classification;
            const dot = cls ? WINE_COLOR_MAP[cls.code] : undefined;
            return (
              <li
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="flex gap-3.5 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-stone-900/50 via-[var(--color-app-panel)]/30 to-stone-950/40 p-3.5 shadow-lg cursor-pointer transition-all hover:border-[var(--color-app-accent)]/25 hover:scale-[1.01]"
              >
                {anyPhoto && (
                  // Bigger on phones, where the photo is the whole point and
                  // there is no hover or wide layout to help. Desktop keeps the
                  // narrower thumbnail: the row is 672px wide there, so 88px
                  // already reads fine.
                  <div className="relative h-32 w-32 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-2xl bg-stone-950 ring-1 ring-white/6">
                    {itemThumb ? (
                      <img
                        src={itemThumb}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                        // Uploads that predate thumbnails have none; fall back
                        // to the full image instead of showing a broken one.
                        onError={(e) => {
                          const el = e.currentTarget;
                          if (itemImg && !el.src.endsWith(itemImg)) el.src = itemImg;
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-800/90 to-stone-950">
                        <ChefHat className="h-12 w-12 sm:h-9 sm:w-9 text-[var(--color-app-accent)]/20" strokeWidth={1.15} />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-stone-50">{item.name}</h3>
                      {item.badges?.map((badge) => {
                        const cfg = BADGE_ICONS[badge];
                        if (!cfg) return null;
                        const Icon = cfg.icon;
                        return (
                          <span
                            key={badge}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.color}`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                          </span>
                        );
                      })}
                    </div>
                    {showClassification && cls && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-stone-500 bg-stone-800/60 px-1.5 py-0.5 rounded">
                        {dot && (
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dot.bg}`} title={dot.title} />
                        )}
                        {cls.name}
                      </span>
                    )}
                    {item.description && (
                      <p className="line-clamp-2 text-xs text-stone-400">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.weightOrVolume && (
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500">
                          {item.weightOrVolume}
                        </p>
                      )}
                      {item.region && (
                        <p className="text-[11px] text-stone-500">
                          {getRegionFlag(item.region.name)} {item.region.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-lg font-semibold tabular-nums text-[var(--color-app-accent)]">
                      {Number(item.price).toLocaleString(numberLocale)} {currency}
                    </span>
                    {item.prices && Object.keys(item.prices).length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {Object.entries(item.prices).map(([key, val]) => (
                          <span key={key} className="text-xs text-stone-500">
                            {priceLabel(key, locale)}: {Number(val).toLocaleString(numberLocale)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-stone-400 text-center py-12">
          {hasSearch ? t('common.noResults') : t('common.emptySection')}
        </p>
      )}

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          numberLocale={numberLocale}
          currencyLabel={currency}
          locale={locale}
        />
      )}
    </>
  );
}

/** Same shape as the loaded list, so nothing reflows when data arrives. */
export function ItemListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-white/[0.07] bg-[var(--color-app-panel)]/40 p-3.5 animate-pulse"
        >
          <div className="w-24 h-24 shrink-0 rounded-2xl bg-stone-800/80" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-stone-700/80 rounded w-3/4" />
            <div className="h-3 bg-stone-800/80 rounded w-full" />
            <div className="h-6 bg-stone-800/60 rounded-full w-24 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
