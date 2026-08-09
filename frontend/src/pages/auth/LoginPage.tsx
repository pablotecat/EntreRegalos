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
