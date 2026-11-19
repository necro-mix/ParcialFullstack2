import { useEffect, useMemo, useState } from 'react';
import { canViewRole, getSession, getUserByEmail } from '../storage';
import OfferBadge from '../components/OfferBadge';
import {
  apiCreateProduct,
  apiDeleteProduct,
  apiGetProducts,
  apiGetUserPermissions,
  apiGetUsers,
  apiSaveUserPermissions,
  apiSetUserState,
  apiUpdateProduct,
  apiUpdateUser,
} from '../api';

const editablePermissions = [
  { key: 'acceso-admin', label: 'Acceso admin' },
  { key: 'editar-perfil', label: 'Editar perfil' },
];

export default function Admin() {
  const session = getSession();
  const user = getUserByEmail(session?.correo);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [section, setSection] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState('');
  const [permissions, setPermissions] = useState({});
  const [editForm, setEditForm] = useState(null);
  const [productForm, setProductForm] = useState(null);
  const [productError, setProductError] = useState('');
  const [productMessage, setProductMessage] = useState('');
  const [adminError, setAdminError] = useState('');
  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((item) => item.rol === 'admin').length,
    active: users.filter((item) => item.estado === 'activo').length,
    blocked: users.filter((item) => item.estado === 'bloqueado').length,
  }), [users]);

  useEffect(() => {
    let active = true;
    Promise.all([apiGetUsers(), apiGetProducts()])
      .then(([remoteUsers, remoteProducts]) => {
        if (!active) return;
        const role = getUserByEmail(session?.correo)?.rol;
        setUsers(remoteUsers.filter((item) => canViewRole(role, item.rol)));
        setProducts(remoteProducts);
      })
      .catch((requestError) => {
        if (active) setAdminError(requestError.message);
      });
    return () => { active = false; };
  }, []);

  if (!user || !['admin', 'moderador'].includes(user.rol)) return <section className="container content-section"><h1>Acceso denied</h1><p>No tienes permisos para acceder al panel administrativo.</p></section>;
  const isAdmin = user.rol === 'admin';
  const refreshUsers = async () => {
    const currentRole = getUserByEmail(session?.correo)?.rol;
    const remoteUsers = await apiGetUsers();
    const visibleUsers = remoteUsers.filter((item) => canViewRole(currentRole, item.rol));
    setUsers(visibleUsers);
    return visibleUsers;
  };

  const toggleState = async (item) => {
    const next = item.estado === 'activo' ? 'bloqueado' : 'activo';
    try {
      await apiSetUserState(item.id, next);
      await refreshUsers();
      setAdminError('');
    } catch (requestError) {
      setAdminError(requestError.message);
    }
  };

  const selectUser = async (correo) => {
    setSelectedUser(correo);
    try {
      const target = users.find((item) => item.correo === correo);
      if (!target) throw new Error('No se encontró el usuario seleccionado.');
      setPermissions(await apiGetUserPermissions(target.id));
      setAdminError('');
    } catch (requestError) {
      setAdminError(requestError.message);
    }
  };

  const beginEdit = (item) => {
    setEditForm({
      id: item.id,
      correo: item.correo,
      run: item.run,
      rol: item.rol,
    });
  };

  const saveEdit = async () => {
    if (!editForm) return;
    const email = String(editForm.correo || '').trim();
    const run = String(editForm.run || '').trim();
    if (!email || !run) return;

    try {
      const updates = { correo: email, run, rol: editForm.rol };
      await apiUpdateUser(editForm.id, updates);
      await refreshUsers();
      setSelectedUser(email);
      setEditForm(null);
      setAdminError('');
    } catch (requestError) {
      setAdminError(requestError.message);
    }
  };

  const savePermissions = async () => {
    if (!selectedUser) return;
    try {
      const target = users.find((item) => item.correo === selectedUser);
      if (!target) throw new Error('No se encontró el usuario seleccionado.');
      await apiSaveUserPermissions(target.id, permissions);
      await refreshUsers();
      setAdminError('');
    } catch (requestError) {
      setAdminError(requestError.message);
    }
  };

  const beginProductEdit = (product) => {
    setProductForm({ ...product, precio: String(product.precio) });
    setProductError('');
    setProductMessage('');
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const name = String(productForm?.nombre || '').trim();
    const category = String(productForm?.categoria || '').trim();
    const image = String(productForm?.src || '').trim();
    const price = Number(productForm?.precio);

    if (!name || !category || !image || !Number.isFinite(price) || price <= 0) {
      setProductError('Completa todos los campos con un precio mayor que cero.');
      setProductMessage('');
      return;
    }

    const product = {
      nombre: name,
      precio: price,
      src: image,
      categoria: category,
      oferta: Boolean(productForm.oferta),
    };

    try {
      if (productForm.id === undefined) {
        await apiCreateProduct(product);
        setProductMessage('Producto creado correctamente.');
      } else {
        await apiUpdateProduct(productForm.id, product);
        setProductMessage('Producto actualizado correctamente.');
      }
      setProducts(await apiGetProducts());
      setProductForm(null);
      setProductError('');
      setAdminError('');
    } catch (error) {
      setProductError(error.message);
      setProductMessage('');
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`¿Eliminar el producto "${product.nombre}"?`)) return;
    try {
      await apiDeleteProduct(product.id);
      setProducts(await apiGetProducts());
      setProductMessage('Producto eliminado correctamente.');
      setProductError('');
      setAdminError('');
      if (productForm?.id === product.id) setProductForm(null);
    } catch (error) {
      setProductError(error.message);
      setProductMessage('');
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><h3>Admin Panel</h3><p>{session.correo}</p></div>
        <nav className="sidebar-nav" aria-label="Panel administrativo">
          <button className={`nav-item ${section === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => setSection('dashboard')}>Dashboard</button>
          <button className={`nav-item ${section === 'usuarios' ? 'active' : ''}`} type="button" onClick={() => setSection('usuarios')}>Usuarios</button>
          <button className={`nav-item ${section === 'productos' ? 'active' : ''}`} type="button" onClick={() => setSection('productos')}>Productos</button>
          {isAdmin && <button className={`nav-item ${section === 'permisos' ? 'active' : ''}`} type="button" onClick={() => setSection('permisos')}>Permisos</button>}
        </nav>
      </aside>
      <main className="admin-main">
        {adminError && <p className="error-msg" role="alert">{adminError}</p>}
        {section === 'dashboard' && <section className="admin-section active"><div className="section-header"><h1>¡HOLA {isAdmin ? 'Administrador' : 'Moderador'}!</h1><p>Bienvenido al panel de administración de Farmacia de Raza</p></div><div className="dashboard-cards"><div className="stat-card"><h3>Total Usuarios</h3><p className="stat-number">{stats.total}</p></div><div className="stat-card"><h3>Administradores</h3><p className="stat-number">{stats.admins}</p></div><div className="stat-card"><h3>Usuarios Activos</h3><p className="stat-number">{stats.active}</p></div><div className="stat-card"><h3>Usuarios Bloqueados</h3><p className="stat-number">{stats.blocked}</p></div></div></section>}
        {section === 'usuarios' && <section className="admin-section active"><div className="section-header"><h1>Gestión de Usuarios</h1><p>Administra todos los usuarios del sistema</p></div><div className="usuarios-container"><table className="usuarios-table"><thead><tr><th>Correo</th><th>RUN</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{users.map((item) => { const state = item.estado; return <tr key={item.id}><td>{item.correo}</td><td>{item.run}</td><td><span className={`rol-badge rol-${item.rol}`}>{item.rol === 'admin' ? 'Admin' : item.rol === 'moderador' ? 'Moderador' : 'Usuario'}</span></td><td><span className={`estado-badge estado-${state}`}>{state === 'activo' ? 'Activo' : 'Bloqueado'}</span></td><td><div className="tabla-acciones"><button className="btn-action btn-edit" type="button" onClick={() => beginEdit(item)}>Editar</button><button className="btn-action btn-block" type="button" onClick={() => toggleState(item)}>{state === 'activo' ? 'Bloquear' : 'Desbloquear'}</button></div></td></tr>; })}</tbody></table>{editForm && <div className="edit-user-panel"><h3>Editar usuario</h3><div className="edit-user-grid"><div className="form-group"><label htmlFor="admin-edit-correo">Correo</label><input id="admin-edit-correo" value={editForm.correo} onChange={(event) => setEditForm((current) => ({ ...current, correo: event.target.value }))} /></div><div className="form-group"><label htmlFor="admin-edit-run">RUN</label><input id="admin-edit-run" value={editForm.run} onChange={(event) => setEditForm((current) => ({ ...current, run: event.target.value }))} /></div><div className="form-group"><label htmlFor="admin-edit-rol">Rol</label><select id="admin-edit-rol" value={editForm.rol} onChange={(event) => setEditForm((current) => ({ ...current, rol: event.target.value }))}><option value="usuario">Usuario</option><option value="moderador">Moderador</option><option value="admin" disabled={!isAdmin}>Admin</option></select></div></div><button className="btn-save" type="button" onClick={saveEdit}>Guardar cambios</button></div>}</div></section>}
        {section === 'productos' && (
          <section className="admin-section active">
            <div className="section-header">
              <h1>Gestión de Productos</h1>
              <p>Crea, consulta, edita y elimina productos del catálogo.</p>
            </div>
            <div className="productos-admin">
              <button className="btn-save" type="button" onClick={() => {
                setProductForm({ nombre: '', precio: '', src: '', categoria: '', oferta: false });
                setProductError('');
                setProductMessage('');
              }}>Crear producto</button>
              {productError && <p className="product-feedback product-feedback-error" role="alert">{productError}</p>}
              {productMessage && <p className="product-feedback" role="status">{productMessage}</p>}
              {productForm && (
                <form className="product-form" onSubmit={saveProduct}>
                  <h2>{productForm.id === undefined ? 'Nuevo producto' : 'Editar producto'}</h2>
                  <div className="product-form-grid">
                    <div className="form-group">
                      <label htmlFor="product-name">Nombre</label>
                      <input id="product-name" value={productForm.nombre} onChange={(event) => setProductForm((current) => ({ ...current, nombre: event.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-price">Precio</label>
                      <input id="product-price" type="number" min="1" step="1" value={productForm.precio} onChange={(event) => setProductForm((current) => ({ ...current, precio: event.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="product-category">Categoría</label>
                      <input id="product-category" value={productForm.categoria} onChange={(event) => setProductForm((current) => ({ ...current, categoria: event.target.value }))} required />
                    </div>
                    {productForm.id === undefined && (
                      <div className="form-group">
                        <label htmlFor="product-image">Imagen (URL o ruta)</label>
                        <input id="product-image" type="text" value={productForm.src} onChange={(event) => setProductForm((current) => ({ ...current, src: event.target.value }))} required />
                      </div>
                    )}
                    <label className="product-offer">
                      <input type="checkbox" checked={Boolean(productForm.oferta)} onChange={(event) => setProductForm((current) => ({ ...current, oferta: event.target.checked }))} />
                      Producto en oferta
                    </label>
                  </div>
                  <div className="tabla-acciones">
                    <button className="btn-save" type="submit">Guardar producto</button>
                    <button className="btn-action btn-cancel" type="button" onClick={() => setProductForm(null)}>Cancelar</button>
                  </div>
                </form>
              )}
              <div className="productos-table-wrapper">
                <table className="usuarios-table productos-admin-table">
                  <thead><tr><th>Producto</th><th>Precio</th><th>Categoría</th><th>Oferta</th><th>Acciones</th></tr></thead>
                  <tbody>{products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.nombre}</td>
                      <td>${product.precio.toLocaleString('es-CL')}</td>
                      <td>{product.categoria}</td>
                      <td><OfferBadge product={product} />{!product.oferta && 'No'}</td>
                      <td>
                        <div className="tabla-acciones">
                          <button className="btn-action btn-edit" type="button" onClick={() => beginProductEdit(product)}>Editar</button>
                          <button className="btn-action btn-block" type="button" onClick={() => removeProduct(product)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                {products.length === 0 && <p className="empty-state">No hay productos en el catálogo.</p>}
              </div>
            </div>
          </section>
        )}
        {section === 'permisos' && <section className="admin-section active"><div className="section-header"><h1>Gestión de Permisos</h1><p>Asigna y modifica permisos para cada usuario</p></div><div className="permisos-container"><div className="permisos-selector"><label htmlFor="usuario-select">Selecciona un usuario:</label><select id="usuario-select" value={selectedUser} onChange={(event) => selectUser(event.target.value)}><option value="">-- Selecciona un usuario --</option>{users.map((item) => <option key={item.correo} value={item.correo}>{item.correo} ({item.rol})</option>)}</select></div>{selectedUser && <div className="permisos-list"><h3>Permisos disponibles</h3><div className="permisos-grid">{editablePermissions.map(({ key, label }) => <label className="permiso-item" key={key}><input type="checkbox" checked={Boolean(permissions[key])} onChange={(event) => setPermissions((current) => ({ ...current, [key]: event.target.checked }))} /><span>{label}</span></label>)}</div><button className="btn-save" type="button" onClick={savePermissions}>Guardar Permisos</button></div>}</div></section>}
      </main>
    </div>
  );
}
