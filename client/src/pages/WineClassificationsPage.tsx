import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchCategories, fetchWineClassifications, fetchClassificationItems } from '@/lib/api';
import { ArrowLeft, ChevronRight } from 'lucide-react';
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

  // Same cache key the categories page uses, so this costs no extra request.
  const { data: categories } = useQuery({
    queryKey: ['categories', menuTypeCode, locale],
    queryFn: () => fetchCategories(menuTypeCode, locale),
    enabled: !!menuTypeCode,
  });
  const currentCategory = categories?.find((c) => c.code === categoryCode);

  const header = (
    <>
      {currentCategory && (
        <h1 className="text-2xl font-bold text-stone-50 mb-6">{currentCategory.name}</h1>
      )}
    </>
  );

  if (isLoading) {
    return (
      <PageShell backTo={`/menu/${menuTypeCode}`} backLabel={t('common.backToCategories')}>
        {header}
        <ul className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-[var(--color-app-panel)]" />
          ))}
        </ul>
      </PageShell>
    );
  }

  return (
    <PageShell backTo={`/menu/${menuTypeCode}`} backLabel={t('common.backToCategories')}>
      {header}
      {isError ? (
        <p className="text-stone-400 text-center py-12">{t('common.loadError')}</p>
      ) : (
        // A list, not a showcase: WineClassification has no image field at all,
        // so the tall tiles could only ever hold the same folder glyph.
        <ul className="space-y-2">
          <li>
            <Row to={`/menu/${menuTypeCode}/category/${categoryCode}`} count={currentCategory?.itemCount}>
              {t('common.allItems')}
            </Row>
          </li>
          {classifications?.map((cls) => {
            const dot = WINE_COLOR_MAP[cls.code];
            return (
              <li key={cls.id}>
                <Row
                  to={`/menu/${menuTypeCode}/category/${categoryCode}/classification/${cls.code}`}
                  count={cls.itemCount}
                >
                  {dot && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot.bg}`} title={dot.title} />}
                  {cls.name}
                </Row>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}

function Row({ to, count, children }: { to: string; count?: number; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-gradient-to-br from-stone-900/50 to-stone-950/40 px-4 py-4 shadow-sm transition-[transform,border-color] duration-150 hover:border-[var(--color-app-accent)]/25 active:scale-[0.99]"
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-[15px] font-medium text-stone-100">
        {children}
      </span>
      {/* Bare number: reads as a count next to a name in any language and
          sidesteps Russian plural forms. */}
      {count !== undefined && (
        <span className="shrink-0 text-xs tabular-nums text-stone-500">{count}</span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-app-accent)]/55 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-app-accent)]" />
    </Link>
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
