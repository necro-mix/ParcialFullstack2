import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testProducts } from '../test/catalog-fixtures';
import ProductGrid from './ProductGrid';

const asApiProducts = (products) => products.map((product) => ({
  id: product.id,
  name: product.nombre,
  price: product.precio,
  image: product.src,
  category: product.categoria,
  is_offer: product.oferta,
}));

const apiResponse = (products) => ({
  ok: true,
  status: 200,
  json: async () => ({ count: products.length, next: null, results: asApiProducts(products) }),
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(apiResponse(testProducts)));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ProductGrid', () => {
  it('carga el catálogo desde la API', async () => {
    render(<ProductGrid />);

    expect(await screen.findAllByRole('article')).toHaveLength(testProducts.length);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/products\/$/),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('actualiza el catálogo al recibir un evento de cambio de productos', async () => {
    render(<ProductGrid />);
    await screen.findByRole('heading', { name: 'Paracetamol 500 mg' });
    fetch.mockResolvedValueOnce(apiResponse([
      { id: 99, nombre: 'Producto actualizado', precio: 1000, categoria: 'Pruebas', src: '/media/prueba.png', oferta: false },
    ]));

    fireEvent(window, new Event('productschange'));

    expect(await screen.findByRole('heading', { name: 'Producto actualizado' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Paracetamol 500 mg' })).not.toBeInTheDocument();
  });

  it('muestra el título destacado y los productos en oferta desde la API', async () => {
    render(<ProductGrid compact offersOnly />);

    expect(await screen.findByRole('heading', { name: /catálogo de productos destacados/i })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByText('Paracetamol 500 mg')).not.toBeInTheDocument();
  });

  it('filtra por categoría', async () => {
    render(<ProductGrid />);
    await screen.findAllByRole('article');
    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por categoría/i }), {
      target: { value: 'Medicamentos' },
    });

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Paracetamol 500 mg')).toBeInTheDocument();
  });

  it('busca por nombre sin distinguir mayúsculas ni tildes', async () => {
    render(<ProductGrid />);
    await screen.findAllByRole('article');
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'PANAL' },
    });

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.queryByText('Paracetamol 500 mg')).not.toBeInTheDocument();
  });

  it('informa cuando la búsqueda no encuentra productos', async () => {
    render(<ProductGrid />);
    await screen.findAllByRole('article');
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'producto inexistente' },
    });

    expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('desplaza la vista al catálogo al activar Buscar', async () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({ scrollIntoView });
    render(<ProductGrid />);

    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('no persiste ni simula un carrito que la API todavía no ofrece', async () => {
    render(<ProductGrid />);

    const purchaseButtons = await screen.findAllByRole('button', { name: /compras no disponibles/i });
    expect(purchaseButtons.every((button) => button.disabled)).toBe(true);
    expect(localStorage.length).toBe(0);
  });
});
