import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Globe, Languages } from 'lucide-react';
import { API_BASE, headers } from './api';
import { translateI18nFile } from '@/lib/api';
import { useTranslations } from '@/i18n';

type Language = { id: string; code: string; name: string | null; sortOrder: number };

export function LanguagesPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [showCreate, setShowCreate] = useState(false);

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: async (): Promise<Language[]> => {
      const res = await fetch(`${API_BASE}/admin/languages`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/admin/languages/${id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success(t('toast.deleted'));
    },
  });

  const translateMu = useMutation({
    mutationFn: (code: string) => translateI18nFile(code),
    onSuccess: () => {
      toast.success(t('toast.updated'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('errors.translationFailed'));
    },
  });

  if (isLoading) {
    return <div className="text-stone-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-stone-100">{t('admin.languages.title')}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}
        >
          <Plus className="w-4 h-4" /> {t('common.add')}
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.sort')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.code')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">{t('common.name')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/70">
            {languages.map((lang) => (
              <tr key={lang.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-stone-400 text-sm">{lang.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-stone-500" />
                    <span className="font-mono text-sm text-stone-200">{lang.code}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-100 text-sm">{lang.name}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {lang.code !== 'ru' && lang.code !== 'en' && (
                      <button
                        onClick={() => translateMu.mutate(lang.code)}
                        disabled={translateMu.isPending}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                        title={t('common.translate')}
                      >
                        <Languages className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(t('common.confirmDelete'))) deleteMu.mutate(lang.id);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/languages`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ code: code.trim().toLowerCase(), name, sortOrder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || t('errors.createFailed'));
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success(t('toast.created'));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-stone-100">{t('admin.languages.newTitle')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">{t('common.code')}</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="kk"
              required
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">{t('common.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Қазақша"
              required
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">{t('common.sort')}</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200">{t('common.cancel')}</button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}
            >
              {loading ? t('common.loading') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
