import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
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
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/menu-items')} className="p-2 text-stone-400 hover:text-stone-200 hover:bg-white/5 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-stone-100">
          {isEdit ? t('admin.menuItems.editTitle') : t('admin.menuItems.newTitle')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)]">
        {(isEdit || createdId) && (
          <ImageUpload
            entityId={createdId || id || ''}
            entityType="menu-item"
            currentPath={imagePath}
            onUploaded={(path) => setImagePath(path)}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">{t('admin.categories.title')}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.translations?.find((tr) => tr.locale === 'ru')?.name || c.id}
              </option>
            ))}
          </select>
        </div>

        <Field label={t('common.price')} value={price} onChange={setPrice} required />
        <Field label={t('common.weight')} value={weight} onChange={setWeight} placeholder={t('admin.menuItems.weightPlaceholder')} />
        <Field label={t('common.sort')} value={String(sortOrder)} onChange={(v) => setSortOrder(Number(v) || 0)} />

        {languages.length > 0 && (
          <LanguageTabs
            languages={languages}
            translations={translations}
            onChange={setTranslations}
            showDescription
            nameLabel={t('common.name')}
            descriptionLabel={t('admin.menuItems.descriptionRu')}
          />
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={() => navigate('/admin/menu-items')} className="px-4 py-2 rounded-lg text-sm text-stone-400">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
            {isEdit ? t('common.save') : t('common.create')}
          </button>
        </div>
      </form>
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
