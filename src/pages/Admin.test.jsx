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
  it('indica los productos en oferta en la lista administrativa', async () => {
    const user = userEvent.setup();
    render(<Admin />);

    await user.click(screen.getByRole('button', { name: /^productos$/i }));

    expect(screen.getAllByText('En oferta')).toHaveLength(3);
  });

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
    await user.click(screen.getByRole('checkbox', { name: /producto en oferta/i }));
    await user.click(screen.getByRole('button', { name: /guardar producto/i }));

    expect(JSON.parse(localStorage.getItem('productos'))).toContainEqual(expect.objectContaining({
      nombre: 'Producto de prueba',
      precio: 2500,
      categoria: 'Pruebas',
      oferta: true,
    }));

    const productRow = screen.getByRole('row', { name: /producto de prueba/i });
    await user.click(within(productRow).getByRole('button', { name: /editar/i }));
    expect(screen.queryByLabelText(/imagen/i)).not.toBeInTheDocument();
    const nameInput = screen.getByLabelText(/nombre/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Producto actualizado');
    await user.click(screen.getByRole('button', { name: /guardar producto/i }));

    expect(JSON.parse(localStorage.getItem('productos'))).toContainEqual(expect.objectContaining({
      nombre: 'Producto actualizado',
      src: '/media/prueba.png',
    }));

    const updatedProductRow = screen.getByRole('row', { name: /producto actualizado/i });
    await user.click(within(updatedProductRow).getByRole('button', { name: /eliminar/i }));
    expect(JSON.parse(localStorage.getItem('productos'))).not.toContainEqual(expect.objectContaining({
      nombre: 'Producto actualizado',
    }));
  });

  it('permite al moderador editar usuarios y productos, sin poder asignar el rol admin', async () => {
    const user = userEvent.setup();
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'mod@duoc.cl', run: '99999999K' }));
    localStorage.setItem('usuarios', JSON.stringify([
      { correo: 'admin@duoc.cl', run: '11111111K', contrasena: 'Admin123', rol: 'admin' },
      { correo: 'mod@duoc.cl', run: '99999999K', contrasena: 'Moderador1', rol: 'moderador' },
      { correo: 'juan@duoc.cl', run: '12345678K', contrasena: 'abcd', rol: 'usuario' },
    ]));
    render(<Admin />);

    await user.click(screen.getByRole('button', { name: /^usuarios$/i }));
    expect(screen.queryByText('admin@duoc.cl')).not.toBeInTheDocument();
    await user.click(within(screen.getByRole('row', { name: /juan@duoc\.cl/i })).getByRole('button', { name: /editar/i }));
    expect(screen.getByRole('option', { name: 'Admin' })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText(/^rol$/i), 'moderador');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));
    expect(JSON.parse(localStorage.getItem('usuarios'))).toContainEqual(expect.objectContaining({
      correo: 'juan@duoc.cl',
      rol: 'moderador',
    }));

    await user.click(screen.getByRole('button', { name: /^productos$/i }));
    await user.click(screen.getByRole('button', { name: /crear producto/i }));
    await user.type(screen.getByLabelText(/nombre/i), 'Producto de moderador');
    await user.type(screen.getByLabelText(/precio/i), '1800');
    await user.type(screen.getByLabelText(/categoría/i), 'Pruebas');
    await user.type(screen.getByLabelText(/imagen/i), '/media/moderador.png');
    await user.click(screen.getByRole('button', { name: /guardar producto/i }));
    expect(JSON.parse(localStorage.getItem('productos'))).toContainEqual(expect.objectContaining({
      nombre: 'Producto de moderador',
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
    expect(screen.getByText('admin2@duoc.cl')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /editar/i })[1]);

    const runInput = screen.getByLabelText(/run/i);
    await user.clear(runInput);
    await user.type(runInput, '87654321K');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(JSON.parse(localStorage.getItem('usuarios'))[1].run).toBe('87654321K');

    await user.click(screen.getAllByRole('button', { name: /editar/i })[1]);
    await user.selectOptions(screen.getByLabelText(/^rol$/i), 'moderador');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));
    expect(JSON.parse(localStorage.getItem('usuarios'))[1].rol).toBe('moderador');

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
