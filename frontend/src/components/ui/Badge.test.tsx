import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('UI component Vitest - TEST-043: Badge', () => {
  it.each([
    [undefined, 'bg-gray-100'],
    ['green', 'bg-green-100'],
    ['gray', 'bg-gray-100'],
    ['red', 'bg-red-100'],
    ['indigo', 'bg-indigo-100'],
  ] as const)('renderiza texto y variante %s', (variante, className) => {
    render(<Badge texto="Activo" variante={variante} />);
    expect(screen.getByText('Activo')).toHaveClass(className);
  });
});
