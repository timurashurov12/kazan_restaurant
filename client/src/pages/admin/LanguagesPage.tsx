import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Globe, Languages, Pencil } from 'lucide-react';
import { API_BASE, headers, authFetch } from './api';
import { translateI18nFile } from '@/lib/api';
import { useTranslations } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Language = { id: string; code: string; name: string | null; sortOrder: number };

export function LanguagesPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: async (): Promise<Language[]> => {
      const res = await authFetch(`${API_BASE}/admin/languages`, { headers: headers() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${API_BASE}/admin/languages/${id}`, { method: 'DELETE', headers: headers() });
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
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('common.add')}
        </Button>
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
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditing(lang)}
                      className="text-stone-400 hover:text-stone-200 hover:bg-white/5"
                      title={t('common.edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {lang.code !== 'ru' && lang.code !== 'en' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => translateMu.mutate(lang.code)}
                        disabled={translateMu.isPending}
                        className="text-blue-400 hover:bg-blue-500/10"
                        title={t('common.translate')}
                      >
                        <Languages className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        if (confirm(t('common.confirmDelete'))) deleteMu.mutate(lang.id);
                      }}
                      className="text-red-400 hover:bg-red-500/10"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <LanguageModal onClose={() => setShowCreate(false)} />}
      {editing && <LanguageModal language={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function LanguageModal({ language, onClose }: { language?: Language; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const isEdit = Boolean(language);
  const [code, setCode] = useState(language?.code ?? '');
  const [name, setName] = useState(language?.name ?? '');
  const [sortOrder, setSortOrder] = useState(language?.sortOrder ?? 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit
        ? `${API_BASE}/admin/languages/${language!.id}`
        : `${API_BASE}/admin/languages`;
      const res = await authFetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: headers(),
        body: JSON.stringify({ code: code.trim().toLowerCase(), name, sortOrder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || t('errors.createFailed'));
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success(isEdit ? t('toast.updated') : t('toast.created'));
      onClose();
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
          <DialogTitle>{isEdit ? t('common.edit') : t('admin.languages.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-stone-400">{t('common.code')}</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="kk"
              required
              disabled={isEdit}
              className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 disabled:opacity-50"
            />
          </div>
          <div>
            <Label className="text-stone-400">{t('common.name')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Қазақша"
              required
              className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100 placeholder:text-stone-500"
            />
          </div>
          <div>
            <Label className="text-stone-400">{t('common.sort')}</Label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100"
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? t('common.loading') : (isEdit ? t('common.save') : t('common.create'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
