import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Globe, Languages } from 'lucide-react';
import { API_BASE, headers, authFetch } from './api';
import { translateRegion } from '@/lib/api';
import { useTranslations } from '@/i18n';
import { LanguageTabs } from '@/components/LanguageTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type RegionRow = {
  id: string;
  sortOrder: number;
  isActive: boolean;
  translations: { locale: string; name: string }[];
};
type Language = { code: string; name: string };

export function RegionsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [translations, setTranslations] = useState<{ locale: string; name: string }[]>([]);

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
    queryFn: async (): Promise<RegionRow[]> => {
      const res = await authFetch(`${API_BASE}/admin/regions`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const saveMu = useMutation({
    mutationFn: async () => {
      const body = { sortOrder, translations };
      if (editingId) {
        const res = await authFetch(`${API_BASE}/admin/regions/${editingId}`, {
          method: 'PUT', headers: headers(), body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
      } else {
        const res = await authFetch(`${API_BASE}/admin/regions`, {
          method: 'POST', headers: headers(), body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'regions'] });
      toast.success(editingId ? t('toast.updated') : t('toast.created'));
      closeModal();
    },
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${API_BASE}/admin/regions/${id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'regions'] });
      toast.success(t('toast.deleted'));
    },
  });

  const translateMu = useMutation({
    mutationFn: (id: string) => translateRegion(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'regions'] });
      toast.success(t('toast.translated', { count: data.translated }));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('errors.translationFailed'));
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setSortOrder(0);
    setTranslations([]);
    setModalOpen(true);
  };

  const openEdit = (region: RegionRow) => {
    setEditingId(region.id);
    setSortOrder(region.sortOrder);
    setTranslations(region.translations.map((tr) => ({ ...tr })));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const ruName = (translations: { locale: string; name: string }[]) =>
    translations.find((tr) => tr.locale === 'ru')?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-stone-100">{t('admin.nav.regions')}</h1>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('common.add')}
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)] overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.sort')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.name')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/70">
            {regions.map((region) => (
              <tr key={region.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-stone-400 text-sm">{region.sortOrder}</td>
                <td className="px-4 py-3 text-stone-100 text-sm">{ruName(region.translations)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => translateMu.mutate(region.id)}
                      disabled={translateMu.isPending}
                      className="text-blue-400 hover:bg-blue-500/10"
                      title={t('common.translate')}
                    >
                      <Languages className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(region)} className="text-[var(--color-app-accent)] hover:bg-[var(--color-app-accent)]/10"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => { if (confirm(t('common.confirmDelete'))) deleteMu.mutate(region.id); }} className="text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {regions.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-stone-500 text-sm">{t('common.noResults')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? `${t('common.edit')} ${t('common.name').toLowerCase()}` : `${t('common.create')} ${t('common.name').toLowerCase()}`}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-stone-400">{t('common.sort')}</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100" />
            </div>

            <div>
              <Label className="text-stone-400 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {t('common.translations')}</Label>
              {languages.length > 0 ? (
                <LanguageTabs languages={languages} translations={translations} onChange={setTranslations} nameLabel="Название" />
              ) : (
                <p className="text-stone-500 text-sm">{t('common.loading')}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button onClick={() => saveMu.mutate()} disabled={saveMu.isPending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
