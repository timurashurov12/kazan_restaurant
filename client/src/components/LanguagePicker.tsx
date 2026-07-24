import { useLocale } from '@/context/LocaleContext';
import { useTranslations } from '@/i18n';
import { useQuery } from '@tanstack/react-query';
import { fetchLanguages } from '@/lib/api';
import { Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function LanguagePicker() {
  const { hasSelected, setLocale } = useLocale();
  const { t } = useTranslations();
  const { pathname } = useLocation();
  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
  });

  if (hasSelected || !languages.length || pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <div className="w-full max-w-sm space-y-6 p-8 text-center animate-in">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-app-accent)]/15 flex items-center justify-center">
            <Globe className="h-8 w-8 text-[var(--color-app-accent)]" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-stone-50 mb-2">{t('languagePicker.title')}</h1>
          <p className="text-sm text-stone-400">{t('languagePicker.subtitle')}</p>
        </div>
        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLocale(lang.code)}
              className="w-full py-3 rounded-xl text-sm font-medium transition border border-[var(--color-border)] bg-[var(--color-app-panel)] text-stone-100 hover:border-[var(--color-app-accent)]/40 hover:bg-[var(--color-app-accent)]/10"
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
