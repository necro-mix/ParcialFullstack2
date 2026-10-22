import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import Admin from './Admin';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'admin@duoc.cl', run: '11111111K' }));
  localStorage.setItem('usuarios', JSON.stringify([
    { correo: 'admin@duoc.cl', run: '11111111K', contrasena: 'Admin123', rol: 'admin' },
    { correo: 'juan@duoc.cl', run: '12345678K', contrasena: 'abcd', rol: 'usuario' },
    { correo: 'admin2@duoc.cl', run: '11111811K', contrasena: 'semen', rol: 'admin' }]));
});

describe('Admin', () => {
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
    const checkbox = screen.getByLabelText(/ver historial/i);
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: /guardar permisos/i }));

    expect(JSON.parse(localStorage.getItem('permisos_juan@duoc.cl'))['ver-historial']).toBe(true);
  });
});
