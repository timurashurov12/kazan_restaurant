import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchWineClassifications, fetchClassificationItems } from '@/lib/api';
import { ArrowLeft, Folder } from 'lucide-react';
import { WINE_COLOR_MAP } from '@/components/menu/item-visuals';
import { MenuItemList, ItemListSkeleton } from '@/components/menu/MenuItemList';

export function WineClassificationsPage() {
  const { menuTypeCode, categoryCode, classificationCode } = useParams<{
    menuTypeCode: string;
    categoryCode: string;
    classificationCode?: string;
  }>();
  const { locale } = useLocale();

  if (classificationCode) {
    return (
      <ClassificationItemsView
        menuTypeCode={menuTypeCode!}
        categoryCode={categoryCode!}
        classificationCode={classificationCode}
        locale={locale}
      />
    );
  }

  return (
    <ClassificationsListView
      menuTypeCode={menuTypeCode!}
      categoryCode={categoryCode!}
      locale={locale}
    />
  );
}

function PageShell({ backTo, backLabel, children }: { backTo: string; backLabel: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
        <div className="mb-6">
          <Link
            to={backTo}
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-[var(--color-app-accent)] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

function ClassificationsListView({
  menuTypeCode,
  categoryCode,
  locale,
}: {
  menuTypeCode: string;
  categoryCode: string;
  locale: string;
}) {
  const { t } = useTranslations();

  const { data: classifications, isLoading, isError } = useQuery({
    queryKey: ['wine-classifications', menuTypeCode, categoryCode, locale],
    queryFn: () => fetchWineClassifications(menuTypeCode, categoryCode, locale),
    enabled: !!menuTypeCode && !!categoryCode,
  });

  if (isLoading) {
    return (
      <PageShell backTo={`/menu/${menuTypeCode}`} backLabel={t('common.backToCategories')}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[var(--color-app-panel)] animate-pulse" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell backTo={`/menu/${menuTypeCode}`} backLabel={t('common.backToCategories')}>
      {isError ? (
        <p className="text-stone-400 text-center py-12">{t('common.loadError')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to={`/menu/${menuTypeCode}/category/${categoryCode}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-stone-900/50 via-[var(--color-app-panel)]/30 to-stone-950/40 shadow-lg transition-all duration-200 hover:border-[var(--color-app-accent)]/25"
          >
            <div className="flex aspect-[5/3] w-full items-center justify-center bg-gradient-to-br from-stone-800/90 to-stone-950">
              <Folder className="h-14 w-14 text-[var(--color-app-accent)]/22" strokeWidth={1.1} />
            </div>
            <div className="flex items-center justify-between border-t border-white/6 bg-black/15 px-4 py-4">
              <span className="text-base font-semibold text-stone-100">{t('common.allItems')}</span>
            </div>
          </Link>
          {classifications?.map((cls) => (
            <Link
              key={cls.id}
              to={`/menu/${menuTypeCode}/category/${categoryCode}/classification/${cls.code}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-stone-900/50 via-[var(--color-app-panel)]/30 to-stone-950/40 shadow-lg transition-all duration-200 hover:border-[var(--color-app-accent)]/25"
            >
              <div className="flex aspect-[5/3] w-full items-center justify-center bg-gradient-to-br from-stone-800/90 to-stone-950">
                <Folder className="h-14 w-14 text-[var(--color-app-accent)]/22" strokeWidth={1.1} />
              </div>
              <div className="flex items-center justify-between border-t border-white/6 bg-black/15 px-4 py-4">
                <span className="flex items-center gap-2 text-base font-semibold text-stone-100">
                  {WINE_COLOR_MAP[cls.code] && (
                    <span className={`w-3 h-3 rounded-full shrink-0 ${WINE_COLOR_MAP[cls.code].bg}`} />
                  )}
                  {cls.name}
                </span>
                {/* Bare number: reads as a count next to a name in any language
                    and sidesteps Russian plural forms. */}
                <span className="text-xs tabular-nums text-stone-500">{cls.itemCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function ClassificationItemsView({
  menuTypeCode,
  categoryCode,
  classificationCode,
  locale,
}: {
  menuTypeCode: string;
  categoryCode: string;
  classificationCode: string;
  locale: string;
}) {
  const { t } = useTranslations();

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['classification-items', menuTypeCode, categoryCode, classificationCode, locale],
    queryFn: () => fetchClassificationItems(menuTypeCode, categoryCode, classificationCode, locale),
    enabled: !!menuTypeCode && !!categoryCode && !!classificationCode,
  });

  const backTo = `/menu/${menuTypeCode}/category/${categoryCode}/classifications`;

  if (isLoading) {
    return (
      <PageShell backTo={backTo} backLabel={t('common.backToCategories')}>
        <ItemListSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell backTo={backTo} backLabel={t('common.backToCategories')}>
      {isError ? (
        <p className="text-stone-400 text-center py-12">{t('common.loadError')}</p>
      ) : (
        // Every item here has the same classification, so repeating it on each
        // row would be noise.
        <MenuItemList items={items ?? []} showClassification={false} />
      )}
    </PageShell>
  );
}
