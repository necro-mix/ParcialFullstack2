// Admin Panel JavaScript

// Permisos por defecto para nuevos usuarios
const permisosDefault = {
    "ver-productos": true,
    "comprar": true,
    "ver-carrito": true,
    "acceso-admin": false,
    "editar-perfil": true,
    "ver-historial": false
};

// Obtener permisos de un usuario
function obtenerPermisosUsuario(correo) {
    const permisos = localStorage.getItem(`permisos_${correo}`);
    return permisos ? JSON.parse(permisos) : permisosDefault;
}

// Guardar permisos de un usuario
function guardarPermisosUsuario(correo, permisos) {
    localStorage.setItem(`permisos_${correo}`, JSON.stringify(permisos));
}

// Obtener todos los usuarios con sus datos
function obtenerUsuariosConDatos() {
    const usuarios = obtenerTodosLosUsuarios();
    return usuarios.map(usuario => ({
        ...usuario,
        permisos: obtenerPermisosUsuario(usuario.correo),
        estado: obtenerEstadoUsuario(usuario.correo)
    }));
}

// Obtener estado del usuario
function obtenerEstadoUsuario(correo) {
    const estado = localStorage.getItem(`estado_${correo}`);
    return estado || "activo";
}

// Cambiar estado del usuario
function cambiarEstadoUsuario(correo, nuevoEstado) {
    localStorage.setItem(`estado_${correo}`, nuevoEstado);
}

// Mostrar sección del admin
function mostrarSeccion(boton) {
    // Obtener el texto del botón para determinar la sección
    const textoBoton = boton.textContent.trim().toLowerCase();
    
    let seccion = 'dashboard';
    
    if (textoBoton.includes('usuarios')) {
        seccion = 'usuarios';
    } else if (textoBoton.includes('permisos')) {
        seccion = 'permisos';
    } else if (textoBoton.includes('cerrar')) {
        cerrarSesionAdmin();
        return;
    }
    
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    
    // Mostrar la sección seleccionada
    const seccionEl = document.getElementById(`${seccion}-section`);
    if (seccionEl) {
        seccionEl.classList.add('active');
    }
    
    // Actualizar nav activo
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    boton.classList.add('active');
    
    // Cargar datos según la sección
    if (seccion === 'usuarios') {
        cargarTablaUsuarios();
    } else if (seccion === 'permisos') {
        cargarSelectorUsuarios();
    } else if (seccion === 'dashboard') {
        cargarDashboard();
    }
}

// Cargar dashboard
function cargarDashboard() {
    const usuarios = obtenerTodosLosUsuarios();
    const estadosUsuarios = usuarios.map(u => obtenerEstadoUsuario(u.correo));
    
    const totalEl = document.getElementById('total-usuarios');
    const adminsEl = document.getElementById('total-admins');
    const activosEl = document.getElementById('total-activos');
    const bloqueadosEl = document.getElementById('total-bloqueados');
    
    if (totalEl) totalEl.textContent = usuarios.length;
    if (adminsEl) adminsEl.textContent = usuarios.filter(u => u.rol === 'admin').length;
    if (activosEl) activosEl.textContent = estadosUsuarios.filter(e => e === 'activo').length;
    if (bloqueadosEl) bloqueadosEl.textContent = estadosUsuarios.filter(e => e === 'bloqueado').length;
}

