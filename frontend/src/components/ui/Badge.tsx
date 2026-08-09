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
