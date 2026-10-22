import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { productos } from '../data';
import ProductCard from './ProductCard';

const product = productos[0];

describe('ProductCard', () => {
  it('renderiza nombre, precio y acción de añadir', () => {
    render(<ProductCard producto={product} onAdded={() => {}} />);
    expect(screen.getByText(product.nombre)).toBeInTheDocument();
    expect(screen.getByText('$15.000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Añadir al Carrito/i })).toBeInTheDocument();
  });

  it('notifica cuando se agrega un producto', async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'usuario@example.com', run: '12345678K' }));
    render(<ProductCard producto={product} onAdded={onAdded} />);
    await user.click(screen.getByRole('button', { name: /Añadir al Carrito/i }));
    expect(onAdded).toHaveBeenCalledWith(product);
    expect(JSON.parse(localStorage.getItem('carrito_usuario@example.com'))).toHaveLength(1);
  });
});
