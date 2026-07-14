import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Languages, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { API_BASE, headers, authFetch } from './api';
import { translateMenuItem } from '@/lib/api';
import { useTranslations } from '@/i18n';

type MenuItemRow = {
  id: string;
  categoryId: string;
  price: number;
  weightOrVolume?: string | null;
  sortOrder: number;
  imagePath?: string | null;
  translations: { locale: string; name: string; description?: string | null }[];
  category?: { id: string; translations: { locale: string; name: string }[] } | null;
};

type Category = { id: string; translations: { locale: string; name: string }[] };

type PaginatedResponse = {
  items: MenuItemRow[];
  total: number;
  skip: number;
  take: number;
};

const PAGE_SIZE = 20;

export function MenuItemsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<'sortOrder' | 'price'>('sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await authFetch(`${API_BASE}/admin/categories?take=9999`, { headers: headers() });
      if (!res.ok) return { items: [] as Category[] };
      return res.json() as Promise<{ items: Category[] }>;
    },
  });
  const categories = categoriesData?.items ?? [];

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
      const res = await authFetch(`${API_BASE}/admin/menu-items?${params}`, { headers: headers() });
      if (!res.ok) return { items: [], total: 0, skip: 0, take: PAGE_SIZE };
      return res.json();
    },
  });

  const list = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${API_BASE}/admin/menu-items/${id}`, { method: 'DELETE', headers: headers() });
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
        <button onClick={() => navigate('/admin/menu-items/new')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
          <Plus className="w-4 h-4" /> {t('common.add')}
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)]"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t('common.filter')}
          {filterCategoryId && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-app-accent)]/20 text-[var(--color-app-accent)]">1</span>
          )}
        </button>

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
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)] overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <SortHeader label={t('common.sort')} field="sortOrder" sortBy={sortBy} sortOrder={sortOrder} onSort={(field, order) => { setSortBy(field); setSortOrder(order); setPage(0); }} />
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.name')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('admin.categories.title')}</th>
              <SortHeader label={t('common.price')} field="price" sortBy={sortBy} sortOrder={sortOrder} onSort={(field, order) => { setSortBy(field); setSortOrder(order); setPage(0); }} align="right" />
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
                <td className="px-4 py-3 text-stone-400 text-sm">
                  {item.category?.translations?.find((tr) => tr.locale === 'ru')?.name || '—'}
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-app-accent)] font-semibold text-sm">{Number(item.price).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-stone-400 text-sm">{item.weightOrVolume || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => translateMu.mutate(item.id)} disabled={translateMu.isPending} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg" title={t('common.translate')}><Languages className="w-4 h-4" /></button>
                    <button onClick={() => navigate(`/admin/menu-items/${item.id}/edit`)} className="p-2 text-[var(--color-app-accent)] hover:bg-[var(--color-app-accent)]/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm(t('common.confirmDelete'))) deleteMu.mutate(item.id); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500 text-sm">{t('common.noResults')}</td>
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

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && setFilterOpen(false)}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="relative w-full max-w-sm bg-[var(--color-app-panel)] border-l border-[var(--color-border)] p-6 overflow-y-auto animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-stone-100">{t('common.filter')}</h2>
              <button onClick={() => setFilterOpen(false)} className="p-2 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-2">{t('admin.categories.title')}</label>
                <div className="space-y-1">
                  <button
                    onClick={() => { setFilterCategoryId(''); setPage(0); setFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      !filterCategoryId
                        ? 'bg-[var(--color-app-accent)]/15 text-[var(--color-app-accent)]'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                    }`}
                  >
                    {t('common.all')}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setFilterCategoryId(c.id); setPage(0); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        filterCategoryId === c.id
                          ? 'bg-[var(--color-app-accent)]/15 text-[var(--color-app-accent)]'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                      }`}
                    >
                      {c.translations?.find((tr) => tr.locale === 'ru')?.name || c.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortHeader({ label, field, sortBy, sortOrder, onSort, align = 'left' }: {
  label: string;
  field: 'sortOrder' | 'price';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'sortOrder' | 'price', order: 'asc' | 'desc') => void;
  align?: 'left' | 'right';
}) {
  const active = sortBy === field;
  const nextOrder = active && sortOrder === 'asc' ? 'desc' : 'asc';

  return (
    <th
      onClick={() => onSort(field, nextOrder)}
      className={`px-4 py-3 text-xs font-medium uppercase cursor-pointer select-none hover:text-stone-200 transition ${align === 'right' ? 'text-right' : 'text-left'} ${active ? 'text-[var(--color-app-accent)]' : 'text-stone-400'}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  );
}
