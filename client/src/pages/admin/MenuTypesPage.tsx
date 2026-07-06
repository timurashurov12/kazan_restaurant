import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Languages } from 'lucide-react';
import { API_BASE, headers } from './api';
import { translateMenuType } from '@/lib/api';
import { useTranslations } from '@/i18n';
import { ImageUpload } from '@/components/ImageUpload';

type MenuTypeRow = {
  id: string;
  code: string;
  imagePath?: string | null;
  menuId: string;
  translations: { locale: string; name: string }[];
};

async function fetchMenuTypes(menuId?: string): Promise<MenuTypeRow[]> {
  const url = menuId
    ? `${API_BASE}/admin/menu-types?menuId=${menuId}`
    : `${API_BASE}/admin/menu-types`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export function MenuTypesPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<MenuTypeRow | null>(null);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin', 'menu-types'],
    queryFn: () => fetchMenuTypes(),
  });

  const deleteMu = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/admin/menu-types/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-types'] });
      toast.success(t('toast.deleted'));
    },
    onError: (err: Error) => toast.error(err.message),
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

  if (isLoading) {
    return <div className="text-stone-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-stone-100">{t('admin.menuTypes.title')}</h1>
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
          <Plus className="w-4 h-4" /> {t('common.add')}
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)] overflow-hidden">
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
                    <button onClick={() => translateMu.mutate(item.id)} disabled={translateMu.isPending} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg" title={t('common.translate')}><Languages className="w-4 h-4" /></button>
                    <button onClick={() => setEditing(item)} className="p-2 text-[var(--color-app-accent)] hover:bg-[var(--color-app-accent)]/10 rounded-lg" title={t('common.edit')}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm(t('common.confirmDelete'))) deleteMu.mutate(item.id); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title={t('common.delete')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'create' && <CreateModal onClose={() => setModal(null)} />}
      {editing && <EditModal item={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [code, setCode] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const translations = [{ locale: 'ru', name: nameRu }];
      if (nameEn.trim()) translations.push({ locale: 'en', name: nameEn });
      const res = await fetch(`${API_BASE}/admin/menu-types`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          menuId: 'seed_menu_default',
          code: code || 'main',
          translations,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      queryClient.invalidateQueries({ queryKey: ['admin', 'menu-types'] });
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
      <h2 className="text-lg font-semibold text-stone-100">{t('admin.menuTypes.newTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Field label={t('common.code')} value={code} onChange={setCode} placeholder={t('admin.menuTypes.codePlaceholder')} />
        <Field label={t('admin.menuItems.nameRu')} value={nameRu} onChange={setNameRu} placeholder={t('home.mainMenu')} required />
        <Field label={t('admin.menuItems.nameEn')} value={nameEn} onChange={setNameEn} placeholder={t('home.mainMenu')} />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
            {loading ? t('common.loading') : t('common.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({ item, onClose }: { item: MenuTypeRow; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [code, setCode] = useState(item.code);
  const [translations, setTranslations] = useState(item.translations.map((tr) => ({ ...tr })));
  const [imagePath, setImagePath] = useState(item.imagePath || null);
  const [loading, setLoading] = useState(false);

  const updateTranslation = (index: number, value: string) => {
    setTranslations((prev) => prev.map((tr, i) => (i === index ? { ...tr, name: value } : tr)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/menu-types/${item.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ code, imagePath, translations }),
      });
      if (!res.ok) throw new Error('Failed to update');
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
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold text-stone-100">{t('admin.menuTypes.editTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <ImageUpload
          entityId={item.id}
          entityType="menu-type"
          currentPath={imagePath}
          onUploaded={(path) => setImagePath(path)}
        />
        <Field label={t('common.code')} value={code} onChange={setCode} />
        {translations.map((tr, i) => (
          <Field key={tr.locale} label={`${t('common.name')} (${tr.locale.toUpperCase()})`} value={tr.name} onChange={(v) => updateTranslation(i, v)} />
        ))}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-200">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}>
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-400 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
      />
    </div>
  );
}
