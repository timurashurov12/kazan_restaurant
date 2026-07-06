import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, LogOut, LayoutGrid, List, Package, Globe, Settings } from 'lucide-react';
import { I18nProvider, useTranslations } from '@/i18n';

function getToken(): string | null {
  return localStorage.getItem('kazan-admin-token');
}

function AdminLayoutInner() {
  const location = useLocation();
  const { t } = useTranslations();
  const token = getToken();

  if (!token) return <Navigate to="/admin/login" replace />;

  const NAV_ITEMS = [
    { path: '/admin/menu-types', label: t('admin.nav.menuTypes'), icon: LayoutGrid },
    { path: '/admin/categories', label: t('admin.nav.categories'), icon: List },
    { path: '/admin/menu-items', label: t('admin.nav.menuItems'), icon: Package },
    { path: '/admin/languages', label: t('admin.nav.languages'), icon: Globe },
    { path: '/admin/settings', label: t('admin.nav.settings'), icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('kazan-admin-token');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-app-bg)' }}>
      <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-app-panel)] hidden md:flex flex-col">
        <div className="px-4 py-4 border-b border-[var(--color-border)]">
          <Link to="/admin" className="flex items-center gap-2 text-stone-100 font-semibold">
            <UtensilsCrossed className="h-5 w-5 text-[var(--color-app-accent)]" />
            Kazan Admin
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-[var(--color-app-accent)]/15 text-[var(--color-app-accent)]'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-400 hover:text-red-400 hover:bg-red-500/10 w-full transition"
          >
            <LogOut className="h-4 w-4" />
            {t('admin.nav.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <I18nProvider forceLocale="ru">
      <AdminLayoutInner />
    </I18nProvider>
  );
}
