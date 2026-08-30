import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchCategories, fetchMenuTypes, publicUploadUrl } from '@/lib/api';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export function CategoriesPage() {
  const { menuTypeCode } = useParams<{ menuTypeCode: string }>();
  const { locale } = useLocale();
  const { t } = useTranslations();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', menuTypeCode, locale],
    queryFn: () => fetchCategories(menuTypeCode!, locale),
    enabled: !!menuTypeCode,
  });

  // Shares its cache key with the homepage, so this is served from memory
  // rather than a second round trip.
  const { data: menuTypes } = useQuery({
    queryKey: ['menu-types', locale],
    queryFn: () => fetchMenuTypes(locale),
  });
  const currentType = menuTypes?.find((m) => m.code === menuTypeCode);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="mx-auto max-w-2xl animate-in px-4 pb-10 pt-3">
        <div className="mb-5">
          <Link
            to="/"
            className="-ml-2 flex h-11 w-fit items-center gap-2 rounded-lg px-2 text-sm text-stone-400 transition hover:text-[var(--color-app-accent)] active:text-[var(--color-app-accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToMenu')}
          </Link>
          {/* Without this the guest cannot tell which of the three menus they
              opened — the back link just says "to the menu". */}
          {currentType && (
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-stone-50">
              {currentType.name}
            </h1>
          )}
        </div>

        {isLoading ? (
          <ul className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="h-14 animate-pulse rounded-xl bg-[var(--color-app-panel)]" />
            ))}
          </ul>
        ) : categories && categories.length === 0 ? (
          <p className="py-12 text-center text-stone-400">{t('common.emptyCategories')}</p>
        ) : (
          <ul className="space-y-2">
            {categories?.map((category, index) => {
              const img = publicUploadUrl(category.imagePath);
              const targetUrl = category.hasClassifications
                ? `/menu/${menuTypeCode}/category/${category.code}/classifications`
                : `/menu/${menuTypeCode}/category/${category.code}`;
              return (
                <li key={category.id}>
                  <Link
                    to={targetUrl}
                    style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                    className="group flex animate-in items-center gap-3 rounded-xl border border-white/[0.07] bg-gradient-to-br from-stone-900/50 to-stone-950/40 px-4 py-4 shadow-sm transition-[transform,border-color] duration-150 hover:border-[var(--color-app-accent)]/25 active:scale-[0.99]"
                  >
                    {img && (
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-stone-100">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="block truncate text-xs text-stone-500">
                          {category.description}
                        </span>
                      )}
                    </span>
                    {/* Bare number on purpose: "16" next to a category name reads
                        as a count in any language, and dodges Russian plurals. */}
                    <span className="shrink-0 text-xs tabular-nums text-stone-500">
                      {category.itemCount}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-app-accent)]/55 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-app-accent)]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
