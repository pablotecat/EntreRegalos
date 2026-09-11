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
          <article key={lista.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
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
          </article>
        ))}
      </div>

      <Modal abierto={modalAbierto} titulo="Nueva lista" onCerrar={() => setModalAbierto(false)}>
        <div className="flex flex-col gap-4">
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Navidad 2025" />
          <div className="flex flex-col gap-1">
            <label htmlFor="list-visibility" className="text-sm font-medium text-gray-700">Visibilidad</label>
            <select
              id="list-visibility"
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
