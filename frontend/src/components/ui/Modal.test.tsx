import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Modal } from './Modal';

describe('UI component Vitest - TEST-042: Modal', () => {
  it('renderiza al abrir, llama onCerrar y desaparece al recibir abierto=false', () => {
    const onCerrar = vi.fn();
    const { container, rerender } = render(
      <Modal abierto={false} titulo="Nueva lista" onCerrar={onCerrar}>Contenido</Modal>,
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();

    rerender(<Modal abierto titulo="Nueva lista" onCerrar={onCerrar}>Contenido</Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Nueva lista' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('heading', { name: 'Nueva lista' })).toBeVisible();
    expect(within(dialog).getByText('Contenido')).toBeVisible();
    const closeButton = within(dialog).getByRole('button', { name: 'Cerrar' });
    expect(closeButton).toHaveAttribute('type', 'button');
    fireEvent.click(closeButton);
    expect(onCerrar).toHaveBeenCalledOnce();

    rerender(<Modal abierto={false} titulo="Nueva lista" onCerrar={onCerrar}>Contenido</Modal>);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledOnce();
  });
});
