import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Globe, Languages } from 'lucide-react';
import { API_BASE, headers, authFetch } from './api';
import { translateRegion } from '@/lib/api';
import { useTranslations } from '@/i18n';
import { LanguageTabs } from '@/components/LanguageTabs';

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
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
          <Plus className="w-4 h-4" /> {t('common.add')}
        </button>
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
                    <button
                      onClick={() => translateMu.mutate(region.id)}
                      disabled={translateMu.isPending}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                      title={t('common.translate')}
                    >
                      <Languages className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(region)} className="p-2 text-[var(--color-app-accent)] hover:bg-[var(--color-app-accent)]/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm(t('common.confirmDelete'))) deleteMu.mutate(region.id); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-[var(--color-app-panel)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 animate-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-100">{editingId ? `${t('common.edit')} ${t('common.name').toLowerCase()}` : `${t('common.create')} ${t('common.name').toLowerCase()}`}</h2>
              <button onClick={closeModal} className="p-2 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">{t('common.sort')}</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {t('common.translations')}</label>
              {languages.length > 0 ? (
                <LanguageTabs languages={languages} translations={translations} onChange={setTranslations} nameLabel="Название" />
              ) : (
                <p className="text-stone-500 text-sm">{t('common.loading')}</p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-[var(--color-border)]">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm text-stone-400">{t('common.cancel')}</button>
              <button onClick={() => saveMu.mutate()} disabled={saveMu.isPending} className="px-6 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
