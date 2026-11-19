import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  apiCreateProduct: vi.fn(),
  apiDeleteProduct: vi.fn(),
  apiGetProducts: vi.fn(),
  apiGetUserPermissions: vi.fn(),
  apiGetUsers: vi.fn(),
  apiSaveUserPermissions: vi.fn(),
  apiSetUserState: vi.fn(),
  apiUpdateProduct: vi.fn(),
  apiUpdateUser: vi.fn(),
}));

vi.mock('../api', () => api);

import Admin from './Admin';
import { testProducts } from '../test/catalog-fixtures';

let serverUsers;
let serverProducts;
let serverPermissions;

const permissionsDefault = {
  'ver-productos': true,
  comprar: true,
  'ver-carrito': true,
  'acceso-admin': false,
  'editar-perfil': true,
  'ver-historial': false,
};

beforeEach(() => {
  localStorage.clear();
  serverUsers = [
    { id: 1, correo: 'admin@duoc.cl', run: '11111111K', rol: 'admin', estado: 'activo' },
    { id: 2, correo: 'juan@duoc.cl', run: '12345678K', rol: 'usuario', estado: 'activo' },
    { id: 3, correo: 'mod@duoc.cl', run: '99999999K', rol: 'moderador', estado: 'activo' },
  ];
  serverProducts = testProducts.map((item) => ({ ...item }));
  serverPermissions = { ...permissionsDefault };
  localStorage.setItem('apiAccessToken', 'admin-token');
  localStorage.setItem('sesionActiva', JSON.stringify(serverUsers[0]));

  api.apiGetUsers.mockImplementation(async () => serverUsers.map((item) => ({ ...item })));
  api.apiGetProducts.mockImplementation(async () => serverProducts.map((item) => ({ ...item })));
  api.apiCreateProduct.mockImplementation(async (product) => {
    const created = { ...product, id: Math.max(...serverProducts.map((item) => item.id)) + 1 };
    serverProducts.push(created);
    return created;
  });
  api.apiUpdateProduct.mockImplementation(async (id, updates) => {
    serverProducts = serverProducts.map((item) => (item.id === id ? { ...item, ...updates } : item));
  });
  api.apiDeleteProduct.mockImplementation(async (id) => {
    serverProducts = serverProducts.filter((item) => item.id !== id);
  });
  api.apiUpdateUser.mockImplementation(async (id, updates) => {
    serverUsers = serverUsers.map((item) => (item.id === id ? { ...item, ...updates } : item));
  });
  api.apiSetUserState.mockImplementation(async (id, state) => {
    serverUsers = serverUsers.map((item) => (item.id === id ? { ...item, estado: state } : item));
  });
  api.apiGetUserPermissions.mockResolvedValue({ ...permissionsDefault });
  api.apiSaveUserPermissions.mockImplementation(async (id, permissions) => {
    serverPermissions = { ...permissions };
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Admin conectado a la API', () => {
  it('carga usuarios y productos remotos', async () => {
    render(<Admin />);

    expect(await screen.findByText('admin@duoc.cl')).toBeInTheDocument();
    expect(api.apiGetUsers).toHaveBeenCalledOnce();
    expect(api.apiGetProducts).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: /^productos$/i }));
    expect(screen.getAllByText('En oferta')).toHaveLength(2);
  });

  it('crea, edita y elimina productos usando la API', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Admin />);

    await user.click(screen.getByRole('button', { name: /^productos$/i }));
    await user.click(screen.getByRole('button', { name: /crear producto/i }));
    await user.type(screen.getByLabelText(/nombre/i), 'Producto remoto');
    await user.type(screen.getByLabelText(/precio/i), '2500');
    await user.type(screen.getByLabelText(/categoría/i), 'Pruebas');
    await user.type(screen.getByLabelText(/imagen/i), '/media/prueba.png');
    await user.click(screen.getByRole('button', { name: /guardar producto/i }));

    expect(api.apiCreateProduct).toHaveBeenCalledWith(expect.objectContaining({
      nombre: 'Producto remoto',
      precio: 2500,
      categoria: 'Pruebas',
    }));
    const productRow = screen.getByRole('row', { name: /producto remoto/i });
    await user.click(within(productRow).getByRole('button', { name: /editar/i }));
    const nameInput = screen.getByLabelText(/nombre/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Producto editado');
    await user.click(screen.getByRole('button', { name: /guardar producto/i }));
    expect(api.apiUpdateProduct).toHaveBeenCalledWith(expect.any(Number), expect.objectContaining({
      nombre: 'Producto editado',
    }));

    await user.click(within(screen.getByRole('row', { name: /producto editado/i })).getByRole('button', { name: /eliminar/i }));
    expect(api.apiDeleteProduct).toHaveBeenCalledOnce();
    expect(screen.queryByRole('row', { name: /producto editado/i })).not.toBeInTheDocument();
  });

  it('aplica en la interfaz la visibilidad de roles del moderador', async () => {
    const user = userEvent.setup();
    localStorage.setItem('sesionActiva', JSON.stringify(serverUsers[2]));
    render(<Admin />);

    await user.click(screen.getByRole('button', { name: /^usuarios$/i }));
    expect(screen.queryByText('admin@duoc.cl')).not.toBeInTheDocument();
    await user.click(within(screen.getByRole('row', { name: /juan@duoc\.cl/i })).getByRole('button', { name: /editar/i }));
    expect(screen.getByRole('option', { name: 'Admin' })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText(/^rol$/i), 'moderador');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(api.apiUpdateUser).toHaveBeenCalledWith(2, expect.objectContaining({ rol: 'moderador' }));
  });

  it('no abre el panel para un usuario normal', () => {
    localStorage.setItem('sesionActiva', JSON.stringify(serverUsers[1]));
    render(<Admin />);

    expect(screen.getByRole('heading', { name: /acceso denied/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^productos$/i })).not.toBeInTheDocument();
  });

  it('lee y guarda permisos remotos', async () => {
    const user = userEvent.setup();
    render(<Admin />);

    await user.click(screen.getByRole('button', { name: /^permisos$/i }));
    await user.selectOptions(screen.getByLabelText(/selecciona un usuario/i), 'juan@duoc.cl');
    expect(api.apiGetUserPermissions).toHaveBeenCalledWith(2);
    await user.click(screen.getByLabelText(/acceso admin/i));
    await user.click(screen.getByLabelText(/editar perfil/i));
    await user.click(screen.getByRole('button', { name: /guardar permisos/i }));

    expect(api.apiSaveUserPermissions).toHaveBeenCalledWith(2, expect.objectContaining({
      'acceso-admin': true,
      'editar-perfil': false,
    }));
    expect(serverPermissions['acceso-admin']).toBe(true);
  });
});
