# Ejecutar desde: EntreRegalos/frontend/

# ── Estructura de carpetas ────────────────────────────────────────
mkdir -p src/{api,components/{ui,layout},hooks,pages/{auth,lists},store,types,utils}

# ── Tipos globales ────────────────────────────────────────────────
cat > src/types/index.ts << 'EOF'
export type Role = 'ADMIN' | 'USER';
export type Visibility = 'PUBLIC' | 'PRIVATE';

export interface User {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  order: number;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  name: string;
  visibility: Visibility;
  ownerId: string;
  owner?: Pick<User, 'id' | 'username'>;
  items?: Item[];
  _count?: { items: number };
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  token: string;
  reference?: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  invitationUrl?: string;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}
EOF

# ── Cliente HTTP ──────────────────────────────────────────────────
cat > src/api/client.ts << 'EOF'
import { ApiError } from '../types';

const BASE_URL = '/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      message: 'Error de red',
      statusCode: res.status,
    }));
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
EOF

# ── API por dominio ───────────────────────────────────────────────
cat > src/api/auth.api.ts << 'EOF'
import { User } from '../types';
import { api } from './client';

export interface LoginPayload { username: string; password: string; }
export interface RegisterPayload { invitationToken: string; username: string; password: string; }
export interface TokenResponse { accessToken: string; }

export const authApi = {
  login: (data: LoginPayload) => api.post<TokenResponse>('/auth/login', data),
  register: (data: RegisterPayload) => api.post<TokenResponse>('/auth/register', data),
  refresh: () => api.post<TokenResponse>('/auth/refresh'),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
};
EOF

cat > src/api/lists.api.ts << 'EOF'
import { Item, List } from '../types';
import { api } from './client';

export interface CreateListPayload { name: string; visibility?: 'PUBLIC' | 'PRIVATE'; }
export interface UpdateListPayload { name?: string; visibility?: 'PUBLIC' | 'PRIVATE'; }
export interface CreateItemPayload { name: string; description?: string; }
export interface UpdateItemPayload { name?: string; description?: string; }

export const listsApi = {
  findMine: () => api.get<List[]>('/lists'),
  findPublic: () => api.get<List[]>('/lists/public'),
  findById: (id: string) => api.get<List>(`/lists/${id}`),
  create: (data: CreateListPayload) => api.post<List>('/lists', data),
  update: (id: string, data: UpdateListPayload) => api.patch<List>(`/lists/${id}`, data),
  delete: (id: string) => api.delete<void>(`/lists/${id}`),

  createItem: (listId: string, data: CreateItemPayload) =>
    api.post<Item>(`/lists/${listId}/items`, data),
  updateItem: (listId: string, itemId: string, data: UpdateItemPayload) =>
    api.patch<Item>(`/lists/${listId}/items/${itemId}`, data),
  deleteItem: (listId: string, itemId: string) =>
    api.delete<void>(`/lists/${listId}/items/${itemId}`),
};
EOF

cat > src/api/invitations.api.ts << 'EOF'
import { Invitation } from '../types';
import { api } from './client';

export const invitationsApi = {
  create: (data: { reference?: string }) => api.post<Invitation & { invitationUrl: string }>('/invitations', data),
  findAll: () => api.get<Invitation[]>('/invitations'),
  validate: (token: string) => api.get<{ valid: true }>(`/invitations/validate?token=${token}`),
};
EOF

cat > src/api/users.api.ts << 'EOF'
import { User } from '../types';
import { api } from './client';

export const usersApi = {
  findAll: () => api.get<User[]>('/users'),
  deactivate: (id: string) => api.patch<User>(`/users/${id}/deactivate`),
  activate: (id: string) => api.patch<User>(`/users/${id}/activate`),
};
EOF

# ── Store de autenticación (Zustand) ──────────────────────────────
cat > src/store/auth.store.ts << 'EOF'
import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),

  setAuth: (user, token) => {
    localStorage.setItem('accessToken', token);
    set({ user, accessToken: token });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null });
  },
}));
EOF

# ── Hooks de datos ────────────────────────────────────────────────
cat > src/hooks/useAuth.ts << 'EOF'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: !!token,
    retry: false,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: async (res) => {
      localStorage.setItem('accessToken', res.accessToken);
      const user = await authApi.me();
      setAuth(user, res.accessToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: async (res) => {
      localStorage.setItem('accessToken', res.accessToken);
      const user = await authApi.me();
      setAuth(user, res.accessToken);
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });
}
EOF

