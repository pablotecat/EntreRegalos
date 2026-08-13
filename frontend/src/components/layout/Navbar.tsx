import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">EntreRegalos</Link>
      <div className="flex items-center gap-6">
        <NavLink
          to="/listas"
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`
          }
        >
          Mis listas
        </NavLink>
        <NavLink
          to="/amigos"
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`
          }
        >
          Amigos
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            Admin
          </NavLink>
        )}
        <span className="text-sm text-gray-500">@{user?.username}</span>
        <Button variante="secondary" onClick={() => logout.mutate()} cargando={logout.isPending}>
          Cerrar sesión
        </Button>
      </div>
    </nav>
  );
}
