import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchCategoryItems, publicUploadUrl, type MenuItemDto } from '@/lib/api';
import { useState, useMemo, useEffect } from 'react';
import { ChefHat, Search, ArrowLeft, X } from 'lucide-react';

function matchSearch(text: string | null, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query.toLowerCase().trim());
}

function filterItemsBySearch(items: MenuItemDto[], query: string): MenuItemDto[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) => matchSearch(item.name, query) || matchSearch(item.description, query)
  );
}

export function MenuPage() {
  const { menuTypeId, categoryId } = useParams<{ menuTypeId: string; categoryId: string }>();
  const { locale } = useLocale();
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItemDto | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['category-items', categoryId, locale],
    queryFn: () => fetchCategoryItems(categoryId!, locale),
    enabled: !!categoryId,
  });

  const filteredItems = useMemo(
    () => (items ? filterItemsBySearch(items, searchQuery) : []),
    [items, searchQuery]
  );

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedItem]);

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
        <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
          <div className="h-10 bg-[var(--color-app-panel)] rounded-lg w-1/3 animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-[var(--color-app-panel)]/40 p-3.5 animate-pulse">
                <div className="w-24 h-24 shrink-0 rounded-2xl bg-stone-800/80" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-stone-700/80 rounded w-3/4" />
                  <div className="h-3 bg-stone-800/80 rounded w-full" />
                  <div className="h-6 bg-stone-800/60 rounded-full w-24 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !items?.length;
  const hasSearch = searchQuery.trim().length > 0;
  const numberLocale = locale || 'ru-RU';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
        <div className="mb-6">
          <Link
            to={`/menu/${menuTypeId}`}
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-[var(--color-app-accent)] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToCategories')}
          </Link>
        </div>

        {isEmpty ? (
          <p className="text-stone-400 text-center py-12">{t('common.emptySection')}</p>
        ) : (
          <>
            <div className="sticky top-0 z-20 pb-4 -mx-4 px-4 pt-4 mb-6 border-b border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-app-bg)' }}>
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

            {filteredItems.length > 0 ? (
              <ul className="space-y-3">
                {filteredItems.map((item) => {
                  const itemImg = publicUploadUrl(item.imagePath);
                  return (
                    <li
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="flex gap-3.5 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-stone-900/50 via-[var(--color-app-panel)]/30 to-stone-950/40 p-3.5 shadow-lg cursor-pointer transition-all hover:border-[var(--color-app-accent)]/25 hover:scale-[1.01]"
                    >
                      <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-2xl bg-stone-950 ring-1 ring-white/6">
                        {itemImg ? (
                          <img src={itemImg} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-800/90 to-stone-950">
                            <ChefHat className="h-9 w-9 text-[var(--color-app-accent)]/20" strokeWidth={1.15} />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
                        <div className="min-w-0 space-y-1">
                          <h3 className="text-sm font-semibold text-stone-50">{item.name}</h3>
                          {item.description && (
                            <p className="line-clamp-2 text-xs text-stone-400">{item.description}</p>
                          )}
                          {item.weightOrVolume && (
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500">
                              {item.weightOrVolume}
                            </p>
                          )}
                        </div>
                        <span className="text-lg font-semibold tabular-nums text-[var(--color-app-accent)]">
                          {Number(item.price).toLocaleString(numberLocale)} {t('common.currency')}
                        </span>
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
          </>
        )}
      </div>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} numberLocale={numberLocale} currencyLabel={t('common.currency')} />
      )}
    </div>
  );
}

function ItemModal({ item, onClose, numberLocale, currencyLabel }: { item: MenuItemDto; onClose: () => void; numberLocale: string; currencyLabel: string }) {
  const img = publicUploadUrl(item.imagePath);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)] animate-in">
        {img && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl sm:rounded-t-2xl bg-stone-950">
            <img src={img} alt="" className="h-full w-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-5 space-y-4">
          {!img && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[var(--color-app-bg)] text-stone-400 hover:text-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-stone-50">{item.name}</h2>
            {item.weightOrVolume && (
              <p className="mt-1 text-sm text-stone-500 uppercase tracking-wide">{item.weightOrVolume}</p>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-stone-400 leading-relaxed">{item.description}</p>
          )}

          <div className="pt-2 border-t border-[var(--color-border)]">
            <span className="text-2xl font-bold tabular-nums text-[var(--color-app-accent)]">
              {Number(item.price).toLocaleString(numberLocale)} {currencyLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
