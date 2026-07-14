import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Languages, ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { API_BASE, headers } from './api';
import { translateMenuItem } from '@/lib/api';
import { useTranslations } from '@/i18n';
import { ImageUpload } from '@/components/ImageUpload';
import { LanguageTabs } from '@/components/LanguageTabs';

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
type Language = { code: string; name: string };

type PaginatedResponse = {
  items: MenuItemRow[];
  total: number;
  skip: number;
  take: number;
};

const PAGE_SIZE = 20;

export function MenuItemsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<'sortOrder' | 'price'>('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<MenuItemRow | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/categories?take=9999`, { headers: headers() });
      if (!res.ok) return { items: [] as Category[] };
      return res.json() as Promise<{ items: Category[] }>;
    },
  });
  const categories = categoriesData?.items ?? [];

  const { data: languages = [] } = useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: async (): Promise<Language[]> => {
      const res = await fetch(`${API_BASE}/languages`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const params = new URLSearchParams();
  if (filterCategoryId) params.set('categoryId', filterCategoryId);
  if (search) params.set('search', search);
  params.set('sortBy', sortBy);
  params.set('sortOrder', sortOrder);
  params.set('skip', String(page * PAGE_SIZE));
  params.set('take', String(PAGE_SIZE));

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'menu-items', filterCategoryId, search, sortBy, sortOrder, page],
    queryFn: async (): Promise<PaginatedResponse> => {
      const res = await fetch(`${API_BASE}/admin/menu-items?${params}`, { headers: headers() });
      if (!res.ok) return { items: [], total: 0, skip: 0, take: PAGE_SIZE };
      return res.json();
    },
  });

  const list = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-stone-100">{t('admin.menuItems.title')}</h1>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
          <Plus className="w-4 h-4" /> {t('common.add')}
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterCategoryId}
          onChange={(e) => { setFilterCategoryId(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm"
        >
          <option value="">{t('common.all')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.translations?.find((tr) => tr.locale === 'ru')?.name || c.id}
            </option>
          ))}
        </select>

        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
            />
          </div>
          <button type="submit" className="px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)]">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-stone-500" />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as 'sortOrder' | 'price'); setPage(0); }}
            className="px-3 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm"
          >
            <option value="sortOrder">{t('common.sortBySort')}</option>
            <option value="price">{t('common.sortByPrice')}</option>
          </select>
          <button
            onClick={() => { setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc'); setPage(0); }}
            className="px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)]"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
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
            {list.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500 text-sm">{t('common.noResults')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} {t('common.of')} {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> {t('common.prev')}
            </button>
            <span className="text-sm text-stone-400">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('common.next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {modal === 'create' && <CreateModal categoryId={filterCategoryId || categories[0]?.id} languages={languages} onClose={() => setModal(null)} />}
      {editing && <EditModal item={editing} languages={languages} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CreateModal({ categoryId, languages, onClose }: { categoryId: string; languages: Language[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<{ locale: string; name: string; description?: string | null }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/menu-items`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ categoryId, price: Number(price), weightOrVolume: weight || undefined, sortOrder, imagePath, translations }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json() as { id: string; imagePath?: string | null };
      setCreatedId(created.id);
      if (created.imagePath) setImagePath(created.imagePath);
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-items'] });
      toast.success(t('toast.created'));
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
        {createdId && (
          <ImageUpload
            entityId={createdId}
            entityType="menu-item"
            currentPath={imagePath}
            onUploaded={(path) => setImagePath(path)}
          />
        )}
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
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-400">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>{t('common.create')}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({ item, languages, onClose }: { item: MenuItemRow; languages: Language[]; onClose: () => void }) {
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
