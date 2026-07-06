import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLanguages } from '@/lib/api';

const STORAGE_KEY = 'kazan-locale';
const SELECTED_KEY = 'kazan-locale-selected';

function hasSelectedLocale(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SELECTED_KEY) === 'true';
}

type LocaleContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  resetLocale: () => void;
  hasSelected: boolean;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === 'undefined') return 'ru';
    return localStorage.getItem(STORAGE_KEY) || navigator.language?.slice(0, 2) || 'ru';
  });
  const [hasSelected, setHasSelected] = useState(hasSelectedLocale);

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    if (!languages.length) return;
    if (languages.some((l) => l.code === locale)) return;
    setLocaleState(languages[0].code);
  }, [languages, locale]);

  const setLocale = (next: string) => {
    const normalized = next.trim();
    if (!normalized) return;
    if (languages.length && !languages.some((l) => l.code === normalized)) return;
    setLocaleState(normalized);
    localStorage.setItem(SELECTED_KEY, 'true');
    setHasSelected(true);
  };

  const resetLocale = () => {
    localStorage.removeItem(SELECTED_KEY);
    setHasSelected(false);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, resetLocale, hasSelected }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
