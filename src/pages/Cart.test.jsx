import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Cart from './Cart';

describe('Cart', () => {
  it('indica cuáles productos del carrito están en oferta', () => {
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'persona@ejemplo.com' }));
    localStorage.setItem('carrito_persona@ejemplo.com', JSON.stringify([
      { id: 1, nombre: 'Producto en oferta', precio: 1000, src: '/media/oferta.png', oferta: true },
      { id: 2, nombre: 'Producto regular', precio: 2000, src: '/media/regular.png', oferta: false },
    ]));

    render(<MemoryRouter><Cart /></MemoryRouter>);

    expect(screen.getByText('Producto en oferta')).toBeInTheDocument();
    expect(screen.getByText('Producto regular')).toBeInTheDocument();
    expect(screen.getAllByText('En oferta')).toHaveLength(1);
  });
});
