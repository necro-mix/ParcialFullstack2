import { permisosDefault, productos as productosIniciales } from './data.js';

const ADMIN_DEFAULT = {
  correo: 'admin@duoc.cl',
  run: '11111111K',
  contrasena: 'Admin123',
  rol: 'admin',
};

function emitCustomEvent(name) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(name));
  }
}

function requireAdmin() {
  const session = getSession();
  const user = session && getUsers().find((item) => item.correo === session.correo);
  if (user?.rol !== 'admin') {
    throw new Error('Solo los administradores pueden gestionar productos.');
  }
}

export function getProducts() {
  const stored = localStorage.getItem('productos');
  return stored ? JSON.parse(stored) : productosIniciales;
}

export function createProduct(product) {
  requireAdmin();
  const products = getProducts();
  const nextId = products.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
  const next = [...products, { ...product, id: nextId }];
  localStorage.setItem('productos', JSON.stringify(next));
  emitCustomEvent('productschange');
  return next[next.length - 1];
}

export function updateProduct(id, updates) {
  requireAdmin();
  const products = getProducts();
  const index = products.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const next = products.map((item, itemIndex) => (
    itemIndex === index ? { ...item, ...updates, id: item.id } : item
  ));
  localStorage.setItem('productos', JSON.stringify(next));
  emitCustomEvent('productschange');
  return true;
}

export function deleteProduct(id) {
  requireAdmin();
  const products = getProducts();
  const next = products.filter((item) => item.id !== id);
  if (next.length === products.length) return false;

  localStorage.setItem('productos', JSON.stringify(next));
  emitCustomEvent('productschange');
  return true;
}

export function getUsers() {
  const stored = localStorage.getItem('usuarios');
  const users = stored ? JSON.parse(stored) : [];
  const normalizedUsers = [...users];
  if (!normalizedUsers.some((user) => user.correo === ADMIN_DEFAULT.correo)) {
    normalizedUsers.push(ADMIN_DEFAULT);
    saveUsers(normalizedUsers);
  }
  return normalizedUsers;
}

export function saveUsers(users) {
  localStorage.setItem('usuarios', JSON.stringify(users));
  emitCustomEvent('userschange');
}

export function registerUser(user) {
  const users = getUsers();
  const email = String(user.correo || '').trim().toLowerCase();
  if (users.some((item) => String(item.correo).trim().toLowerCase() === email)) {
    return { exito: false, mensaje: 'El correo ya está registrado.' };
  }
  const nextUsers = [...users, { ...user, correo: email, rol: 'usuario' }];
  saveUsers(nextUsers);
  return { exito: true, mensaje: 'Usuario registrado exitosamente.' };
}

export function loginUser(correo, contrasena) {
  const inputCorreo = String(correo || '').trim().toLowerCase();
  const inputClave = String(contrasena || '');
  const user = getUsers().find((item) => {
    const itemCorreo = String(item.correo || '').trim().toLowerCase();
    const itemRun = String(item.run || '').trim().toLowerCase();
    return itemCorreo === inputCorreo || itemRun === inputCorreo;
  });
  if (!user || user.contrasena !== inputClave) {
    return { exito: false, mensaje: 'Usuario no encontrado o contraseña incorrecta.' };
  }
  const session = { correo: user.correo, run: user.run };
  localStorage.setItem('sesionActiva', JSON.stringify(session));
  emitCustomEvent('sessionchange');
  return { exito: true, mensaje: 'Inicio de sesión exitoso.' };
}

export function getSession() {
  const stored = localStorage.getItem('sesionActiva');
  return stored ? JSON.parse(stored) : null;
}

export function logoutUser() {
  localStorage.removeItem('sesionActiva');
  emitCustomEvent('sessionchange');
}

export function getCart() {
  const session = getSession();
  if (!session) return [];
  const stored = localStorage.getItem(`carrito_${session.correo}`);
  return stored ? JSON.parse(stored) : [];
}

export function addToCart(product) {
  const cart = getCart();
  const next = [...cart, product];
  const session = getSession();
  if (session) {
    localStorage.setItem(`carrito_${session.correo}`, JSON.stringify(next));
    emitCustomEvent('cartchange');
  }
  return next;
}

export function removeFromCart(index) {
  const cart = getCart();
  const next = cart.filter((_, itemIndex) => itemIndex !== index);
  const session = getSession();
  if (session) {
    localStorage.setItem(`carrito_${session.correo}`, JSON.stringify(next));
    emitCustomEvent('cartchange');
  }
  return next;
}

export function clearCart() {
  const session = getSession();
  if (session) {
    localStorage.removeItem(`carrito_${session.correo}`);
    emitCustomEvent('cartchange');
  }
  return [];
}

export function getUserPermissions(correo) {
  const stored = localStorage.getItem(`permisos_${correo}`);
  if (!stored) {
    return { ...permisosDefault };
  }

  try {
    const parsed = JSON.parse(stored);
    return { ...permisosDefault, ...parsed };
  } catch {
    return { ...permisosDefault };
  }
}

export function saveUserPermissions(correo, permissions) {
  localStorage.setItem(`permisos_${correo}`, JSON.stringify(permissions));
}

export function getUserState(correo) {
  return localStorage.getItem(`estado_${correo}`) || 'activo';
}

export function setUserState(correo, state) {
  localStorage.setItem(`estado_${correo}`, state);
}

export function updateUser(correo, updates) {
  const users = getUsers();
  const normalizedCorreo = String(correo || '').trim();
  const index = users.findIndex((user) => user.correo === normalizedCorreo);

  if (index === -1) return false;

  const previous = users[index];
  const nextUser = {
    ...previous,
    ...updates,
  };

  if (updates.correo && updates.correo !== previous.correo) {
    const oldPermissions = localStorage.getItem(`permisos_${previous.correo}`);
    const oldState = localStorage.getItem(`estado_${previous.correo}`);

    if (oldPermissions) {
      localStorage.setItem(`permisos_${updates.correo}`, oldPermissions);
      localStorage.removeItem(`permisos_${previous.correo}`);
    }

    if (oldState) {
      localStorage.setItem(`estado_${updates.correo}`, oldState);
      localStorage.removeItem(`estado_${previous.correo}`);
    }
  }

  users[index] = nextUser;
  saveUsers(users);
  return true;
}
