import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchCategories, publicUploadUrl } from '@/lib/api';
import { ArrowLeft, Folder } from 'lucide-react';

export function CategoriesPage() {
  const { menuTypeId } = useParams<{ menuTypeId: string }>();
  const { locale } = useLocale();
  const { t } = useTranslations();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', menuTypeId, locale],
    queryFn: () => fetchCategories(menuTypeId!, locale),
    enabled: !!menuTypeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
        <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
          <div className="h-10 bg-[var(--color-app-panel)] rounded-lg w-1/3 animate-pulse mb-6" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-[var(--color-app-panel)] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-[var(--color-app-accent)] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToMenu')}
          </Link>
        </div>

        {categories && categories.length === 0 ? (
          <p className="text-stone-400 text-center py-12">{t('common.emptyCategories')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories?.map((category) => {
              const img = publicUploadUrl(category.imagePath);
              return (
                <Link
                  key={category.id}
                  to={`/menu/${menuTypeId}/category/${category.id}`}
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
                      <Folder className="h-14 w-14 text-[var(--color-app-accent)]/22" strokeWidth={1.1} />
                    </div>
                  )}
                  <div className="border-t border-white/6 bg-black/15 px-4 py-4">
                    <span className="text-base font-semibold text-stone-100">
                      {category.name}
                    </span>
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
