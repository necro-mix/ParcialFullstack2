import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from '../components/Layout';
import { testProducts } from '../test/catalog-fixtures';
import Home from './Home';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      count: testProducts.length,
      next: null,
      previous: null,
      results: testProducts.map((product) => ({
        id: product.id,
        name: product.nombre,
        price: product.precio,
        image: product.src,
        category: product.categoria,
        is_offer: product.oferta,
      })),
    }),
  }));
});

afterEach(() => vi.unstubAllGlobals());

describe('Home', () => {
  it('carga el catálogo remoto y no simula carrito sin endpoint API', async () => {
    render(
      <MemoryRouter>
        <Layout><Home /></Layout>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Paracetamol 500 mg' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /compras no disponibles/i })[0]).toBeDisabled();
    expect(screen.getByRole('status', { name: /carrito no disponible/i })).toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });
});