cat > src/hooks/useLists.ts << 'EOF'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateItemPayload, CreateListPayload, listsApi, UpdateListPayload } from '../api/lists.api';

export function useMyLists() {
  return useQuery({ queryKey: ['lists', 'mine'], queryFn: listsApi.findMine });
}

export function usePublicLists() {
  return useQuery({ queryKey: ['lists', 'public'], queryFn: listsApi.findPublic });
}

export function useList(id: string) {
  return useQuery({ queryKey: ['lists', id], queryFn: () => listsApi.findById(id) });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListPayload) => listsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', 'mine'] }),
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListPayload }) =>
      listsApi.update(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['lists', 'mine'] });
      qc.invalidateQueries({ queryKey: ['lists', id] });
    },
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', 'mine'] }),
  });
}

export function useCreateItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemPayload) => listsApi.createItem(listId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}

export function useDeleteItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => listsApi.deleteItem(listId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists', listId] }),
  });
}
EOF

# ── Componentes UI base ───────────────────────────────────────────
cat > src/components/ui/Button.tsx << 'EOF'
import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'danger';
  cargando?: boolean;
}

const clases = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

export function Button({ variante = 'primary', cargando, children, className = '', disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled ?? cargando}
      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${clases[variante]} ${className}`}
    >
      {cargando ? 'Cargando...' : children}
    </button>
  );
}
EOF

cat > src/components/ui/Input.tsx << 'EOF'
import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        ref={ref}
        {...props}
        className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500
          ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
EOF

cat > src/components/ui/Modal.tsx << 'EOF'
import { ReactNode } from 'react';

interface Props {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

export function Modal({ abierto, titulo, onCerrar, children }: Props) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
EOF

cat > src/components/ui/Badge.tsx << 'EOF'
interface Props {
  texto: string;
  variante?: 'green' | 'gray' | 'red' | 'indigo';
}

const clases = {
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

export function Badge({ texto, variante = 'gray' }: Props) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${clases[variante]}`}>
      {texto}
    </span>
  );
}
EOF

