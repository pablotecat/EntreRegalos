# Ejecutar desde: EntreRegalos/frontend/

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
          const apiError = err as unknown as ApiError;
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
          const apiError = err as unknown as ApiError;
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

echo "✅ LoginPage y RegisterPage actualizados correctamente"
