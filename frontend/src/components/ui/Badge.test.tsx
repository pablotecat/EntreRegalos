import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renderiza el texto', () => {
    render(<Badge texto="Pública" />);
    expect(screen.getByText('Pública')).toBeDefined();
  });

  it('aplica la variante green', () => {
    render(<Badge texto="Activo" variante="green" />);
    expect(screen.getByText('Activo').className).toContain('bg-green-100');
  });
});
