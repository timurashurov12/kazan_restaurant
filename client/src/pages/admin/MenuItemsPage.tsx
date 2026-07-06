import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Languages } from 'lucide-react';
import { API_BASE, headers } from './api';
import { translateMenuItem } from '@/lib/api';
import { useTranslations } from '@/i18n';
import { ImageUpload } from '@/components/ImageUpload';

type MenuItemRow = {
  id: string;
  categoryId: string;
  price: number;
  weightOrVolume?: string | null;
  sortOrder: number;
  imagePath?: string | null;
  translations: { locale: string; name: string; description?: string | null }[];
};

type Category = { id: string; translations: { locale: string; name: string }[] };

export function MenuItemsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<MenuItemRow | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<Category[]> => {
      const res = await fetch(`${API_BASE}/admin/categories`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: list = [] } = useQuery({
    queryKey: ['admin', 'menu-items', filterCategoryId],
    queryFn: async (): Promise<MenuItemRow[]> => {
      const url = filterCategoryId
        ? `${API_BASE}/admin/menu-items?categoryId=${filterCategoryId}`
        : `${API_BASE}/admin/menu-items`;
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/admin/menu-items/${id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
      toast.success(t('toast.deleted'));
    },
  });

  const translateMu = useMutation({
    mutationFn: (id: string) => translateMenuItem(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
      toast.success(t('common.translated', { count: data.translated }));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('errors.translationFailed'));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-stone-100">{t('admin.menuItems.title')}</h1>
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm"
          >
            <option value="">{t('common.all')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.translations?.find((tr) => tr.locale === 'ru')?.name || c.id}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
          <Plus className="w-4 h-4" /> {t('common.add')}
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)] overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.sort')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.name')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">{t('common.price')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">{t('common.weight')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/70">
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-stone-400 text-sm">{item.sortOrder}</td>
                <td className="px-4 py-3 text-stone-100">
                  {item.translations?.map((tr) => (
                    <div key={tr.locale} className="flex items-baseline gap-2">
                      <span className="text-xs bg-[var(--color-app-bg)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">{tr.locale}</span>
                      <span className="text-sm">{tr.name}</span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-app-accent)] font-semibold text-sm">{Number(item.price).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-stone-400 text-sm">{item.weightOrVolume || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => translateMu.mutate(item.id)} disabled={translateMu.isPending} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg" title={t('common.translate')}><Languages className="w-4 h-4" /></button>
                    <button onClick={() => setEditing(item)} className="p-2 text-[var(--color-app-accent)] hover:bg-[var(--color-app-accent)]/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm(t('common.confirmDelete'))) deleteMu.mutate(item.id); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'create' && <CreateModal categoryId={filterCategoryId || categories[0]?.id} onClose={() => setModal(null)} />}
      {editing && <EditModal item={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CreateModal({ categoryId, onClose }: { categoryId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [nameRu, setNameRu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descRu, setDescRu] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const translations = [{ locale: 'ru', name: nameRu, description: descRu || undefined }];
      if (nameEn.trim()) translations.push({ locale: 'en', name: nameEn, description: undefined });
      const res = await fetch(`${API_BASE}/admin/menu-items`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ categoryId, price: Number(price), weightOrVolume: weight || undefined, sortOrder, translations }),
      });
      if (!res.ok) throw new Error('Failed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
      toast.success(t('toast.created'));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold text-stone-100">{t('admin.menuItems.newTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Field label={t('admin.menuItems.nameRu')} value={nameRu} onChange={setNameRu} required />
        <Field label={t('admin.menuItems.nameEn')} value={nameEn} onChange={setNameEn} />
        <Field label={t('admin.menuItems.descriptionRu')} value={descRu} onChange={setDescRu} />
        <Field label={t('common.price')} value={price} onChange={setPrice} required />
        <Field label={t('common.weight')} value={weight} onChange={setWeight} placeholder={t('admin.menuItems.weightPlaceholder')} />
        <Field label={t('common.sort')} value={String(sortOrder)} onChange={(v) => setSortOrder(Number(v) || 0)} />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-400">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>{t('common.create')}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({ item, onClose }: { item: MenuItemRow; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [price, setPrice] = useState(String(item.price));
  const [weight, setWeight] = useState(item.weightOrVolume || '');
  const [sortOrder, setSortOrder] = useState(item.sortOrder);
  const [translations, setTranslations] = useState(item.translations.map((tr) => ({ ...tr })));
  const [imagePath, setImagePath] = useState(item.imagePath || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/menu-items/${item.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ price: Number(price), weightOrVolume: weight || null, sortOrder, imagePath, translations }),
      });
      if (!res.ok) throw new Error('Failed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
      toast.success(t('toast.updated'));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold text-stone-100">{t('admin.menuItems.editTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <ImageUpload
          entityId={item.id}
          entityType="menu-item"
          currentPath={imagePath}
          onUploaded={(path) => setImagePath(path)}
        />
        <Field label={t('common.price')} value={price} onChange={setPrice} required />
        <Field label={t('common.weight')} value={weight} onChange={setWeight} />
        <Field label={t('common.sort')} value={String(sortOrder)} onChange={(v) => setSortOrder(Number(v) || 0)} />
        {translations.map((tr, i) => (
          <div key={tr.locale} className="space-y-2">
            <Field label={`${t('common.name')} (${tr.locale.toUpperCase()})`} value={tr.name} onChange={(v) => setTranslations((prev) => prev.map((x, j) => j === i ? { ...x, name: v } : x))} />
            <Field label={`${t('admin.menuItems.descriptionRu')} (${tr.locale.toUpperCase()})`} value={tr.description || ''} onChange={(v) => setTranslations((prev) => prev.map((x, j) => j === i ? { ...x, description: v } : x))} />
          </div>
        ))}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-400">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)]">{children}</div>
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
