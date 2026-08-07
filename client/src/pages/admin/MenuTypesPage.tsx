import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Languages, ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { API_BASE, headers, authFetch } from './api';
import { translateMenuType } from '@/lib/api';
import { useTranslations } from '@/i18n';
import { ImageUpload } from '@/components/ImageUpload';
import { LanguageTabs } from '@/components/LanguageTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type MenuTypeRow = {
  id: string;
  code: string;
  imagePath?: string | null;
  menuId: string;
  sortOrder: number;
  translations: { locale: string; name: string }[];
};

type Language = { code: string; name: string };

type PaginatedResponse = {
  items: MenuTypeRow[];
  total: number;
  skip: number;
  take: number;
};

const PAGE_SIZE = 20;

export function MenuTypesPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<MenuTypeRow | null>(null);

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('sortOrder', sortOrder);
  params.set('skip', String(page * PAGE_SIZE));
  params.set('take', String(PAGE_SIZE));

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'menu-types', search, sortOrder, page],
    queryFn: async (): Promise<PaginatedResponse> => {
      const res = await authFetch(`${API_BASE}/admin/menu-types?${params}`, { headers: headers() });
      if (!res.ok) return { items: [], total: 0, skip: 0, take: PAGE_SIZE };
      return res.json();
    },
  });

  const list = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const { data: languages = [] } = useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: async (): Promise<Language[]> => {
      const res = await authFetch(`${API_BASE}/languages`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${API_BASE}/admin/menu-types/${id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-types'] });
      toast.success(t('toast.deleted'));
    },
  });

  const translateMu = useMutation({
    mutationFn: (id: string) => translateMenuType(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-types'] });
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

  if (isLoading) {
    return <div className="text-stone-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-stone-100">{t('admin.menuTypes.title')}</h1>
        <Button onClick={() => setModal('create')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('common.add')}
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('common.search')}
              className="pl-9 bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100"
            />
          </div>
          <Button type="submit" variant="outline" size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-stone-500" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc'); setPage(0); }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)] overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.code')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.name')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/70">
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-sm text-stone-200">{item.code}</td>
                <td className="px-4 py-3 text-stone-100">
                  {item.translations?.map((tr) => (
                    <div key={tr.locale} className="flex items-baseline gap-2">
                      <span className="text-xs bg-[var(--color-app-bg)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">{tr.locale}</span>
                      <span className="text-sm">{tr.name}</span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => translateMu.mutate(item.id)} disabled={translateMu.isPending} title={t('common.translate')}>
                      <Languages className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(item)}>
                      <Pencil className="w-4 h-4 text-[var(--color-app-accent)]" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm(t('common.confirmDelete'))) deleteMu.mutate(item.id); }}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-stone-500 text-sm">{t('common.noResults')}</td>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> {t('common.prev')}
            </Button>
            <span className="text-sm text-stone-400">{page + 1} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1"
            >
              {t('common.next')} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {modal === 'create' && <CreateModal languages={languages} onClose={() => setModal(null)} />}
      {editing && <EditModal item={editing} languages={languages} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CreateModal({ languages, onClose }: { languages: Language[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [code, setCode] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<{ locale: string; name: string; description?: string | null }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/admin/menu-types`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          menuId: 'seed_menu_default',
          code: code || 'main',
          imagePath,
          translations,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json() as { id: string; imagePath?: string | null };
      setCreatedId(created.id);
      if (created.imagePath) setImagePath(created.imagePath);
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-types'] });
      toast.success(t('toast.created'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.menuTypes.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {createdId && (
            <ImageUpload
              entityId={createdId}
              entityType="menu-type"
              currentPath={imagePath}
              onUploaded={(path) => setImagePath(path)}
            />
          )}
          <div className="space-y-2">
            <Label className="text-stone-400">{t('common.code')}</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('admin.menuTypes.codePlaceholder')}
              className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100"
            />
          </div>
          {languages.length > 0 && (
            <LanguageTabs
              languages={languages}
              translations={translations}
              onChange={setTranslations}
              nameLabel={t('common.name')}
            />
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={loading}>{t('common.create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditModal({ item, languages, onClose }: { item: MenuTypeRow; languages: Language[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [code, setCode] = useState(item.code);
  const [translations, setTranslations] = useState(item.translations.map((tr) => ({ ...tr })));
  const [imagePath, setImagePath] = useState(item.imagePath || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/admin/menu-types/${item.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ code, imagePath, translations }),
      });
      if (!res.ok) throw new Error('Failed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-types'] });
      toast.success(t('toast.updated'));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.menuTypes.editTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            entityId={item.id}
            entityType="menu-type"
            currentPath={imagePath}
            onUploaded={(path) => setImagePath(path)}
          />
          <div className="space-y-2">
            <Label className="text-stone-400">{t('common.code')}</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100"
            />
          </div>
          {languages.length > 0 && (
            <LanguageTabs
              languages={languages}
              translations={translations}
              onChange={setTranslations}
              nameLabel={t('common.name')}
            />
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={loading}>{t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
