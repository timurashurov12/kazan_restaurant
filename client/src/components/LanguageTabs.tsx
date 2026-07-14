import { useState } from 'react';

type Translation = { locale: string; name: string; description?: string | null };
type Language = { code: string; name: string };

interface LanguageTabsProps {
  languages: Language[];
  translations: Translation[];
  onChange: (translations: Translation[]) => void;
  showDescription?: boolean;
  descriptionLabel?: string;
  nameLabel?: string;
}

export function LanguageTabs({
  languages,
  translations,
  onChange,
  showDescription = false,
  descriptionLabel = 'Описание',
  nameLabel = 'Название',
}: LanguageTabsProps) {
  const [activeTab, setActiveTab] = useState(() => {
    return languages[0]?.code || '';
  });

  const updateField = (locale: string, field: keyof Translation, value: string) => {
    const idx = translations.findIndex((t) => t.locale === locale);
    if (idx >= 0) {
      const next = translations.map((t, i) => (i === idx ? { ...t, [field]: value } : t));
      onChange(next);
    } else {
      onChange([...translations, { locale, name: field === 'name' ? value : '', description: field === 'description' ? value : '' }]);
    }
  };

  const current = translations.find((t) => t.locale === activeTab);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveTab(lang.code)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === lang.code
                ? 'border-[var(--color-app-accent)] text-[var(--color-app-accent)]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">{nameLabel} ({activeTab.toUpperCase()})</label>
          <input
            value={current?.name || ''}
            onChange={(e) => updateField(activeTab, 'name', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
          />
        </div>
        {showDescription && (
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">{descriptionLabel} ({activeTab.toUpperCase()})</label>
            <input
              value={current?.description || ''}
              onChange={(e) => updateField(activeTab, 'description', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}
