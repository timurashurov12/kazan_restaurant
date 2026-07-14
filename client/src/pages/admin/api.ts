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

function handleAuthError() {
  localStorage.removeItem('kazan-admin-token');
  window.location.href = '/admin/login';
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    handleAuthError();
    throw new Error('Unauthorized');
  }
  return res;
}

export async function handleErrorResponse(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.message || json.error || 'An error occurred';
  } catch {
    return await res.text();
  }
}
