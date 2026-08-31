import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { fetchCategories, fetchCategoryItems } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { MenuItemList, ItemListSkeleton } from '@/components/menu/MenuItemList';

export function MenuPage() {
  const { menuTypeCode, categoryCode } = useParams<{ menuTypeCode: string; categoryCode: string }>();
  const { locale } = useLocale();
  const { t } = useTranslations();

  const { data: items, isLoading } = useQuery({
    queryKey: ['category-items', menuTypeCode, categoryCode, locale],
    queryFn: () => fetchCategoryItems(menuTypeCode!, categoryCode!, locale),
    enabled: !!menuTypeCode && !!categoryCode,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', menuTypeCode, locale],
    queryFn: () => fetchCategories(menuTypeCode!, locale),
    enabled: !!menuTypeCode,
  });

  const currentCategory = categories?.find((c) => c.code === categoryCode);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="p-4 max-w-2xl mx-auto pb-8 animate-in">
        <div className="mb-6">
          <Link
            to={`/menu/${menuTypeCode}`}
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-[var(--color-app-accent)] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToCategories')}
          </Link>
        </div>

        {currentCategory && (
          <h1 className="text-2xl font-bold text-stone-50 mb-6">{currentCategory.name}</h1>
        )}

        {isLoading ? <ItemListSkeleton /> : <MenuItemList items={items ?? []} />}
      </div>
    </div>
  );
}
