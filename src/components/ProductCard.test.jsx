import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { testProducts } from '../test/catalog-fixtures';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('renderiza los datos devueltos por la API', () => {
    render(<ProductCard producto={testProducts[0]} />);

    expect(screen.getByText('Paracetamol 500 mg')).toBeInTheDocument();
    expect(screen.getByText('$1.000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compras no disponibles/i })).toBeDisabled();
  });

  it('muestra la insignia de oferta recibida desde la API', () => {
    render(<ProductCard producto={testProducts[1]} />);

    expect(screen.getByText('En oferta')).toBeInTheDocument();
  });

  it('no persiste el producto localmente mientras el backend no tenga carrito', () => {
    render(<ProductCard producto={testProducts[0]} />);

    expect(localStorage.length).toBe(0);
  });
});
