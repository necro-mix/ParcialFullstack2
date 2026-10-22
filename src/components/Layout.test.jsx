import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Layout from './Layout';
import Admin from '../pages/Admin';

describe('Layout', () => {
  it('permite que cualquier usuario con rol admin entre al panel', async () => {
    const user = userEvent.setup();
    localStorage.setItem('usuarios', JSON.stringify([
      { correo: 'otro-admin@duoc.cl', run: '12345678K', rol: 'admin' },
    ]));
    localStorage.setItem('sesionActiva', JSON.stringify({
      correo: 'otro-admin@duoc.cl',
      run: '12345678K',
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<h1>Inicio</h1>} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: /panel admin/i }));

    expect(await screen.findByRole('heading', { name: /hola administrador/i })).toBeInTheDocument();
  });

  it('permite que un moderador acceda al panel y muestra sus permisos limitados', async () => {
    const user = userEvent.setup();
    localStorage.setItem('usuarios', JSON.stringify([
      { correo: 'moderador@duoc.cl', run: '87654321K', rol: 'moderador' },
    ]));
    localStorage.setItem('sesionActiva', JSON.stringify({
      correo: 'moderador@duoc.cl',
      run: '87654321K',
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<h1>Inicio</h1>} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: /panel admin/i }));

    expect(await screen.findByRole('heading', { name: /hola moderador/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^usuarios$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^productos$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^permisos$/i })).not.toBeInTheDocument();
  });

  it('actualiza el acceso al panel cuando cambia el rol de la cuenta', async () => {
    localStorage.setItem('usuarios', JSON.stringify([
      { correo: 'persona@duoc.cl', run: '12345678K', rol: 'usuario' },
    ]));
    localStorage.setItem('sesionActiva', JSON.stringify({
      correo: 'persona@duoc.cl',
      run: '12345678K',
    }));

    render(
      <MemoryRouter>
        <Layout><h1>Inicio</h1></Layout>
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: /panel admin/i })).not.toBeInTheDocument();

    localStorage.setItem('usuarios', JSON.stringify([
      { correo: 'persona@duoc.cl', run: '12345678K', rol: 'admin' },
    ]));
    window.dispatchEvent(new Event('userschange'));

    expect(await screen.findByRole('link', { name: /panel admin/i })).toBeInTheDocument();
  });
});
