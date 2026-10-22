import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { productos } from '../data';
import ProductCard from './ProductCard';
import ProductGrid from './ProductGrid';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('pruebas de componentes de catálogo con Jasmine y Karma', () => {
  it('renderiza el nombre del producto recibido por props', () => {
    render(<ProductCard producto={productos[0]} />);

    expect(screen.getByRole('heading', { name: productos[0].nombre })).toBeTruthy();
  });

  it('formatea el precio del producto para pesos chilenos', () => {
    render(<ProductCard producto={productos[0]} />);

    expect(screen.getByText('$15.000')).toBeTruthy();
  });

  it('muestra la insignia de oferta cuando el producto está marcado', () => {
    render(<ProductCard producto={{ ...productos[0], oferta: true }} />);

    expect(screen.getByText('En oferta')).toBeTruthy();
  });

  it('no muestra la insignia en productos sin oferta', () => {
    render(<ProductCard producto={{ ...productos[0], oferta: false }} />);

    expect(screen.queryByText('En oferta')).toBeNull();
  });

  it('no agrega el producto si no hay sesión activa', () => {
    const onAdded = jasmine.createSpy('onAdded');
    render(<ProductCard producto={productos[0]} onAdded={onAdded} />);
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));

    expect(onAdded).not.toHaveBeenCalled();
    expect(localStorage.getItem('carrito_usuario@ejemplo.com')).toBeNull();
  });

  it('guarda el producto y notifica al componente padre con sesión activa', () => {
    const onAdded = jasmine.createSpy('onAdded');
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'usuario@ejemplo.com' }));
    render(<ProductCard producto={productos[0]} onAdded={onAdded} />);
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));

    expect(JSON.parse(localStorage.getItem('carrito_usuario@ejemplo.com'))).toEqual([productos[0]]);
    expect(onAdded).toHaveBeenCalledOnceWith(productos[0]);
  });

  it('presenta todos los productos al abrir el catálogo', () => {
    render(<ProductGrid />);

    expect(screen.getAllByRole('article').length).toBe(productos.length);
  });

  it('filtra los productos al cambiar la categoría', () => {
    render(<ProductGrid />);
    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por categoría/i }), {
      target: { value: 'Medicamentos' },
    });

    expect(screen.getAllByRole('article').length).toBe(2);
    expect(screen.getByText('Paracetamol 500 mg')).toBeTruthy();
  });

  it('busca ignorando mayúsculas y tildes', () => {
    render(<ProductGrid />);
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'PANAL' },
    });

    expect(screen.getAllByRole('article').length).toBe(2);
    expect(screen.queryByText('Paracetamol 500 mg')).toBeNull();
  });

  it('muestra un estado vacío cuando la búsqueda no tiene coincidencias', () => {
    render(<ProductGrid />);
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'producto inexistente' },
    });

    expect(screen.getByText(/no se encontraron productos/i)).toBeTruthy();
    expect(screen.queryAllByRole('article').length).toBe(0);
  });
});
