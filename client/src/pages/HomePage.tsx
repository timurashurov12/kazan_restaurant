import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchMenuTypes, fetchSiteSettings, publicUploadUrl } from '@/lib/api';
import { UtensilsCrossed, ChevronRight, Globe } from 'lucide-react';

export function HomePage() {
  const { locale, resetLocale } = useLocale();
  const { t } = useTranslations();
  const { data: menuTypes, isLoading } = useQuery({
    queryKey: ['menu-types', locale],
    queryFn: () => fetchMenuTypes(locale),
  });
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  });

  const siteLabel = siteSettings?.siteName?.trim() || null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-app-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="mx-auto max-w-2xl animate-in px-4 pb-10 pt-6">
        <header className="mb-8 text-center">
          <div className="flex justify-end mb-4">
            <button
              onClick={resetLocale}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[var(--color-app-accent)] transition"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale === 'ru' ? 'RU' : 'EN'}
            </button>
          </div>
          <img src="/logo.svg" alt="Kazan" className="mx-auto h-16 w-auto mb-4" />
          {siteLabel ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-app-accent)]">
              {siteLabel}
            </p>
          ) : (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
              {t('home.restaurantName')}
            </p>
          )}
          <h1 className="text-2xl font-semibold leading-tight text-stone-50">
            {t('home.title')}
          </h1>
        </header>

        {menuTypes && menuTypes.length === 0 ? (
          <p className="text-center text-stone-400 py-12">{t('common.emptyMenu')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {menuTypes?.map((type) => {
              const img = publicUploadUrl(type.imagePath);
              return (
                <Link
                  key={type.id}
                  to={`/menu/${type.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-stone-900/50 via-[var(--color-app-panel)]/30 to-stone-950/40 shadow-lg transition-all duration-200 hover:border-[var(--color-app-accent)]/25"
                >
                  {img ? (
                    <div className="relative aspect-[5/3] w-full overflow-hidden bg-stone-950">
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[5/3] w-full items-center justify-center bg-gradient-to-br from-stone-800/90 to-stone-950">
                      <UtensilsCrossed className="h-14 w-14 text-[var(--color-app-accent)]/22" strokeWidth={1.1} />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 border-t border-white/6 bg-black/15 px-4 py-4">
                    <span className="text-base font-semibold text-stone-100">
                      {type.name}
                    </span>
                    <ChevronRight className="h-5 w-5 text-[var(--color-app-accent)]/55 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-app-accent)]" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
