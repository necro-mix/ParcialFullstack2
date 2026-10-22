import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Layout from '../components/Layout';
import Login from './Login';
import Register from './Register';

const fillValidForm = async (user) => {
  await user.type(screen.getByLabelText(/RUN/i), '19011022K');
  await user.type(screen.getByLabelText(/Correo Electrónico/i), 'usuario@gmail.com');
  await user.type(screen.getByLabelText(/^Nombre/i), 'Juan');
  await user.type(screen.getByLabelText(/Apellidos/i), 'Pérez González');
  await user.type(screen.getByLabelText(/^Contraseña\*/i), 'abcd');
  await user.type(screen.getByLabelText(/^Repetir contraseña\*/i), 'abcd');
  await user.selectOptions(screen.getByLabelText(/Región Domiciliaria/i), 'Región Metropolitana');
  await user.selectOptions(screen.getByLabelText(/Comuna Domiciliaria/i), 'Santiago');
  await user.type(screen.getByLabelText(/Dirección Calle/i), 'Av. Providencia 1234');
};

describe('Register', () => {
  it('valida un formulario completo y registra el usuario', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Register /></MemoryRouter>);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Confirmar y Crear Cuenta/i }));
    expect(await screen.findByText(/Usuario registrado exitosamente/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('usuarios'))).toHaveLength(2);
  });

  it('rechaza una contraseña corta', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Register /></MemoryRouter>);
    await user.type(screen.getByLabelText(/RUN/i), '19011022K');
    await user.type(screen.getByLabelText(/Correo Electrónico/i), 'usuario@gmail.com');
    await user.type(screen.getByLabelText(/^Nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/Apellidos/i), 'Pérez González');
    await user.type(screen.getByLabelText(/^Contraseña\*/i), 'a');
    await user.type(screen.getByLabelText(/^Repetir contraseña\*/i), 'a');
    await user.selectOptions(screen.getByLabelText(/Región Domiciliaria/i), 'Región Metropolitana');
    await user.selectOptions(screen.getByLabelText(/Comuna Domiciliaria/i), 'Santiago');
    await user.type(screen.getByLabelText(/Dirección Calle/i), 'Av. Providencia 1234');
    await user.click(screen.getByRole('button', { name: /Confirmar y Crear Cuenta/i }));
    expect(screen.getByText(/Completa los campos obligatorios/i)).toBeInTheDocument();
  });

  it('actualiza el layout y muestra el panel admin después del login sin recargar', async () => {
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
    await user.type(screen.getByLabelText(/contraseña/i), 'Admin123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/home/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /panel admin/i })).toBeInTheDocument();
  });
});
