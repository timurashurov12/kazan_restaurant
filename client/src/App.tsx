import { Routes, Route, Navigate } from 'react-router-dom';
import { LocaleProvider } from '@/context/LocaleContext';
import { I18nProvider } from '@/i18n';
import { LanguagePicker } from '@/components/LanguagePicker';
import { HomePage } from '@/pages/HomePage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { MenuPage } from '@/pages/MenuPage';
import { LoginPage } from '@/pages/admin/LoginPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { MenuTypesPage } from '@/pages/admin/MenuTypesPage';
import { CategoriesPage as AdminCategoriesPage } from '@/pages/admin/CategoriesPage';
import { MenuItemsPage } from '@/pages/admin/MenuItemsPage';
import { MenuItemFormPage } from '@/pages/admin/MenuItemFormPage';
import { LanguagesPage } from '@/pages/admin/LanguagesPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';

export default function App() {
  return (
    <LocaleProvider>
      <I18nProvider>
        <LanguagePicker />
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu/:menuTypeId" element={<CategoriesPage />} />
        <Route path="/menu/:menuTypeId/category/:categoryId" element={<MenuPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/menu-types" replace />} />
          <Route path="menu-types" element={<MenuTypesPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="menu-items" element={<MenuItemsPage />} />
          <Route path="menu-items/new" element={<MenuItemFormPage />} />
          <Route path="menu-items/:id/edit" element={<MenuItemFormPage />} />
          <Route path="languages" element={<LanguagesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </I18nProvider>
    </LocaleProvider>
  );
}
