import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { testProducts } from '../test/catalog-fixtures.js';
import ProductCard from './ProductCard.jsx';
import ProductGrid from './ProductGrid.jsx';

let originalFetch;

function apiProduct(product) {
  return {
    id: product.id,
    name: product.nombre,
    price: product.precio,
    image: product.src,
    category: product.categoria,
    is_offer: product.oferta,
  };
}

function stubCatalogFetch(products = testProducts) {
  globalThis.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ count: products.length, next: null, previous: null, results: products.map(apiProduct) }),
  }));
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  globalThis.fetch = originalFetch;
});

beforeEach(() => {
  originalFetch = globalThis.fetch;
  stubCatalogFetch();
});

describe('pruebas de componentes de catálogo con Jasmine y Karma', () => {
  it('renderiza los datos del producto recibido por props', () => {
    render(<ProductCard producto={testProducts[0]} />);

    expect(screen.getByRole('heading', { name: testProducts[0].nombre })).toBeTruthy();
    expect(screen.getByText('$1.000')).toBeTruthy();
  });

  it('muestra la insignia de oferta recibida desde la API', () => {
    render(<ProductCard producto={testProducts[1]} />);

    expect(screen.getByText('En oferta')).toBeTruthy();
  });

  it('deshabilita la compra hasta que la API ofrezca carrito y pedidos', () => {
    render(<ProductCard producto={testProducts[0]} />);

    expect(screen.getByRole('button', { name: /compras no disponibles/i }).disabled).toBeTrue();
    expect(localStorage.length).toBe(0);
  });

  it('carga el catálogo desde la API', async () => {
    render(<ProductGrid />);

    await waitFor(() => expect(screen.getAllByRole('article').length).toBe(testProducts.length));
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('filtra los productos remotos al cambiar de categoría', async () => {
    render(<ProductGrid />);
    await waitFor(() => expect(screen.getAllByRole('article').length).toBe(testProducts.length));
    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por categoría/i }), {
      target: { value: 'Medicamentos' },
    });

    expect(screen.getAllByRole('article').length).toBe(1);
    expect(screen.getByText('Paracetamol 500 mg')).toBeTruthy();
  });

  it('busca en el catálogo API ignorando mayúsculas y tildes', async () => {
    render(<ProductGrid />);
    await waitFor(() => expect(screen.getAllByRole('article').length).toBe(testProducts.length));
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'PANAL' },
    });

    expect(screen.getAllByRole('article').length).toBe(1);
  });

  it('muestra un estado vacío cuando la búsqueda no coincide', async () => {
    render(<ProductGrid />);
    await waitFor(() => expect(screen.getAllByRole('article').length).toBe(testProducts.length));
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'producto inexistente' },
    });

    expect(screen.getByText(/no se encontraron productos/i)).toBeTruthy();
    expect(screen.queryAllByRole('article').length).toBe(0);
  });
});
