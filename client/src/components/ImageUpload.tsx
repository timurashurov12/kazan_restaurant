import { useState, useRef } from 'react';
import { useTranslations } from '@/i18n';
import { publicUploadUrl } from '@/lib/api';
import { Upload, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('kazan-admin-token');
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

interface ImageUploadProps {
  entityId: string;
  entityType: 'menu-item' | 'category' | 'menu-type';
  currentPath: string | null;
  onUploaded: (newPath: string) => void;
}

export function ImageUpload({ entityId, entityType, currentPath, onUploaded }: ImageUploadProps) {
  const { t } = useTranslations();
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlValue, setUrlValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const urlMap = {
    'menu-item': '/admin/menu-items',
    'category': '/admin/categories',
    'menu-type': '/admin/menu-types',
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}${urlMap[entityType]}/${entityId}/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json() as { imagePath: string };
      onUploaded(data.imagePath);
    } catch {
      // upload failed silently
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onUploaded(urlValue.trim());
      setUrlValue('');
    }
  };

  const handleClear = () => {
    onUploaded('');
    setUrlValue('');
  };

  const imgUrl = publicUploadUrl(currentPath);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === 'file'
              ? 'bg-[var(--color-app-accent)]/15 text-[var(--color-app-accent)]'
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {t('common.upload')}
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === 'url'
              ? 'bg-[var(--color-app-accent)]/15 text-[var(--color-app-accent)]'
              : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          URL
        </button>
        {currentPath && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {mode === 'file' ? (
        <div className="flex items-center gap-3">
          <div
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-800 border border-[var(--color-border)] cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {imgUrl ? (
              <img src={imgUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="w-6 h-6 text-stone-600" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)] transition"
          >
            <Upload className="w-3.5 h-3.5" />
            {currentPath ? t('common.change') : t('common.upload')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlValue.trim()}
            className="px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)] transition disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      )}

      {currentPath && mode === 'file' && (
        <p className="text-xs text-stone-500 truncate">{currentPath}</p>
      )}
    </div>
  );
}
