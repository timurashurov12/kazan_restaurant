import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { I18nProvider, useTranslations } from '@/i18n';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function LoginPageInner() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('kazan-admin-token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) return <Navigate to="/admin" replace />;
    } catch {}
    localStorage.removeItem('kazan-admin-token');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || t('errors.loginFailed'));
      }
      const data = (await res.json()) as { access_token: string };
      localStorage.setItem('kazan-admin-token', data.access_token);
      navigate('/admin');
      toast.success(t('admin.login.success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)]">
        <img src="/logo.svg" alt="Kazan" className="mx-auto h-12 w-auto" />
        <h1 className="text-xl font-semibold text-stone-100 text-center">{t('admin.login.title')}</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('admin.login.email')}
          required
          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('admin.login.password')}
          required
          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}
        >
          {loading ? t('admin.login.signingIn') : t('admin.login.signIn')}
        </button>
      </form>
    </div>
  );
}

export function LoginPage() {
  return (
    <I18nProvider forceLocale="ru">
      <LoginPageInner />
    </I18nProvider>
  );
}
