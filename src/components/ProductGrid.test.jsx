import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productos } from '../data';
import ProductGrid from './ProductGrid';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ProductGrid', () => {
  it('muestra el catálogo completo inicialmente', () => {
    render(<ProductGrid />);

    expect(screen.getAllByRole('article')).toHaveLength(productos.length);
  });

  it('actualiza el catálogo al recibir un evento de cambio de productos', () => {
    render(<ProductGrid />);
    localStorage.setItem('productos', JSON.stringify([
      { id: 99, nombre: 'Producto actualizado', precio: 1000, categoria: 'Pruebas', src: '/media/prueba.png' },
    ]));

    fireEvent(window, new Event('productschange'));

    expect(screen.getByRole('heading', { name: 'Producto actualizado' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('muestra el título de catálogo destacado cuando compact está activo', () => {
    render(<ProductGrid compact />);

    expect(screen.getByRole('heading', { name: /catálogo de productos destacados/i })).toBeInTheDocument();
  });

  it('filtra productos por categoría', () => {
    render(<ProductGrid />);
    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por categoría/i }), {
      target: { value: 'Medicamentos' },
    });

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Paracetamol 500 mg')).toBeInTheDocument();
  });

  it('busca por nombre sin distinguir mayúsculas ni tildes', () => {
    render(<ProductGrid />);
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'PANAL' },
    });

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByText('Paracetamol 500 mg')).not.toBeInTheDocument();
  });

  it('informa cuando la búsqueda no encuentra productos', () => {
    render(<ProductGrid />);
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar productos/i }), {
      target: { value: 'producto inexistente' },
    });

    expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('desplaza la vista al catálogo al activar Buscar', () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({ scrollIntoView });
    render(<ProductGrid />);

    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('persiste productos agregados y notifica el cambio de carrito', () => {
    const onCartChange = vi.fn();
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'usuario@ejemplo.com' }));
    render(<ProductGrid onCartChange={onCartChange} />);
    fireEvent.click(screen.getAllByRole('button', { name: /añadir al carrito/i })[0]);

    expect(JSON.parse(localStorage.getItem('carrito_usuario@ejemplo.com'))).toHaveLength(1);
    expect(onCartChange).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent(/agregado al carrito/i);
  });
});
