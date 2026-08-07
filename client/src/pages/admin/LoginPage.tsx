import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { I18nProvider, useTranslations } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function LoginPageInner() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('admin.login.email')}
          required
          className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100 placeholder:text-stone-500"
        />
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('admin.login.password')}
            required
            className="pr-10 bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100 placeholder:text-stone-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? t('admin.login.signingIn') : t('admin.login.signIn')}
        </Button>
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
