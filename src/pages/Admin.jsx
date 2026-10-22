import { useMemo, useState } from 'react';
import { getSession, getUserPermissions, getUserState, getUsers, saveUserPermissions, setUserState, updateUser } from '../storage';

const defaultPermissions = {
  'ver-productos': true, comprar: true, 'ver-carrito': true, 'acceso-admin': false, 'editar-perfil': true, 'ver-historial': false,
};
const editablePermissions = [
  { key: 'acceso-admin', label: 'Acceso admin' },
  { key: 'editar-perfil', label: 'Editar perfil' },
];

export default function Admin() {
  const session = getSession();
  const [users, setUsers] = useState(getUsers());
  const [section, setSection] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState('');
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [editForm, setEditForm] = useState(null);
  const user = users.find((item) => item.correo === session?.correo);
  const stats = useMemo(() => ({ total: users.length, admins: users.filter((item) => item.rol === 'admin').length, active: users.filter((item) => getUserState(item.correo) === 'activo').length, blocked: users.filter((item) => getUserState(item.correo) === 'bloqueado').length }), [users]);

  if (!user || user.rol !== 'admin') return <section className="container content-section"><h1>Acceso denied</h1><p>No tienes permisos para acceder al panel administrativo.</p></section>;

  const toggleState = (correo) => {
    const next = getUserState(correo) === 'activo' ? 'bloqueado' : 'activo';
    setUserState(correo, next);
    setUsers([...getUsers()]);
  };

  const selectUser = (correo) => {
    setSelectedUser(correo);
    setPermissions(getUserPermissions(correo));
  };

  const beginEdit = (item) => {
    setEditForm({
      correo: item.correo,
      run: item.run,
      rol: item.rol,
    });
  };

  const saveEdit = () => {
    if (!editForm) return;
    const email = String(editForm.correo || '').trim();
    const run = String(editForm.run || '').trim();
    if (!email || !run) return;

    updateUser(editForm.correo, {
      correo: email,
      run,
      rol: editForm.rol,
    });

    setUsers([...getUsers()]);
    setSelectedUser(email);
    setPermissions(getUserPermissions(email));
    setEditForm(null);
  };

  const savePermissions = () => {
    if (!selectedUser) return;
    saveUserPermissions(selectedUser, permissions);
    setUsers([...getUsers()]);
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header"><h3>Admin Panel</h3><p>{session.correo}</p></div>
        <nav className="sidebar-nav" aria-label="Panel administrativo">
          <button className={`nav-item ${section === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => setSection('dashboard')}>Dashboard</button>
          <button className={`nav-item ${section === 'usuarios' ? 'active' : ''}`} type="button" onClick={() => setSection('usuarios')}>Usuarios</button>
          <button className={`nav-item ${section === 'permisos' ? 'active' : ''}`} type="button" onClick={() => setSection('permisos')}>Permisos</button>
        </nav>
      </aside>
      <main className="admin-main">
        {section === 'dashboard' && <section className="admin-section active"><div className="section-header"><h1>¡HOLA Administrador!</h1><p>Bienvenido al panel de administración de Farmacia de Raza</p></div><div className="dashboard-cards"><div className="stat-card"><h3>Total Usuarios</h3><p className="stat-number">{stats.total}</p></div><div className="stat-card"><h3>Administradores</h3><p className="stat-number">{stats.admins}</p></div><div className="stat-card"><h3>Usuarios Activos</h3><p className="stat-number">{stats.active}</p></div><div className="stat-card"><h3>Usuarios Bloqueados</h3><p className="stat-number">{stats.blocked}</p></div></div></section>}
        {section === 'usuarios' && <section className="admin-section active"><div className="section-header"><h1>Gestión de Usuarios</h1><p>Administra todos los usuarios del sistema</p></div><div className="usuarios-container"><table className="usuarios-table"><thead><tr><th>Correo</th><th>RUN</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{users.map((item) => { const state = getUserState(item.correo); return <tr key={item.correo}><td>{item.correo}</td><td>{item.run}</td><td><span className={`rol-badge rol-${item.rol}`}>{item.rol === 'admin' ? 'Admin' : 'Usuario'}</span></td><td><span className={`estado-badge estado-${state}`}>{state === 'activo' ? 'Activo' : 'Bloqueado'}</span></td><td><div className="tabla-acciones"><button className="btn-action btn-edit" type="button" onClick={() => beginEdit(item)}>Editar</button><button className="btn-action btn-block" type="button" onClick={() => toggleState(item.correo)}>{state === 'activo' ? 'Bloquear' : 'Desbloquear'}</button></div></td></tr>; })}</tbody></table>{editForm && <div className="edit-user-panel"><h3>Editar usuario</h3><div className="edit-user-grid"><div className="form-group"><label htmlFor="admin-edit-correo">Correo</label><input id="admin-edit-correo" value={editForm.correo} onChange={(event) => setEditForm((current) => ({ ...current, correo: event.target.value }))} /></div><div className="form-group"><label htmlFor="admin-edit-run">RUN</label><input id="admin-edit-run" value={editForm.run} onChange={(event) => setEditForm((current) => ({ ...current, run: event.target.value }))} /></div><div className="form-group"><label htmlFor="admin-edit-rol">Rol</label><select id="admin-edit-rol" value={editForm.rol} onChange={(event) => setEditForm((current) => ({ ...current, rol: event.target.value }))}><option value="usuario">Usuario</option><option value="admin">Admin</option></select></div></div><button className="btn-save" type="button" onClick={saveEdit}>Guardar cambios</button></div>}</div></section>}
        {section === 'permisos' && <section className="admin-section active"><div className="section-header"><h1>Gestión de Permisos</h1><p>Asigna y modifica permisos para cada usuario</p></div><div className="permisos-container"><div className="permisos-selector"><label htmlFor="usuario-select">Selecciona un usuario:</label><select id="usuario-select" value={selectedUser} onChange={(event) => selectUser(event.target.value)}><option value="">-- Selecciona un usuario --</option>{users.map((item) => <option key={item.correo} value={item.correo}>{item.correo} ({item.rol})</option>)}</select></div>{selectedUser && <div className="permisos-list"><h3>Permisos disponibles</h3><div className="permisos-grid">{editablePermissions.map(({ key, label }) => <label className="permiso-item" key={key}><input type="checkbox" checked={Boolean(permissions[key])} onChange={(event) => setPermissions((current) => ({ ...current, [key]: event.target.checked }))} /><span>{label}</span></label>)}</div><button className="btn-save" type="button" onClick={savePermissions}>Guardar Permisos</button></div>}</div></section>}
      </main>
    </div>
  );
}
