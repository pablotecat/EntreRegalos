import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../types';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validacion = useQuery({
    queryKey: ['reset-password', token],
    queryFn: () => authApi.validateResetToken(token),
    enabled: !!token,
    retry: false,
  });

  const resetPassword = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => navigate('/login'),
    onError: (err: unknown) => {
      const apiError = err as ApiError;
      setError(Array.isArray(apiError.message) ? apiError.message[0] : apiError.message);
    },
  });

  useEffect(() => {
    setError('');
  }, [password, confirmPassword]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    resetPassword.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Restablecer contraseña</h2>
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
          Necesitas un enlace de reseteo válido para continuar.
        </p>
        <Link to="/login" className="text-sm text-indigo-600 hover:underline text-center">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  if (validacion.isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Restablecer contraseña</h2>
        <p className="text-sm text-gray-500">Verificando enlace...</p>
      </div>
    );
  }

  if (validacion.isError) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Restablecer contraseña</h2>
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
          El enlace ha expirado o ya ha sido utilizado.
        </p>
        <Link to="/login" className="text-sm text-indigo-600 hover:underline text-center">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-800">Restablecer contraseña</h2>
      <p className="text-sm text-gray-500">
        Establece una nueva contraseña para <span className="font-medium text-gray-700">@{validacion.data?.username}</span>.
      </p>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
      <Input
        label="Nueva contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mínimo 8 caracteres"
        required
      />
      <Input
        label="Repetir contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Repite la contraseña"
        required
      />
      <Button type="submit" cargando={resetPassword.isPending} className="w-full">
        Guardar contraseña
      </Button>
      <p className="text-sm text-center text-gray-500">
        ¿Recuerdas tu contraseña?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
