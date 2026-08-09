import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el texto correctamente', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByText('Guardar')).toBeDefined();
  });

  it('muestra "Cargando..." cuando cargando=true', () => {
    render(<Button cargando>Guardar</Button>);
    expect(screen.getByText('Cargando...')).toBeDefined();
  });

  it('está deshabilitado cuando cargando=true', () => {
    render(<Button cargando>Guardar</Button>);
    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });

  it('llama al onClick cuando se hace clic', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Clic</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('aplica la clase de variante danger', () => {
    render(<Button variante="danger">Borrar</Button>);
    expect(screen.getByRole('button').className).toContain('bg-red-600');
  });
});
