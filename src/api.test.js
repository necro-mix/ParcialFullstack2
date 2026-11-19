import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetProducts, apiLoginUser } from './api';

beforeEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('cliente de API', () => {
  it('guarda el JWT y normaliza la sesión que devuelve Django', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access: 'access-token',
        refresh: 'refresh-token',
        user: { id: 7, email: 'admin@example.com', run: '11111111K', role: 'admin', is_active: true },
      }),
    }));

    await apiLoginUser(' ADMIN@example.com ', 'secret');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/login\/$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'secret' }),
      }),
    );
    expect(localStorage.getItem('apiAccessToken')).toBe('access-token');
    expect(JSON.parse(localStorage.getItem('sesionActiva'))).toEqual(expect.objectContaining({
      correo: 'admin@example.com',
      rol: 'admin',
      estado: 'activo',
    }));
  });

  it('normaliza la respuesta paginada DRF para el catálogo', async () => {
    localStorage.setItem('apiAccessToken', 'access-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        count: 1,
        results: [{ id: 3, name: 'Paracetamol', price: '1000', image: '/media/paracetamol.png', category: 'Medicamentos', is_offer: false }],
      }),
    }));

    await expect(apiGetProducts()).resolves.toEqual([
      expect.objectContaining({
        id: 3,
        nombre: 'Paracetamol',
        precio: 1000,
        src: '/media/paracetamol.png',
        categoria: 'Medicamentos',
        oferta: false,
      }),
    ]);
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer access-token');
  });

  it('muestra errores DRF en vez de ocultarlos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ email: ['Este correo ya existe.'] }),
    }));

    await expect(apiGetProducts()).rejects.toThrow('Este correo ya existe.');
  });

  it('renueva un access token vencido y reintenta una sola vez', async () => {
    localStorage.setItem('apiAccessToken', 'expired');
    localStorage.setItem('apiRefreshToken', 'refresh-token');
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access: 'new-access' }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      }));

    await expect(apiGetProducts()).resolves.toEqual([]);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(localStorage.getItem('apiAccessToken')).toBe('new-access');
    expect(fetch.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer new-access');
  });

  it('recorre todas las páginas DRF', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          next: 'http://192.168.1.94:12696/api/products/?page=2',
          results: [{ id: 1, name: 'Producto 1', price: 100, image: '/one.png', category: 'Cat', is_offer: false }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          next: null,
          results: [{ id: 2, name: 'Producto 2', price: 200, image: '/two.png', category: 'Cat', is_offer: true }],
        }),
      }));

    await expect(apiGetProducts()).resolves.toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toBe('http://192.168.1.94:12696/api/products/?page=2');
  });

  it('rechaza una página que apunta a otro origen antes de reenviar el token', async () => {
    localStorage.setItem('apiAccessToken', 'access-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        next: 'https://otro-origen.example/api/products/?page=2',
        results: [{ id: 1, name: 'Producto', price: 100, image: '/one.png', category: 'Cat', is_offer: false }],
      }),
    }));

    await expect(apiGetProducts()).rejects.toThrow('origen distinto');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
