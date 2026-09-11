import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('UI component Vitest - TEST-041: Input', () => {
  it('asocia etiquetas con ids unicos y conserva ref y props nativas', () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<>
      <Input label="Nombre" ref={ref} name="name" required className="w-full" onChange={onChange} />
      <Input label="Apellido" />
    </>);
    const input = screen.getByRole('textbox', { name: 'Nombre' });
    expect(screen.getByLabelText('Nombre')).toBe(input);
    expect(input.id).not.toBe(screen.getByLabelText('Apellido').id);
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'name');
    expect(input).toBeRequired();
    expect(input).toHaveClass('w-full', 'border-gray-300');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
    fireEvent.change(input, { target: { value: 'Ana' } });
    expect(input).toHaveValue('Ana');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('asocia el error sin perder id ni descripciones o aria-invalid explicitos', () => {
    const { rerender } = render(<>
      <p id="help">Ayuda</p>
      <Input id="name" label="Nombre" error="Dato invalido" aria-describedby="help" />
    </>);
    const input = screen.getByLabelText('Nombre');
    expect(screen.getByText('Nombre')).toBeVisible();
    expect(screen.getByText('Dato invalido')).toBeVisible();
    expect(input).toHaveAttribute('id', 'name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Ayuda Dato invalido');
    expect(input).toHaveClass('border-red-500');

    rerender(<>
      <p id="help">Ayuda</p>
      <Input id="name" label="Nombre" error="Dato invalido" aria-invalid={false} />
    </>);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAccessibleDescription('Dato invalido');

    rerender(<>
      <p id="help">Ayuda</p>
      <Input id="name" label="Nombre" aria-describedby="help" />
    </>);
    expect(screen.getByLabelText('Nombre')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-describedby', 'help');
    expect(screen.queryByText('Dato invalido')).not.toBeInTheDocument();
  });
});
