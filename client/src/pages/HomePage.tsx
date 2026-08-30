import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchMenuTypes, publicUploadUrl } from '@/lib/api';
import { UtensilsCrossed, Wine, CakeSlice, ChevronRight, Globe } from 'lucide-react';

// Until a section has a photo its card still needs to look like a deliberate
// choice rather than a missing image — and three identical grey placeholders
// read as a bug. Give each section its own icon and tint.
const SECTION_FALLBACK: Record<
  string,
  { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; tint: string }
> = {
  main: { icon: UtensilsCrossed, tint: 'from-amber-900/30' },
  bar: { icon: Wine, tint: 'from-rose-900/25' },
  'desserts-drinks': { icon: CakeSlice, tint: 'from-violet-900/25' },
};

const DEFAULT_FALLBACK = { icon: UtensilsCrossed, tint: 'from-stone-800/60' };

export function HomePage() {
  const { locale, resetLocale } = useLocale();
  const { t } = useTranslations();
  const { data: menuTypes, isLoading } = useQuery({
    queryKey: ['menu-types', locale],
    queryFn: () => fetchMenuTypes(locale),
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="mx-auto max-w-2xl animate-in px-4 pb-10 pt-3">
        <header className="mb-6">
          <div className="flex justify-end">
            <button
              onClick={resetLocale}
              aria-label={locale.toUpperCase()}
              className="-mr-2 flex h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium text-stone-500 transition hover:text-[var(--color-app-accent)] active:text-[var(--color-app-accent)]"
            >
              <Globe className="h-4 w-4" />
              {locale.toUpperCase()}
            </button>
          </div>
          <img src="/logo.svg" alt="Kazan" className="mx-auto h-14 w-auto sm:h-16" />
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[16/10] animate-pulse rounded-2xl bg-[var(--color-app-panel)]"
              />
            ))}
          </div>
        ) : menuTypes && menuTypes.length === 0 ? (
          <p className="py-12 text-center text-stone-400">{t('common.emptyMenu')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {menuTypes?.map((type, index) => {
              const img = publicUploadUrl(type.imagePath);
              const fallback = SECTION_FALLBACK[type.code] ?? DEFAULT_FALLBACK;
              const FallbackIcon = fallback.icon;
              return (
                <Link
                  key={type.id}
                  to={`/menu/${type.code}`}
                  // `backwards` holds the hidden state through the stagger delay,
                  // otherwise the card flashes into view before its turn.
                  style={{ animationDelay: `${index * 70}ms`, animationFillMode: 'backwards' }}
                  className="group relative block aspect-[16/10] animate-in overflow-hidden rounded-2xl border border-white/[0.07] shadow-lg transition-[transform,border-color] duration-150 hover:border-[var(--color-app-accent)]/25 active:scale-[0.98]"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      // The first card is above the fold on every phone, so lazy
                      // loading it only delays the one image that matters.
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${fallback.tint} via-stone-900 to-stone-950`}
                    >
                      <FallbackIcon
                        className="h-16 w-16 text-[var(--color-app-accent)]/25"
                        strokeWidth={1}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
                    <span className="text-lg font-semibold leading-tight text-stone-50 [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
                      {type.name}
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-app-accent)]/70 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-app-accent)]" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <p className="mx-auto mt-8 max-w-md border-t border-white/[0.06] pt-6 text-center text-sm leading-relaxed text-stone-400">
          {t('home.welcome')}
        </p>
      </div>
    </div>
  );
}
