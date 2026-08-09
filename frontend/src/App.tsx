import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { RequireAuth } from './components/layout/RequireAuth';
import { RequireAdmin } from './components/layout/RequireAdmin';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ListsPage = lazy(() => import('./pages/lists/ListsPage'));
const ListDetailPage = lazy(() => import('./pages/lists/ListDetailPage'));
const DiscoverPage = lazy(() => import('./pages/lists/DiscoverPage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

function Cargando() {
  return <div className="flex justify-center mt-20 text-gray-400">Cargando...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rutas protegidas */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/listas" element={<ListsPage />} />
            <Route path="/listas/:id" element={<ListDetailPage />} />
            <Route path="/descubrir" element={<DiscoverPage />} />

            {/* Solo admin */}
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        {/* Redireccionamiento raíz */}
        <Route path="/" element={<Navigate to="/listas" replace />} />
        <Route path="*" element={<Navigate to="/listas" replace />} />
      </Routes>
    </Suspense>
  );
}
