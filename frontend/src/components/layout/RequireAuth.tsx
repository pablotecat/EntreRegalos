import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useMe } from '../../hooks/useAuth';

export function RequireAuth() {
  const token = useAuthStore((s) => s.accessToken);
  const { setAuth } = useAuthStore();
  const { data: user, isLoading } = useMe();

  if (!token) return <Navigate to="/login" replace />;
  if (isLoading) return <div className="flex justify-center mt-20 text-gray-500">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Sincronizar usuario en el store si no estaba
  if (!useAuthStore.getState().user) {
    setAuth(user, token);
  }

  return <Outlet />;
}
