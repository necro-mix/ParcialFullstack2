import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Admin from './Admin';

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'admin@duoc.cl', run: '11111111K' }));
  localStorage.setItem('usuarios', JSON.stringify([
    { correo: 'admin@duoc.cl', run: '11111111K', contrasena: 'Admin123', rol: 'admin' },
    { correo: 'juan@duoc.cl', run: '12345678K', contrasena: 'abcd', rol: 'usuario' },
    { correo: 'admin2@duoc.cl', run: '11111811K', contrasena: 'semen', rol: 'admin' }]));
});

describe('Admin', () => {
  it('permite a un administrador crear, editar y eliminar productos', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Admin />);

    await user.click(screen.getByRole('button', { name: /^productos$/i }));
    await user.click(screen.getByRole('button', { name: /crear producto/i }));
    await user.type(screen.getByLabelText(/nombre/i), 'Producto de prueba');
    await user.type(screen.getByLabelText(/precio/i), '2500');
    await user.type(screen.getByLabelText(/categoría/i), 'Pruebas');
    await user.type(screen.getByLabelText(/imagen/i), '/media/prueba.png');
    await user.click(screen.getByRole('button', { name: /guardar producto/i }));

    expect(JSON.parse(localStorage.getItem('productos'))).toContainEqual(expect.objectContaining({
      nombre: 'Producto de prueba',
      precio: 2500,
      categoria: 'Pruebas',
    }));

    const productRow = screen.getByRole('row', { name: /producto de prueba/i });
    await user.click(within(productRow).getByRole('button', { name: /editar/i }));
    const nameInput = screen.getByLabelText(/nombre/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Producto actualizado');
    await user.click(screen.getByRole('button', { name: /guardar producto/i }));

    expect(JSON.parse(localStorage.getItem('productos'))).toContainEqual(expect.objectContaining({
      nombre: 'Producto actualizado',
    }));

    const updatedProductRow = screen.getByRole('row', { name: /producto actualizado/i });
    await user.click(within(updatedProductRow).getByRole('button', { name: /eliminar/i }));
    expect(JSON.parse(localStorage.getItem('productos'))).not.toContainEqual(expect.objectContaining({
      nombre: 'Producto actualizado',
    }));
  });

  it('no muestra el panel administrativo a un usuario sin rol admin', () => {
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'juan@duoc.cl', run: '12345678K' }));
    render(<Admin />);

    expect(screen.getByRole('heading', { name: /acceso denied/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^productos$/i })).not.toBeInTheDocument();
  });

  it('permite editar el usuario y guardar cambios de permisos', async () => {
    const user = userEvent.setup();
    render(<Admin />);

    await user.click(screen.getByRole('button', { name: /usuarios/i }));
    await user.click(screen.getAllByRole('button', { name: /editar/i })[1]);

    const runInput = screen.getByLabelText(/run/i);
    await user.clear(runInput);
    await user.type(runInput, '87654321K');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(JSON.parse(localStorage.getItem('usuarios'))[1].run).toBe('87654321K');

    await user.click(screen.getByRole('button', { name: /permisos/i }));
    await user.selectOptions(screen.getByLabelText(/selecciona un usuario/i), 'juan@duoc.cl');
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    await user.click(screen.getByLabelText(/acceso admin/i));
    await user.click(screen.getByLabelText(/editar perfil/i));
    await user.click(screen.getByRole('button', { name: /guardar permisos/i }));

    const permissions = JSON.parse(localStorage.getItem('permisos_juan@duoc.cl'));
    expect(permissions['acceso-admin']).toBe(true);
    expect(permissions['editar-perfil']).toBe(false);
    expect(permissions['ver-productos']).toBe(true);
    expect(permissions['ver-historial']).toBe(false);
  });
});
