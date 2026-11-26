const API_BASE_URL = String(
  import.meta.env?.VITE_API_BASE_URL || 'http://192.168.1.94:12696/api/',
).trim();
const API_ROOT = new URL(API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`);
const ACCESS_TOKEN_KEY = 'apiAccessToken';
const REFRESH_TOKEN_KEY = 'apiRefreshToken';

function emit(name) {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(name));
}

function normalizeUser(user) {
  if (!user || typeof user !== 'object') {
    throw new Error('La API devolvió un usuario con un formato inválido.');
  }
  const email = user.email ?? user.correo;
  const role = user.role ?? user.rol;
  const isActive = user.is_active ?? user.activo;
  if (
    user.id === undefined
    || typeof email !== 'string'
    || typeof user.run !== 'string'
    || !['usuario', 'moderador', 'admin'].includes(role)
    || typeof isActive !== 'boolean'
  ) {
    throw new Error('La API devolvió un usuario con un formato inválido.');
  }

  return {
    id: user.id,
    correo: email,
    run: user.run,
    nombre: user.first_name ?? user.nombre ?? '',
    apellidos: user.last_name ?? user.apellidos ?? '',
    rol: role,
    estado: isActive ? 'activo' : 'bloqueado',
  };
}

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') {
    throw new Error('La API devolvió un producto con un formato inválido.');
  }
  const nombre = product.name ?? product.nombre;
  const precio = Number(product.price ?? product.precio);
  const src = product.image ?? product.src;
  const categoria = product.category ?? product.categoria;
  const oferta = product.is_offer ?? product.oferta;
  if (
    product.id === undefined
    || typeof nombre !== 'string'
    || !nombre
    || !Number.isFinite(precio)
    || precio <= 0
    || typeof src !== 'string'
    || !src
    || typeof categoria !== 'string'
    || !categoria
    || typeof oferta !== 'boolean'
  ) {
    throw new Error('La API devolvió un producto con un formato inválido.');
  }

  const normalized = {
    id: product.id,
    nombre,
    precio,
    src,
    categoria,
    oferta,
  };
  return normalized;
}

function resolveRequestUrl(path) {
  const isAbsoluteUrl = /^https?:\/\//i.test(path);
  const endpoint = isAbsoluteUrl ? path : path.replace(/^\/api\/?/, '').replace(/^\/+/, '');
  const url = new URL(endpoint, API_ROOT);
  if (url.origin !== API_ROOT.origin || !url.pathname.startsWith(API_ROOT.pathname)) {
    throw new Error('La API devolvió una página en un origen distinto al configurado.');
  }
  return url.toString();
}

async function getAllPages(path, normalize) {
  const firstPage = await request(path);
  if (Array.isArray(firstPage)) return firstPage.map(normalize);
  if (!Array.isArray(firstPage?.results)) {
    throw new Error('La API devolvió una lista con un formato inválido.');
  }

  const items = [...firstPage.results];
  const visited = new Set([resolveRequestUrl(path)]);
  let next = firstPage.next;
  while (next) {
    if (typeof next !== 'string') {
      throw new Error('La API devolvió un enlace de paginación inválido.');
    }
    const url = resolveRequestUrl(next);
    if (visited.has(url)) throw new Error('La API devolvió un ciclo en la paginación.');
    visited.add(url);
    const page = await request(url);
    if (!Array.isArray(page?.results)) {
      throw new Error('La API devolvió una página con un formato inválido.');
    }
    items.push(...page.results);
    next = page.next;
  }
  return items.map(normalize);
}

async function getErrorMessage(response) {
  const body = await response.json().catch(() => null);
  if (typeof body?.detail === 'string') return body.detail;
  if (typeof body?.message === 'string') return body.message;
  if (body && typeof body === 'object') {
    const firstError = Object.values(body).flat().find((value) => typeof value === 'string');
    if (firstError) return firstError;
  }
  return `La solicitud a la API falló (${response.status}).`;
}

async function request(path, { method = 'GET', body, authenticated = true, retry = true } = {}) {
  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const access = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (access) headers.set('Authorization', `Bearer ${access}`);
  }

  let response;
  try {
    response = await fetch(resolveRequestUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('No fue posible conectar con la API. Revisa la URL y tu conexión.');
  }

  if (response.status === 401 && authenticated && retry) {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refresh) {
      let refreshed;
      try {
        refreshed = await fetch(resolveRequestUrl('/api/auth/refresh/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
      } catch {
        refreshed = null;
      }

      if (refreshed?.ok) {
        const tokens = await refreshed.json();
        if (tokens.access) {
          localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
          return request(path, { method, body, authenticated, retry: false });
        }
      }
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('sesionActiva');
    emit('sessionchange');
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
  }

  if (!response.ok) throw new Error(await getErrorMessage(response));
  if (response.status === 204) return null;
  return response.json();
}

function toApiUser(user) {
  return {
    email: user.correo,
    run: user.run,
    first_name: user.nombre,
    last_name: user.apellidos,
    role: user.rol,
  };
}

function toApiProduct(product) {
  return {
    name: product.nombre,
    price: Number(product.precio),
    image: product.src,
    category: product.categoria,
    is_offer: Boolean(product.oferta),
  };
}

export async function apiLoginUser(email, password) {
  const result = await request('/api/auth/login/', {
    method: 'POST',
    authenticated: false,
    body: { email: String(email).trim().toLowerCase(), password },
  });
  if (!result?.access || !result?.refresh || !result?.user) {
    throw new Error('La respuesta de inicio de sesión no contiene la sesión esperada.');
  }

  const user = normalizeUser(result.user);
  localStorage.setItem(ACCESS_TOKEN_KEY, result.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh);
  localStorage.setItem('sesionActiva', JSON.stringify(user));
  emit('sessionchange');
  return { exito: true, mensaje: 'Inicio de sesión exitoso.' };
}

export async function apiRegisterUser(user) {
  await request('/api/auth/register/', {
    method: 'POST',
    authenticated: false,
    body: {
      email: String(user.correo).trim().toLowerCase(),
      run: user.run,
      password: user.contrasena,
      first_name: user.nombre,
      last_name: user.apellidos,
      region: user.region,
      commune: user.comuna,
      address: user.direccion,
    },
  });
  return { exito: true, mensaje: 'Usuario registrado exitosamente.' };
}

export async function apiGetProducts() {
  return getAllPages('/api/products/', normalizeProduct);
}

export async function apiCreateProduct(product) {
  const result = await request('/api/products/', { method: 'POST', body: toApiProduct(product) });
  emit('productschange');
  return normalizeProduct(result);
}

export async function apiUpdateProduct(id, product) {
  const result = await request(`/api/products/${encodeURIComponent(id)}/`, {
    method: 'PATCH',
    body: toApiProduct(product),
  });
  emit('productschange');
  return normalizeProduct(result);
}

export async function apiDeleteProduct(id) {
  await request(`/api/products/${encodeURIComponent(id)}/`, { method: 'DELETE' });
  emit('productschange');
}

export async function apiGetUsers() {
  return getAllPages('/api/users/', normalizeUser);
}

export async function apiUpdateUser(id, updates) {
  const result = await request(`/api/users/${encodeURIComponent(id)}/`, {
    method: 'PATCH',
    body: toApiUser(updates),
  });
  emit('userschange');
  return normalizeUser(result);
}

export async function apiSetUserState(id, state) {
  const result = await request(`/api/users/${encodeURIComponent(id)}/`, {
    method: 'PATCH',
    body: { is_active: state === 'activo' },
  });
  emit('userschange');
  return normalizeUser(result);
}

export async function apiGetUserPermissions(id) {
  const result = await request(`/api/users/${encodeURIComponent(id)}/permissions/`);
  const permissions = result.permissions;
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
    throw new Error('La API devolvió permisos con un formato inválido.');
  }
  if (Object.values(permissions).some((value) => typeof value !== 'boolean')) {
    throw new Error('La API devolvió permisos con un formato inválido.');
  }
  return permissions;
}

export async function apiSaveUserPermissions(id, permissions) {
  await request(`/api/users/${encodeURIComponent(id)}/permissions/`, {
    method: 'PATCH',
    body: { permissions },
  });
  emit('userschange');
}
export async function apiGetCart() {
  const data = await request('/api/cart/');
  const items = Array.isArray(data?.items)
    ? data.items.map((item) => ({
        id: item.id,
        productId: item.product,
        cantidad: item.quantity,
        subtotal: item.subtotal,
        producto: item.product_detail ? normalizeProduct(item.product_detail) : null,
      }))
    : [];
  return {
    id: data?.id,
    items,
    total: Number(data?.total || 0),
  };
}

export async function apiAddToCart(productId, quantity = 1) {
  const result = await request('/api/cart/items/', {
    method: 'POST',
    body: { product: productId, quantity },
  });
  emit('cartchange');
  return result;
}

export async function apiUpdateCartItem(itemId, quantity) {
  const result = await request(`/api/cart/items/${encodeURIComponent(itemId)}/`, {
    method: 'PATCH',
    body: { quantity },
  });
  emit('cartchange');
  return result;
}

export async function apiRemoveCartItem(itemId) {
  await request(`/api/cart/items/${encodeURIComponent(itemId)}/`, {
    method: 'DELETE',
  });
  emit('cartchange');
}

export async function apiClearCart() {
  await request('/api/cart/', { method: 'DELETE' });
  emit('cartchange');
}

export async function apiCheckoutCart() {
  const order = await request('/api/cart/checkout/', { method: 'POST' });
  emit('cartchange');
  return order;
}

export async function apiGetOrders() {
  const orders = await request('/api/orders/');
  return Array.isArray(orders) ? orders : [];
}