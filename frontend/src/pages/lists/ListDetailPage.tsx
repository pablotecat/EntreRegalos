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
