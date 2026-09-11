import { useParams, Link } from 'react-router-dom';
import { useUserLists } from '../../hooks/useLists';
import { Badge } from '../../components/ui/Badge';

export default function UserListsPage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const { data: listas, isLoading } = useUserLists(userId);

  if (isLoading) return <p className="text-gray-500">Cargando listas...</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link to="/amigos" className="text-sm text-gray-400 hover:text-gray-600">← Amigos</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Listas de @{listas?.[0]?.owner?.username ?? 'amigo'}
      </h1>
      {listas?.length === 0 && (
        <p className="text-gray-500 text-center py-12">Este usuario no tiene listas públicas.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listas?.map((lista) => (
          <article key={lista.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <Link to={`/listas/${lista.id}`} className="font-semibold text-gray-800 hover:text-indigo-600 truncate">
                {lista.name}
              </Link>
              <Badge texto="Pública" variante="indigo" />
            </div>
            <p className="text-sm text-gray-500">{lista._count?.items ?? 0} artículos</p>
            <Link to={`/listas/${lista.id}`} className="text-sm text-indigo-600 hover:underline mt-auto">
              Ver lista →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
