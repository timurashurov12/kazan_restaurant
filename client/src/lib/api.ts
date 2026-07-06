const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function publicUploadUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  const trimmed = imagePath.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_BASE.replace(/\/$/, '')}${path}`;
}

export async function fetchMenuTypes(locale: string) {
  const res = await fetch(`${API_BASE}/menu-types?locale=${encodeURIComponent(locale)}`);
  if (!res.ok) throw new Error('Failed to fetch menu types');
  return res.json() as Promise<
    { id: string; code: string; name: string; sortOrder: number; imagePath: string | null }[]
  >;
}

export async function fetchMenu(menuTypeId: string, locale: string) {
  const res = await fetch(
    `${API_BASE}/menu?menuTypeId=${encodeURIComponent(menuTypeId)}&locale=${encodeURIComponent(locale)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json() as Promise<
    {
      id: string;
      name: string;
      description: string | null;
      imagePath: string | null;
      items: MenuItemDto[];
    }[]
  >;
}

export type MenuItemDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  weightOrVolume: string | null;
  imagePath: string | null;
};

export type CategoryDto = {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
};

export async function fetchCategories(menuTypeId: string, locale: string) {
  const res = await fetch(
    `${API_BASE}/menu/${encodeURIComponent(menuTypeId)}/categories?locale=${encodeURIComponent(locale)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json() as Promise<CategoryDto[]>;
}

export async function fetchCategoryItems(categoryId: string, locale: string) {
  const res = await fetch(
    `${API_BASE}/menu/categories/${encodeURIComponent(categoryId)}/items?locale=${encodeURIComponent(locale)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch category items');
  return res.json() as Promise<MenuItemDto[]>;
}

export async function fetchLanguages() {
  const res = await fetch(`${API_BASE}/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json() as Promise<{ id: string; code: string; name: string | null }[]>;
}

export async function fetchSiteSettings() {
  const res = await fetch(`${API_BASE}/site-settings`);
  if (!res.ok) throw new Error('Failed to fetch site settings');
  return res.json() as Promise<{
    logoPath: string | null;
    footerText: string | null;
    siteName: string | null;
    contactText: string | null;
  }>;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('kazan-admin-token');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function translateMenuItem(menuItemId: string) {
  const res = await fetch(`${API_BASE}/admin/translate/menu-item`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ menuItemId }),
  });
  if (!res.ok) throw new Error('Translation failed');
  return res.json() as Promise<{ translated: number; locales: string[] }>;
}

export async function translateCategory(categoryId: string) {
  const res = await fetch(`${API_BASE}/admin/translate/category`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ categoryId }),
  });
  if (!res.ok) throw new Error('Translation failed');
  return res.json() as Promise<{ translated: number; locales: string[] }>;
}

export async function translateMenuType(menuTypeId: string) {
  const res = await fetch(`${API_BASE}/admin/translate/menu-type`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ menuTypeId }),
  });
  if (!res.ok) throw new Error('Translation failed');
  return res.json() as Promise<{ translated: number; locales: string[] }>;
}

export async function translateI18nFile(code: string, sourceLocale: string = 'ru') {
  const res = await fetch(`${API_BASE}/admin/languages/translate/${code}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ sourceLocale }),
  });
  if (!res.ok) throw new Error('Translation failed');
  return res.json() as Promise<{ success: boolean; code: string }>;
}
