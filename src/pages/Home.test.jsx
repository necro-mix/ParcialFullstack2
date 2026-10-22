import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Layout from '../components/Layout';
import Home from './Home';

describe('Home', () => {
  it('agrega productos sin romper Inicio y sincroniza el contador del carrito', async () => {
    const user = userEvent.setup();
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'usuario@ejemplo.com' }));
    render(
      <MemoryRouter>
        <Layout><Home /></Layout>
      </MemoryRouter>
    );

    await user.click(screen.getAllByRole('button', { name: /añadir al carrito/i })[0]);

    expect(await screen.findByRole('link', { name: /mi carrito, 1 productos/i })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('carrito_usuario@ejemplo.com'))).toHaveLength(1);
  });
});
