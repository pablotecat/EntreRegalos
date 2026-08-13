import { Link } from 'react-router-dom';
import { useUsers } from '../../hooks/useAuth';

export default function AmigosPage() {
  const { data: usuarios, isLoading } = useUsers();

  if (isLoading) return <p className="text-gray-500">Cargando amigos...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Amigos</h1>
      {usuarios?.length === 0 && (
        <p className="text-gray-500 text-center py-12">No hay otros usuarios registrados todavía.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {usuarios?.map((usuario) => (
          <Link
            key={usuario.id}
            to={`/amigos/${usuario.id}/listas`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-indigo-200 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
              {usuario.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">@{usuario.username}</p>
              <p className="text-sm text-gray-500">Ver sus listas</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
