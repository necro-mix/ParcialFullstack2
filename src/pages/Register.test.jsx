import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from '../components/Layout';
import Login from './Login';
import Register from './Register';

const fillValidForm = async (user, email = 'usuario@gmail.com') => {
  await user.type(screen.getByLabelText(/RUN/i), '19011022K');
  await user.type(screen.getByLabelText(/Correo Electrónico/i), email);
  await user.type(screen.getByLabelText(/^Nombre/i), 'Juan');
  await user.type(screen.getByLabelText(/Apellidos/i), 'Pérez González');
  await user.type(screen.getByLabelText(/contraseña \(mínimo 8 caracteres\)/i), 'Password123!');
  await user.type(screen.getByLabelText(/^Repetir contraseña\*/i), 'Password123!');
  await user.type(screen.getByLabelText(/Región Domiciliaria/i), 'Región Metropolitana');
  await user.type(screen.getByLabelText(/Comuna Domiciliaria/i), 'Santiago');
  await user.type(screen.getByLabelText(/Dirección Calle/i), 'Av. Providencia 1234');
};

const jsonResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url.endsWith('/api/auth/register/')) return jsonResponse({ id: 2 }, 201);
    if (url.endsWith('/api/auth/login/')) {
      return jsonResponse({
        access: 'access-token',
        refresh: 'refresh-token',
        user: {
          id: 1,
          email: 'admin@duoc.cl',
          run: '11111111K',
          first_name: 'Admin',
          last_name: 'Farmacia',
          role: 'admin',
          is_active: true,
        },
      });
    }
    return jsonResponse({ count: 0, next: null, previous: null, results: [] });
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('registro e inicio de sesión con API', () => {
  it('envía el registro a Django sin guardar usuarios en el navegador', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Register /></MemoryRouter>);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Confirmar y Crear Cuenta/i }));

    expect(await screen.findByText(/Usuario registrado exitosamente/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/register\/$/),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"email":"usuario@gmail.com"'),
      }),
    );
    expect(localStorage.getItem('usuarios')).toBeNull();
  });

  it('rechaza una contraseña menor a ocho caracteres', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Register /></MemoryRouter>);
    await user.type(screen.getByLabelText(/RUN/i), '19011022K');
    await user.type(screen.getByLabelText(/Correo Electrónico/i), 'usuario@gmail.com');
    await user.type(screen.getByLabelText(/^Nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/Apellidos/i), 'Pérez González');
    await user.type(screen.getByLabelText(/contraseña \(mínimo 8 caracteres\)/i), 'short');
    await user.type(screen.getByLabelText(/^Repetir contraseña\*/i), 'short');
    await user.type(screen.getByLabelText(/Región Domiciliaria/i), 'Región Metropolitana');
    await user.type(screen.getByLabelText(/Comuna Domiciliaria/i), 'Santiago');
    await user.type(screen.getByLabelText(/Dirección Calle/i), 'Av. Providencia 1234');
    await user.click(screen.getByRole('button', { name: /Confirmar y Crear Cuenta/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Completa los campos obligatorios/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rechaza dominios de correo que el formulario no permite', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Register /></MemoryRouter>);
    await fillValidForm(user, 'usuario@yahoo.com');
    await user.click(screen.getByRole('button', { name: /Confirmar y Crear Cuenta/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/dominio del correo no está permitido/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['usuario@duoc.cl', 'usuario@profesor.duoc.cl', 'usuario@gmail.com'])(
    'acepta el dominio permitido %s',
    async (email) => {
      const user = userEvent.setup();
      render(<MemoryRouter><Register /></MemoryRouter>);
      await fillValidForm(user, email);
      await user.click(screen.getByRole('button', { name: /Confirmar y Crear Cuenta/i }));

      expect(await screen.findByText(/Usuario registrado exitosamente/i)).toBeInTheDocument();
    }
  );

  it('inicia sesión con JWT y habilita la navegación según el rol API', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/correo electrónico/i), 'admin@duoc.cl');
    await user.type(screen.getByLabelText(/contraseña/i), 'AdminPassword123!');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/home/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /panel admin/i })).toBeInTheDocument();
    expect(localStorage.getItem('apiAccessToken')).toBe('access-token');
    expect(localStorage.getItem('usuarios')).toBeNull();
  });
});
