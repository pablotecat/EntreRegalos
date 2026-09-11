import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('UI component Vitest - TEST-040: Button', () => {
  it('conserva props y bloquea clics durante carga o disabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button type="submit" className="w-full" onClick={onClick}>Guardar</Button>);
    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('w-full');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<Button cargando disabled={false} onClick={onClick}>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Cargando...' })).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<Button disabled onClick={onClick}>Guardar</Button>);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<Button disabled={false} onClick={onClick}>Guardar</Button>);
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('muestra carga y queda deshabilitado sin recibir disabled', () => {
    render(<Button cargando>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Cargando...' })).toBeDisabled();
  });

  it.each([
    [undefined, 'bg-indigo-600'],
    ['primary', 'bg-indigo-600'],
    ['secondary', 'bg-gray-200'],
    ['danger', 'bg-red-600'],
  ] as const)('aplica la variante %s', (variante, className) => {
    render(<Button variante={variante}>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveClass(className);
  });
});
