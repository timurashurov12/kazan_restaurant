export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function getToken(): string | null {
  return localStorage.getItem('kazan-admin-token');
}

export function headers(includeAuth = true): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (includeAuth && token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function handleErrorResponse(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.message || json.error || 'An error occurred';
  } catch {
    return await res.text();
  }
}
