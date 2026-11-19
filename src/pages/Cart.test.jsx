import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Cart from './Cart';

describe('Cart', () => {
  it('informa que no hay carrito local mientras la API carezca de ese endpoint', () => {
    render(<MemoryRouter><Cart /></MemoryRouter>);

    expect(screen.getByRole('status')).toHaveTextContent(/backend aún no ofrece endpoints para carrito o checkout/i);
    expect(screen.getByRole('link', { name: /volver al catálogo/i })).toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });
});
