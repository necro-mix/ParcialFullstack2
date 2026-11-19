import { canViewRole, getSession, getUserByEmail, logoutUser } from './storage.js';

describe('persistencia local de la sesión API', () => {
  beforeEach(() => localStorage.clear());

  it('no considera una sesión activa sin un access token', () => {
    localStorage.setItem('sesionActiva', JSON.stringify({
      correo: 'persona@ejemplo.com',
      rol: 'admin',
    }));

    expect(getSession()).toBeNull();
  });

  it('lee el usuario autenticado desde la sesión local', () => {
    const user = { id: 7, correo: 'persona@ejemplo.com', rol: 'admin' };
    localStorage.setItem('apiAccessToken', 'access-token');
    localStorage.setItem('sesionActiva', JSON.stringify(user));

    expect(getSession()).toEqual(user);
    expect(getUserByEmail(' PERSONA@EJEMPLO.COM ')).toEqual(user);
    expect(getUserByEmail('otra@ejemplo.com')).toBeUndefined();
  });

  it('cierra la sesión eliminando únicamente credenciales y estado de sesión', () => {
    localStorage.setItem('apiAccessToken', 'access-token');
    localStorage.setItem('apiRefreshToken', 'refresh-token');
    localStorage.setItem('sesionActiva', '{}');
    localStorage.setItem('otra-preferencia', 'valor');

    logoutUser();

    expect(getSession()).toBeNull();
    expect(localStorage.getItem('apiRefreshToken')).toBeNull();
    expect(localStorage.getItem('sesionActiva')).toBeNull();
    expect(localStorage.getItem('otra-preferencia')).toBe('valor');
  });

  it('usa la jerarquía de roles solo para presentar opciones en la interfaz', () => {
    expect(canViewRole('admin', 'admin')).toBeTrue();
    expect(canViewRole('moderador', 'usuario')).toBeTrue();
    expect(canViewRole('moderador', 'admin')).toBeFalse();
  });
});
