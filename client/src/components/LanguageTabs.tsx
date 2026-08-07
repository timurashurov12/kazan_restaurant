import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const defaultValue = languages[0]?.code || '';

  const updateField = (locale: string, field: keyof Translation, value: string) => {
    const idx = translations.findIndex((t) => t.locale === locale);
    if (idx >= 0) {
      const next = translations.map((t, i) => (i === idx ? { ...t, [field]: value } : t));
      onChange(next);
    } else {
      onChange([...translations, { locale, name: field === 'name' ? value : '', description: field === 'description' ? value : '' }]);
    }
  };

  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList variant="line" className="w-full justify-start">
        {languages.map((lang) => (
          <TabsTrigger key={lang.code} value={lang.code}>{lang.name}</TabsTrigger>
        ))}
      </TabsList>

      {languages.map((lang) => {
        const current = translations.find((t) => t.locale === lang.code);
        return (
          <TabsContent key={lang.code} value={lang.code}>
            <div className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label className="text-stone-400">{nameLabel} ({lang.code.toUpperCase()})</Label>
                <Input
                  value={current?.name || ''}
                  onChange={(e) => updateField(lang.code, 'name', e.target.value)}
                  className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100"
                />
              </div>
              {showDescription && (
                <div className="space-y-2">
                  <Label className="text-stone-400">{descriptionLabel} ({lang.code.toUpperCase()})</Label>
                  <Input
                    value={current?.description || ''}
                    onChange={(e) => updateField(lang.code, 'description', e.target.value)}
                    className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