# ── Layout ────────────────────────────────────────────────────────
cat > src/components/layout/Navbar.tsx << 'EOF'
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">🎁 EntreRegalos</Link>
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
          to="/descubrir"
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`
          }
        >
          Descubrir
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
EOF

cat > src/components/layout/AppLayout.tsx << 'EOF'
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
EOF

cat > src/components/layout/AuthLayout.tsx << 'EOF'
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">🎁 EntreRegalos</h1>
        <Outlet />
      </div>
    </div>
  );
}
EOF

# ── Guards de rutas ───────────────────────────────────────────────
cat > src/components/layout/RequireAuth.tsx << 'EOF'
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
EOF

cat > src/components/layout/RequireAdmin.tsx << 'EOF'
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export function RequireAdmin() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'ADMIN') return <Navigate to="/listas" replace />;
  return <Outlet />;
}
EOF

# ── Páginas de autenticación ──────────────────────────────────────
cat > src/pages/auth/LoginPage.tsx << 'EOF'
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../types';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    login.mutate(
      { username, password },
      {
        onSuccess: () => navigate('/listas'),
        onError: (err) => {
          const apiError = err as ApiError;
          setError(
            Array.isArray(apiError.message) ? apiError.message[0] : apiError.message,
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-800">Iniciar sesión</h2>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
      <Input
        label="Usuario"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <Button type="submit" cargando={login.isPending} className="w-full">
        Entrar
      </Button>
      <p className="text-sm text-center text-gray-500">
        ¿Tienes una invitación?{' '}
        <Link to="/register" className="text-indigo-600 hover:underline">Regístrate</Link>
      </p>
    </form>
  );
}
EOF

cat > src/pages/auth/RegisterPage.tsx << 'EOF'
import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../types';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const invitationToken = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const register = useRegister();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!invitationToken) {
      setError('Se necesita un token de invitación válido.');
      return;
    }
    register.mutate(
      { invitationToken, username, password },
      {
        onSuccess: () => navigate('/listas'),
        onError: (err) => {
          const apiError = err as ApiError;
          setError(
            Array.isArray(apiError.message) ? apiError.message[0] : apiError.message,
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-800">Crear cuenta</h2>
      {!invitationToken && (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
          Necesitas un enlace de invitación válido para registrarte.
        </p>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
      <Input
        label="Usuario"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="letras, números y _"
        required
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mínimo 8 caracteres"
        required
      />
      <Button type="submit" cargando={register.isPending} className="w-full" disabled={!invitationToken}>
        Registrarse
      </Button>
      <p className="text-sm text-center text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
EOF

# ── Páginas de listas ─────────────────────────────────────────────
cat > src/pages/lists/ListsPage.tsx << 'EOF'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyLists, useCreateList, useDeleteList } from '../../hooks/useLists';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export default function ListsPage() {
  const { data: listas, isLoading } = useMyLists();
  const crearLista = useCreateList();
  const borrarLista = useDeleteList();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [visibilidad, setVisibilidad] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');

  const handleCrear = () => {
    if (!nombre.trim()) return;
    crearLista.mutate(
      { name: nombre.trim(), visibility: visibilidad },
      { onSuccess: () => { setModalAbierto(false); setNombre(''); } },
    );
  };

  if (isLoading) return <p className="text-gray-500">Cargando listas...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis listas</h1>
        <Button onClick={() => setModalAbierto(true)}>+ Nueva lista</Button>
      </div>

      {listas?.length === 0 && (
        <p className="text-gray-500 text-center py-12">Aún no tienes listas. ¡Crea la primera!</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listas?.map((lista) => (
          <div key={lista.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <Link to={`/listas/${lista.id}`} className="font-semibold text-gray-800 hover:text-indigo-600 truncate">
                {lista.name}
              </Link>
              <Badge
                texto={lista.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
                variante={lista.visibility === 'PUBLIC' ? 'indigo' : 'gray'}
              />
            </div>
            <p className="text-sm text-gray-500">{lista._count?.items ?? 0} artículos</p>
            <div className="flex gap-2 mt-auto">
              <Link to={`/listas/${lista.id}`} className="text-sm text-indigo-600 hover:underline">Ver</Link>
              <button
                onClick={() => { if (confirm('¿Borrar esta lista?')) borrarLista.mutate(lista.id); }}
                className="text-sm text-red-500 hover:underline ml-auto"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal abierto={modalAbierto} titulo="Nueva lista" onCerrar={() => setModalAbierto(false)}>
        <div className="flex flex-col gap-4">
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Navidad 2025" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Visibilidad</label>
            <select
              value={visibilidad}
              onChange={(e) => setVisibilidad(e.target.value as 'PRIVATE' | 'PUBLIC')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="PRIVATE">Privada</option>
              <option value="PUBLIC">Pública</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variante="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button onClick={handleCrear} cargando={crearLista.isPending}>Crear</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
EOF

cat > src/pages/lists/ListDetailPage.tsx << 'EOF'
import { useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useList, useCreateItem, useDeleteItem } from '../../hooks/useLists';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export default function ListDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: lista, isLoading } = useList(id);
  const crearItem = useCreateItem(id);
  const borrarItem = useDeleteItem(id);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    crearItem.mutate(
      { name: nombre.trim(), description: descripcion.trim() || undefined },
      { onSuccess: () => { setNombre(''); setDescripcion(''); } },
    );
  };

  if (isLoading) return <p className="text-gray-500">Cargando...</p>;
  if (!lista) return <p className="text-gray-500">Lista no encontrada.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/listas" className="text-sm text-gray-400 hover:text-gray-600">← Mis listas</Link>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{lista.name}</h1>
        <Badge
          texto={lista.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
          variante={lista.visibility === 'PUBLIC' ? 'indigo' : 'gray'}
        />
      </div>

      {/* Formulario añadir ítem */}
      <form onSubmit={handleAddItem} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col gap-3">
        <h2 className="font-semibold text-gray-700">Añadir artículo</h2>
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Auriculares inalámbricos" />
        <Input label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Enlace, color, talla..." />
        <Button type="submit" cargando={crearItem.isPending} className="self-end">Añadir</Button>
      </form>

      {/* Lista de ítems */}
      <ul className="flex flex-col gap-3">
        {lista.items?.length === 0 && (
          <p className="text-gray-400 text-center py-8">La lista está vacía. ¡Añade el primer artículo!</p>
        )}
        {lista.items?.map((item) => (
          <li key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
            </div>
            <button
              onClick={() => { if (confirm('¿Borrar este artículo?')) borrarItem.mutate(item.id); }}
              className="text-red-400 hover:text-red-600 text-sm shrink-0"
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF

cat > src/pages/lists/DiscoverPage.tsx << 'EOF'
import { Link } from 'react-router-dom';
import { usePublicLists } from '../../hooks/useLists';
import { Badge } from '../../components/ui/Badge';

export default function DiscoverPage() {
  const { data: listas, isLoading } = usePublicLists();

  if (isLoading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Descubrir listas públicas</h1>
      {listas?.length === 0 && (
        <p className="text-gray-500 text-center py-12">No hay listas públicas de otros usuarios todavía.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listas?.map((lista) => (
          <div key={lista.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <Link to={`/listas/${lista.id}`} className="font-semibold text-gray-800 hover:text-indigo-600 truncate">
                {lista.name}
              </Link>
              <Badge texto="Pública" variante="indigo" />
            </div>
            <p className="text-sm text-gray-500">
              De <span className="font-medium">@{lista.owner?.username}</span> · {lista._count?.items ?? 0} artículos
            </p>
            <Link to={`/listas/${lista.id}`} className="text-sm text-indigo-600 hover:underline mt-auto">
              Ver lista →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

# ── Página Admin ──────────────────────────────────────────────────
mkdir -p src/pages/admin

cat > src/pages/admin/AdminPage.tsx << 'EOF'
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
import { invitationsApi } from '../../api/invitations.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/auth.store';

export default function AdminPage() {
  const adminId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  const [referencia, setReferencia] = useState('');
  const [urlInvitacion, setUrlInvitacion] = useState('');

  const { data: usuarios } = useQuery({ queryKey: ['users'], queryFn: usersApi.findAll });
  const { data: invitaciones } = useQuery({ queryKey: ['invitations'], queryFn: invitationsApi.findAll });

  const crearInvitacion = useMutation({
    mutationFn: () => invitationsApi.create({ reference: referencia || undefined }),
    onSuccess: (inv) => {
      setUrlInvitacion(inv.invitationUrl ?? '');
      setReferencia('');
      qc.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  const desactivar = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const activar = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold text-gray-800">Panel de administración</h1>

      {/* Invitaciones */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Invitaciones</h2>
        <div className="flex gap-3 mb-4">
          <Input label="Referencia (opcional)" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej. Para Ana" />
          <div className="flex items-end">
            <Button onClick={() => crearInvitacion.mutate()} cargando={crearInvitacion.isPending}>
              Generar invitación
            </Button>
          </div>
        </div>
        {urlInvitacion && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-indigo-700 mb-1">Enlace de invitación generado:</p>
            <p className="text-sm text-indigo-600 break-all">{urlInvitacion}</p>
            <button
              onClick={() => navigator.clipboard.writeText(urlInvitacion)}
              className="text-xs text-indigo-500 hover:underline mt-1"
            >
              Copiar al portapapeles
            </button>
          </div>
        )}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">Referencia</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4">Expira</th>
            </tr>
          </thead>
          <tbody>
            {invitaciones?.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{inv.reference ?? '—'}</td>
                <td className="py-2 pr-4">
                  <Badge
                    texto={inv.used ? 'Usada' : new Date(inv.expiresAt) < new Date() ? 'Expirada' : 'Activa'}
                    variante={inv.used ? 'gray' : new Date(inv.expiresAt) < new Date() ? 'red' : 'green'}
                  />
                </td>
                <td className="py-2 pr-4 text-gray-500">{new Date(inv.expiresAt).toLocaleDateString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Usuarios */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Usuarios</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">Usuario</th>
              <th className="py-2 pr-4">Rol</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios?.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-800">@{u.username}</td>
                <td className="py-2 pr-4">
                  <Badge texto={u.role} variante={u.role === 'ADMIN' ? 'indigo' : 'gray'} />
                </td>
                <td className="py-2 pr-4">
                  <Badge texto={u.isActive ? 'Activo' : 'Inactivo'} variante={u.isActive ? 'green' : 'red'} />
                </td>
                <td className="py-2">
                  {u.id !== adminId && (
                    u.isActive
                      ? <button onClick={() => desactivar.mutate(u.id)} className="text-red-500 hover:underline text-xs">Desactivar</button>
                      : <button onClick={() => activar.mutate(u.id)} className="text-green-600 hover:underline text-xs">Activar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
EOF

# ── Router principal ──────────────────────────────────────────────
cat > src/App.tsx << 'EOF'
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
EOF

echo "✅ Frontend completo generado correctamente"
