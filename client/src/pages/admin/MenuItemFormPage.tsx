import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Image as ImageIcon, Settings, Languages } from 'lucide-react';
import Select from 'react-select';
import { API_BASE, headers, authFetch } from './api';
import { useTranslations } from '@/i18n';
import { ImageUpload } from '@/components/ImageUpload';
import { LanguageTabs } from '@/components/LanguageTabs';

type Category = { id: string; translations: { locale: string; name: string }[] };
type Language = { code: string; name: string };
type MenuItemRow = {
  id: string;
  categoryId: string;
  price: number;
  weightOrVolume?: string | null;
  sortOrder: number;
  imagePath?: string | null;
  translations: { locale: string; name: string; description?: string | null }[];
};

export function MenuItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslations();

  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [translations, setTranslations] = useState<{ locale: string; name: string; description?: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<Category[]> => {
      const res = await authFetch(`${API_BASE}/admin/categories?take=9999`, { headers: headers() });
      if (!res.ok) return [];
      const data = await res.json() as { items: Category[] };
      return data.items;
    },
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: async (): Promise<Language[]> => {
      const res = await authFetch(`${API_BASE}/languages`, { headers: headers() });
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
      setWeight(item.weightOrVolume || '');
      setSortOrder(item.sortOrder);
      setImagePath(item.imagePath || null);
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
      if (isEdit && id) {
        const res = await authFetch(`${API_BASE}/admin/menu-items/${id}`, {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify({ categoryId, price: Number(price), weightOrVolume: weight || null, sortOrder, imagePath, translations }),
        });
        if (!res.ok) throw new Error('Failed');
        queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
        toast.success(t('toast.updated'));
      } else {
        const res = await authFetch(`${API_BASE}/admin/menu-items`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ categoryId, price: Number(price), weightOrVolume: weight || undefined, sortOrder, imagePath, translations }),
        });
        if (!res.ok) throw new Error('Failed');
        const created = await res.json() as { id: string };
        setCreatedId(created.id);
        queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
        toast.success(t('toast.created'));
      }
      navigate('/admin/menu-items');
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
        <button onClick={() => navigate('/admin/menu-items')} className="p-2 text-stone-400 hover:text-stone-200 hover:bg-white/5 rounded-lg">
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
                  <Select<{ value: string; label: string }>
                    value={categories.find((c) => c.id === categoryId) ? { value: categoryId, label: categories.find((c) => c.id === categoryId)?.translations?.find((tr) => tr.locale === 'ru')?.name || categoryId } : null}
                    onChange={(opt) => opt && setCategoryId(opt.value)}
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.translations?.find((tr) => tr.locale === 'ru')?.name || c.id,
                    }))}
                    placeholder={t('common.all')}
                    isSearchable
                    styles={selectStyles}
                  />
                </div>
                <Field label={t('common.price')} value={price} onChange={setPrice} required />
                <Field label={t('common.weight')} value={weight} onChange={setWeight} placeholder={t('admin.menuItems.weightPlaceholder')} />
                <Field label={t('common.sort')} value={String(sortOrder)} onChange={(v) => setSortOrder(Number(v) || 0)} />
              </div>
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
          <button type="button" onClick={() => navigate('/admin/menu-items')} className="px-4 py-2 rounded-lg text-sm text-stone-400">{t('common.cancel')}</button>
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

const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    backgroundColor: 'var(--color-app-bg)',
    borderColor: state.isFocused ? 'var(--color-app-accent)' : 'var(--color-border)',
    borderRadius: '0.5rem',
    padding: '0.125rem 0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(211,174,110,0.25)' : 'none',
    '&:hover': { borderColor: 'var(--color-app-accent)' },
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: 'var(--color-app-panel)',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  }),
  option: (base: Record<string, unknown>, state: { isFocused: boolean; isSelected: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? 'var(--color-app-accent)' : state.isFocused ? 'rgba(255,255,255,0.05)' : 'transparent',
    color: state.isSelected ? 'var(--color-app-bg)' : 'var(--color-app-text, #e7e5e4)',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: '#e7e5e4',
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: '#e7e5e4',
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: '#78716c',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: Record<string, unknown>) => ({
    ...base,
    color: '#78716c',
    '&:hover': { color: '#a8a29e' },
  }),
};
