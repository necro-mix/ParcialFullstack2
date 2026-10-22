import { permisosDefault, productos } from './data.js';
import {
  addToCart,
  clearCart,
  createProduct,
  deleteProduct,
  getCart,
  getProducts,
  getSession,
  getUserPermissions,
  getUserState,
  getUsers,
  loginUser,
  logoutUser,
  registerUser,
  removeFromCart,
  saveUserPermissions,
  setUserState,
  updateProduct,
  updateUser,
} from './storage.js';

describe('datos del catálogo', () => {
  it('incluye productos con los campos necesarios para mostrarlos', () => {
    expect(productos.length).toBeGreaterThan(0);
    productos.forEach((producto) => {
      expect(producto.id).toBeDefined();
      expect(producto.nombre).toEqual(jasmine.any(String));
      expect(producto.precio).toEqual(jasmine.any(Number));
      expect(producto.categoria).toEqual(jasmine.any(String));
    });
  });
});

describe('persistencia de usuarios y sesión', () => {
  it('crea el administrador predeterminado cuando aún no existe', () => {
    const users = getUsers();

    expect(users).toContain(jasmine.objectContaining({
      correo: 'admin@duoc.cl',
      rol: 'admin',
    }));
    expect(JSON.parse(localStorage.getItem('usuarios'))).toEqual(users);
  });

  it('normaliza el correo al registrar y rechaza correos duplicados', () => {
    const firstResult = registerUser({ correo: '  Persona@Ejemplo.com ', run: '12345678K' });
    const duplicateResult = registerUser({ correo: 'persona@ejemplo.com', run: '87654321K' });

    expect(firstResult.exito).toBeTrue();
    expect(JSON.parse(localStorage.getItem('usuarios'))).toContain(jasmine.objectContaining({
      correo: 'persona@ejemplo.com',
      rol: 'usuario',
    }));
    expect(duplicateResult).toEqual({
      exito: false,
      mensaje: 'El correo ya está registrado.',
    });
  });

  it('permite iniciar sesión por correo o RUN y cerrar la sesión', () => {
    registerUser({ correo: 'persona@ejemplo.com', run: '12345678K', contrasena: 'clave' });

    expect(loginUser(' PERSONA@EJEMPLO.COM ', 'clave').exito).toBeTrue();
    expect(getSession()).toEqual({ correo: 'persona@ejemplo.com', run: '12345678K' });
    expect(loginUser('12345678K', 'incorrecta').exito).toBeFalse();
    expect(loginUser('12345678K', 'clave').exito).toBeTrue();

    logoutUser();
    expect(getSession()).toBeNull();
  });
});

describe('persistencia del carrito', () => {
  const product = productos[0];

  it('mantiene el carrito separado por usuario y no persiste productos sin sesión', () => {
    expect(addToCart(product)).toEqual([product]);
    expect(getCart()).toEqual([]);

    loginUser('admin@duoc.cl', 'Admin123');
    addToCart(product);
    expect(getCart()).toEqual([product]);

    logoutUser();
    registerUser({ correo: 'otra@ejemplo.com', run: '87654321K', contrasena: 'clave' });
    loginUser('otra@ejemplo.com', 'clave');
    expect(getCart()).toEqual([]);
  });

  it('elimina un producto por índice y permite vaciar el carrito', () => {
    loginUser('admin@duoc.cl', 'Admin123');
    addToCart(product);
    addToCart(productos[1]);

    expect(removeFromCart(0)).toEqual([productos[1]]);
    expect(clearCart()).toEqual([]);
    expect(getCart()).toEqual([]);
  });
});

describe('gestión de productos', () => {
  const newProduct = {
    nombre: 'Producto de prueba',
    precio: 2500,
    src: '/media/prueba.png',
    categoria: 'Pruebas',
    oferta: false,
  };

  it('requiere rol admin para crear, editar o eliminar productos', () => {
    localStorage.setItem('sesionActiva', JSON.stringify({ correo: 'persona@ejemplo.com' }));
    registerUser({ correo: 'persona@ejemplo.com', run: '12345678K' });

    expect(() => createProduct(newProduct)).toThrowError(/administradores/i);
    expect(() => updateProduct(productos[0].id, { nombre: 'Cambio no permitido' })).toThrowError(/administradores/i);
    expect(() => deleteProduct(productos[0].id)).toThrowError(/administradores/i);
  });

  it('permite al administrador crear, consultar, editar y eliminar productos', () => {
    loginUser('admin@duoc.cl', 'Admin123');
    const created = createProduct(newProduct);

    expect(getProducts()).toContain(jasmine.objectContaining(newProduct));
    expect(updateProduct(created.id, { nombre: 'Producto actualizado' })).toBeTrue();
    expect(getProducts()).toContain(jasmine.objectContaining({ id: created.id, nombre: 'Producto actualizado' }));
    expect(deleteProduct(created.id)).toBeTrue();
    expect(getProducts()).not.toContain(jasmine.objectContaining({ id: created.id }));
  });
});

describe('preferencias y administración de usuarios', () => {
  it('combina permisos predeterminados con los permisos guardados', () => {
    saveUserPermissions('persona@ejemplo.com', { 'ver-historial': true });

    expect(getUserPermissions('persona@ejemplo.com')).toEqual({
      ...permisosDefault,
      'ver-historial': true,
    });
  });

  it('usa valores predeterminados si los permisos almacenados no son JSON válido', () => {
    localStorage.setItem('permisos_persona@ejemplo.com', '{');

    expect(getUserPermissions('persona@ejemplo.com')).toEqual(permisosDefault);
  });

  it('actualiza el usuario y migra sus permisos y estado cuando cambia el correo', () => {
    registerUser({ correo: 'persona@ejemplo.com', run: '12345678K' });
    saveUserPermissions('persona@ejemplo.com', { 'acceso-admin': true });
    setUserState('persona@ejemplo.com', 'bloqueado');

    expect(updateUser('persona@ejemplo.com', { correo: 'nuevo@ejemplo.com' })).toBeTrue();
    expect(getUsers()).toContain(jasmine.objectContaining({ correo: 'nuevo@ejemplo.com' }));
    expect(getUserPermissions('nuevo@ejemplo.com')['acceso-admin']).toBeTrue();
    expect(getUserPermissions('persona@ejemplo.com')).toEqual(permisosDefault);
    expect(getUserState('nuevo@ejemplo.com')).toBe('bloqueado');
    expect(localStorage.getItem('estado_persona@ejemplo.com')).toBeNull();
  });

  it('informa cuando se intenta actualizar un correo inexistente', () => {
    expect(updateUser('inexistente@ejemplo.com', { run: '12345678K' })).toBeFalse();
  });
});
