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
  const [resetToken, setResetToken] = useState<string | null>(null);

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

  const generarReset = useMutation({
    mutationFn: (id: string) => usersApi.createPasswordResetToken(id),
    onSuccess: (res) => {
      setResetToken(res.token);
    },
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
        {resetToken && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-700 mb-1">Token de reseteo de contraseña:</p>
            <p className="text-sm text-indigo-600 break-all font-mono">{resetToken}</p>
            <button
              onClick={() => navigator.clipboard.writeText(resetToken)}
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
                  <div className="flex gap-3 items-center">
                    {u.id !== adminId && (
                      u.isActive
                        ? <button onClick={() => desactivar.mutate(u.id)} className="text-red-500 hover:underline text-xs">Desactivar</button>
                        : <button onClick={() => activar.mutate(u.id)} className="text-green-600 hover:underline text-xs">Activar</button>
                    )}
                    <button
                      onClick={() => generarReset.mutate(u.id)}
                      className="text-indigo-600 hover:underline text-xs"
                      disabled={generarReset.isPending}
                    >
                      {generarReset.isPending && generarReset.variables === u.id ? 'Generando...' : 'Resetear contraseña'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
