import { createContext, useContext, useCallback } from 'react';
import { useLocale } from '@/context/LocaleContext';

const translationModules = import.meta.glob('./**/*.json', { eager: true });

const translations: Record<string, any> = {};
for (const [filePath, module] of Object.entries(translationModules)) {
  const match = filePath.match(/\.\/(\w+)\.json$/);
  if (match) {
    translations[match[1]] = (module as { default: any }).default;
  }
}

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K }[keyof T & string]
  : never;

type TranslationKey = NestedKeyOf<typeof translations.ru>;

function getNestedValue(obj: Record<string, any>, path: string): string {
  const result = path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);
  return typeof result === 'string' ? result : path;
}

interface I18nContextType {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  forceLocale?: string;
}

export function I18nProvider({ children, forceLocale }: I18nProviderProps) {
  const { locale } = useLocale();
  const effectiveLocale = forceLocale || locale;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const langCode = effectiveLocale.split('-')[0];
      const dict = translations[langCode] || translations.ru || {};
      let value = getNestedValue(dict, key);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
        });
      }
      return value;
    },
    [effectiveLocale]
  );

  return <I18nContext.Provider value={{ t }}>{children}</I18nContext.Provider>;
}

export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslations must be used within I18nProvider');
  return ctx;
}