// Cargar tabla de usuarios
function cargarTablaUsuarios() {
    const usuarios = obtenerUsuariosConDatos();
    const tbody = document.getElementById('usuarios-tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        const rolBadge = usuario.rol === 'admin' 
            ? '<span class="rol-badge rol-admin">Admin</span>'
            : '<span class="rol-badge rol-usuario">Usuario</span>';
        
        const estadoBadge = usuario.estado === 'activo'
            ? '<span class="estado-badge estado-activo">Activo</span>'
            : '<span class="estado-badge estado-bloqueado">Bloqueado</span>';
        
        const btnTexto = usuario.estado === 'activo' ? 'Bloquear' : 'Desbloquear';
        const btnClass = usuario.estado === 'activo' ? 'btn-block' : 'btn-edit';
        
        fila.innerHTML = `
            <td>${usuario.correo}</td>
            <td>${usuario.run}</td>
            <td>${rolBadge}</td>
            <td>${estadoBadge}</td>
            <td>
                <div class="tabla-acciones">
                    <button class="btn-action btn-edit" onclick="editarUsuario('${usuario.correo}')">Editar</button>
                    <button class="btn-action ${btnClass}" onclick="cambiarEstadoUsuarioUI('${usuario.correo}')">${btnTexto}</button>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Cambiar estado del usuario desde UI
function cambiarEstadoUsuarioUI(correo) {
    const estadoActual = obtenerEstadoUsuario(correo);
    const nuevoEstado = estadoActual === 'activo' ? 'bloqueado' : 'activo';
    cambiarEstadoUsuario(correo, nuevoEstado);
    cargarTablaUsuarios();
    alert(`Usuario ${nuevoEstado === 'activo' ? 'desbloqueado' : 'bloqueado'} exitosamente`);
}

// Editar usuario
function editarUsuario(correo) {
    alert('Función de edición en desarrollo');
}

// Cargar selector de usuarios para permisos
function cargarSelectorUsuarios() {
    const usuarios = obtenerTodosLosUsuarios();
    const select = document.getElementById('usuario-select');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecciona un usuario --</option>';
    
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.correo;
        option.textContent = `${usuario.correo} (${usuario.rol})`;
        select.appendChild(option);
    });
}

// Cargar permisos del usuario seleccionado
function cargarPermisosUsuario() {
    const select = document.getElementById('usuario-select');
    const permisosList = document.getElementById('permisos-list');
    
    if (!select || !permisosList) return;
    
    const correoSeleccionado = select.value;
    
    if (!correoSeleccionado) {
        permisosList.style.display = 'none';
        return;
    }
    
    const permisos = obtenerPermisosUsuario(correoSeleccionado);
    
    // Marcar checkboxes según los permisos
    document.querySelectorAll('.permiso-item input[type="checkbox"]').forEach(checkbox => {
        const permiso = checkbox.name;
        checkbox.checked = permisos[permiso] || false;
    });
    
    permisosList.style.display = 'block';
}

// Actualizar permiso
function actualizarPermiso(checkbox) {
    // Solo se actualiza cuando se guarda
}

// Guardar permisos
function guardarPermisos() {
    const select = document.getElementById('usuario-select');
    
    if (!select) return;
    
    const correoSeleccionado = select.value;
    
    if (!correoSeleccionado) {
        alert('Por favor selecciona un usuario');
        return;
    }
    
    const permisos = {};
    document.querySelectorAll('.permiso-item input[type="checkbox"]').forEach(checkbox => {
        permisos[checkbox.name] = checkbox.checked;
    });
    
    guardarPermisosUsuario(correoSeleccionado, permisos);
    alert('Permisos guardados exitosamente');
}

// Verificar acceso a admin
function verificarAccesoAdmin() {
    if (!estaLogueado()) {
        alert('Debes iniciar sesión para acceder al panel admin');
        window.location.href = 'login.html';
        return false;
    }
    
    if (!esAdmin()) {
        alert('No tienes permisos para acceder al panel admin');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Cerrar sesión del admin
function cerrarSesionAdmin() {
    cerrarSesion();
    alert('Sesión cerrada correctamente');
    window.location.href = 'index.html';
}

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que sea admin
    if (document.querySelector('.admin-container')) {
        if (verificarAccesoAdmin()) {
            const usuarioActual = obtenerUsuarioActual();
            const adminUserName = document.getElementById('admin-user-name');
            if (adminUserName && usuarioActual) {
                adminUserName.textContent = usuarioActual.correo;
            }
            cargarDashboard();
        }
    }
});

