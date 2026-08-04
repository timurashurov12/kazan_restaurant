import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Image as ImageIcon, Settings, Languages, Tag, CircleDollarSign, ChevronDown, X } from 'lucide-react';
import { API_BASE, headers, authFetch } from './api';
import { useTranslations } from '@/i18n';
import { ImageUpload } from '@/components/ImageUpload';
import { LanguageTabs } from '@/components/LanguageTabs';
import { BadgePicker } from '@/components/BadgePicker';
import { PricesEditor } from '@/components/PricesEditor';

type Category = { id: string; translations: { locale: string; name: string }[] };
type Language = { code: string; name: string };
type Region = { id: string; translations: { locale: string; name: string }[] };
type WineClassification = { id: string; code: string; translations: { locale: string; name: string }[] };
type MenuItemRow = {
  id: string;
  categoryId: string;
  price: number;
  prices: Record<string, number> | null;
  badges: string[] | null;
  weightOrVolume?: string | null;
  sortOrder: number;
  imagePath?: string | null;
  regionId?: string | null;
  classificationId?: string | null;
  translations: { locale: string; name: string; description?: string | null }[];
};

export function MenuItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const returnTo = (location.state as { from?: string } | null)?.from ?? '';

  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [classificationId, setClassificationId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<{ locale: string; name: string; description?: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<{ items: Category[] }> => {
      const res = await authFetch(`${API_BASE}/admin/categories?take=9999`, { headers: headers() });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
  const categories = categoriesData?.items ?? [];

  const { data: languages = [] } = useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: async (): Promise<Language[]> => {
      const res = await authFetch(`${API_BASE}/languages`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['admin', 'regions'],
    queryFn: async (): Promise<Region[]> => {
      const res = await authFetch(`${API_BASE}/admin/regions`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: classifications = [] } = useQuery({
    queryKey: ['admin', 'wine-classifications'],
    queryFn: async (): Promise<WineClassification[]> => {
      const res = await authFetch(`${API_BASE}/admin/wine-classifications`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ['admin', 'menu-item', id],
    queryFn: async (): Promise<MenuItemRow | null> => {
      if (!id) return null;
      const res = await authFetch(`${API_BASE}/admin/menu-items/${id}`, { headers: headers() });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (item) {
      setCategoryId(item.categoryId);
      setPrice(String(item.price));
      setPrices(item.prices || null);
      setBadges(item.badges || []);
      setWeight(item.weightOrVolume || '');
      setSortOrder(item.sortOrder);
      setImagePath(item.imagePath || null);
      setRegionId(item.regionId || null);
      setClassificationId(item.classificationId || null);
      setTranslations(item.translations.map((tr) => ({ ...tr })));
    }
  }, [item]);

  useEffect(() => {
    if (!isEdit && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, isEdit, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        categoryId,
        price: Number(price),
        prices,
        badges: badges.length > 0 ? badges : null,
        weightOrVolume: weight || null,
        sortOrder,
        imagePath,
        regionId: regionId || null,
        classificationId: classificationId || null,
        translations,
      };
      if (isEdit && id) {
        const res = await authFetch(`${API_BASE}/admin/menu-items/${id}`, {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed');
        queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
        toast.success(t('toast.updated'));
      } else {
        const res = await authFetch(`${API_BASE}/admin/menu-items`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed');
        const created = await res.json() as { id: string };
        setCreatedId(created.id);
        queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
        toast.success(t('toast.created'));
      }
      navigate(`/admin/menu-items${returnTo}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && itemLoading) {
    return <div className="text-stone-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/admin/menu-items${returnTo}`)} className="p-2 text-stone-400 hover:text-stone-200 hover:bg-white/5 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-stone-100">
          {isEdit ? t('admin.menuItems.editTitle') : t('admin.menuItems.newTitle')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section: Main info */}
            <FormSection icon={Settings} title={t('common.mainInfo')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-400 mb-1">{t('admin.categories.title')}</label>
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2 pr-10 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40 appearance-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.translations?.find((tr) => tr.locale === 'ru')?.name || c.id}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </div>
                <Field label={t('common.price')} value={price} onChange={setPrice} required />
                <Field label={t('common.weight')} value={weight} onChange={setWeight} placeholder={t('admin.menuItems.weightPlaceholder')} />
                <Field label={t('common.sort')} value={String(sortOrder)} onChange={(v) => setSortOrder(Number(v) || 0)} />

                {/* Region */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-400 mb-1">Регион</label>
                  <div className="relative">
                    <select
                      value={regionId || ''}
                      onChange={(e) => setRegionId(e.target.value || null)}
                      className="w-full px-4 py-2 pr-10 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40 appearance-none"
                    >
                      <option value="">Без региона</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.translations?.find((tr) => tr.locale === 'ru')?.name || r.id}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    {regionId && (
                      <button type="button" onClick={() => setRegionId(null)} className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Wine Classification */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-400 mb-1">Классификация вина</label>
                  <div className="relative">
                    <select
                      value={classificationId || ''}
                      onChange={(e) => setClassificationId(e.target.value || null)}
                      className="w-full px-4 py-2 pr-10 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40 appearance-none"
                    >
                      <option value="">Без классификации</option>
                      {classifications.map((c) => (
                        <option key={c.id} value={c.id}>{c.translations?.find((tr) => tr.locale === 'ru')?.name || c.code}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    {classificationId && (
                      <button type="button" onClick={() => setClassificationId(null)} className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Section: Additional Prices */}
            <FormSection icon={CircleDollarSign} title="Доп. цены (бокал, стопка)">
              <PricesEditor value={prices} onChange={setPrices} />
            </FormSection>

            {/* Section: Badges */}
            <FormSection icon={Tag} title="Бейджи">
              <BadgePicker value={badges} onChange={setBadges} />
            </FormSection>

            {/* Section: Translations */}
            <FormSection icon={Languages} title={t('common.translations')}>
              {languages.length > 0 ? (
                <LanguageTabs
                  languages={languages}
                  translations={translations}
                  onChange={setTranslations}
                  showDescription
                  nameLabel={t('common.name')}
                  descriptionLabel={t('admin.menuItems.descriptionRu')}
                />
              ) : (
                <p className="text-stone-500 text-sm">{t('common.loading')}</p>
              )}
            </FormSection>
          </div>

          {/* Right: image */}
          <div className="space-y-6">
            <FormSection icon={ImageIcon} title={t('common.image')}>
              {(isEdit || createdId) ? (
                <ImageUpload
                  entityId={createdId || id || ''}
                  entityType="menu-item"
                  currentPath={imagePath}
                  onUploaded={(path) => setImagePath(path)}
                />
              ) : (
                <p className="text-stone-500 text-sm">{t('admin.menuItems.imageAfterSave')}</p>
              )}
            </FormSection>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2 border-t border-[var(--color-border)]">
          <button type="button" onClick={() => navigate(`/admin/menu-items${returnTo}`)} className="px-4 py-2 rounded-lg text-sm text-stone-400">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
            {isEdit ? t('common.save') : t('common.create')}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)]">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[var(--color-app-accent)]" />
        <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-400 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40" />
    </div>
  );
}


