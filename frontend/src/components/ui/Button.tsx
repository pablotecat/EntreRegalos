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
