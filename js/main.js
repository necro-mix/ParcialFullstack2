const productosData = [
    { 
        id: 1, 
        nombre: "Clonazepam 0.25 mg (Bioequivalente)", 
        precio: 15000, 
        src: "../src/clona.png"
    },
    { 
        id: 2, 
        nombre: "Preservativo  masculino", 
        precio: 3500, 
        src: "../src/condon1.png"
    },
    { 
        id: 3, 
        nombre: "Preservativo SIMIcondon", 
        precio: 3500, 
        src: "../src/simicondon.png"
    },
    { 
        id: 4, 
        nombre: "Suplemento Nutricional Pediasure 900g", 
        precio: 15000,
        src: "../src/pediasure.png"
    },
    {
        id: 5, 
        nombre: "Pañales para adulto mayor", 
        precio: 22990, 
        src: "../src/pañalespawelito.png"
    },
    { 
        id: 6, 
        nombre: "Paracetamol 500 mg", 
        precio: 1000, 
        src: "../src/paracetamol.png"
    },
    { 
        id: 7, 
        nombre: "Pañales Premium Besuper  (son  mas  convenientes los condones)", 
        precio: 9999999, 
        src: "../src/pañales.png"
    }
];

const regionesComunas = [
    { region: "Región Metropolitana", comunas: ["Santiago", "Ñuñoa", "Maipú", "Providencia"] },
    { region: "Valparaíso", comunas: ["Valparaíso", "Viña del Mar", "Quilpué"] }
];

// ====== SISTEMA DE SESIÓN Y USUARIOS ======
function obtenerUsuarioActual() {
    const sesion = localStorage.getItem("sesionActiva");
    return sesion ? JSON.parse(sesion) : null;
}

function estaLogueado() {
    return obtenerUsuarioActual() !== null;
}

function cerrarSesion() {
    localStorage.removeItem("sesionActiva");
}

function obtenerTodosLosUsuarios() {
    const usuarios = localStorage.getItem("usuarios");
    return usuarios ? JSON.parse(usuarios) : [];
}

function guardarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function usuarioExiste(correo) {
    const usuarios = obtenerTodosLosUsuarios();
    return usuarios.some(u => u.correo === correo);
}

function registrarUsuario(run, correo, contrasena) {
    if (usuarioExiste(correo)) {
        return { exito: false, mensaje: "El correo ya está registrado." };
    }
    
    const usuarios = obtenerTodosLosUsuarios();
    usuarios.push({ 
        run, 
        correo, 
        contrasena,
        rol: "usuario"  // Todos los nuevos usuarios son usuarios normales
    });
    guardarUsuarios(usuarios);
    return { exito: true, mensaje: "Usuario registrado exitosamente." };
}

function iniciarSesion(correoInput, contrasenaInput) {
    const usuarios = obtenerTodosLosUsuarios();
    const usuario = usuarios.find(u => u.correo === correoInput || u.run === correoInput);
    
    if (!usuario) {
        return { exito: false, mensaje: "Usuario no encontrado." };
    }
    
    if (usuario.contrasena !== contrasenaInput) {
        return { exito: false, mensaje: "Contraseña incorrecta." };
    }
    
    // Guardar la sesión activa
    localStorage.setItem("sesionActiva", JSON.stringify({
        correo: usuario.correo,
        run: usuario.run
    }));
    
    return { exito: true, mensaje: "Inicio de sesión exitoso." };
}

// ====== FUNCIONES DE CARRITO POR USUARIO ======
function obtenerKeyCarrito() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return null;
    return `carrito_${usuario.correo}`;
}

function obtenerCarritoActual() {
    const key = obtenerKeyCarrito();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
}

function guardarCarritoActual(carrito) {
    const key = obtenerKeyCarrito();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(carrito));
}

// ====== SISTEMA DE ADMIN ======
const ADMIN_DEFAULT = {
    correo: "admin@duoc.cl",
    run: "11111111K",
    contrasena: "Admin123",
    rol: "admin"
};

function inicializarAdminDefault() {
    const usuarios = obtenerTodosLosUsuarios();
    const adminExiste = usuarios.some(u => u.correo === ADMIN_DEFAULT.correo);
    
    if (!adminExiste) {
        usuarios.push(ADMIN_DEFAULT);
        guardarUsuarios(usuarios);
    }
}

function esAdmin() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;
    
    const usuarios = obtenerTodosLosUsuarios();
    const usuarioData = usuarios.find(u => u.correo === usuario.correo);
    return usuarioData?.rol === "admin";
}

function mostrarOcultarAdminLink() {
    const adminLink = document.getElementById("admin-link");
    if (adminLink) {
        adminLink.style.display = esAdmin() ? "inline-block" : "none";
    }
}

// ====== FUNCIONES DE LOGOUT ======
function logout() {
    cerrarSesion();
    mostrarOcultarLogout();
    mostrarOcultarAdminLink();
    alert("Sesión cerrada correctamente");
    window.location.href = "index.html";
}

function mostrarOcultarLogout() {
    const logoutBtn = document.getElementById("nav-logout");
    const loginLink = document.getElementById("nav-login");
    const registroLink = document.getElementById("nav-registro");
    
    const logueado = estaLogueado();
    
    if (logoutBtn) {
        logoutBtn.style.display = logueado ? "inline" : "none";
    }
    if (loginLink) {
        loginLink.style.display = logueado ? "none" : "inline";
    }
    if (registroLink) {
        registroLink.style.display = logueado ? "none" : "inline";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarAdminDefault();
    actualizarCarritoContador();
    cargarProductos();
    configurarBusqueda();
    cargarCarrito();
    cargarRegiones();
    configurarValidacionRegistro();
    configurarFormulariosAdicionales();
    configurarClicker();
    mostrarOcultarAdminLink();
    mostrarOcultarLogout();
});

// EFECTO DESFASE HACIA ARRIBA EN SCROLLDOWN
window.addEventListener("scroll", () => {
    const bg = document.getElementById("hero-bg");
    if (bg) {
        const scrolled = window.scrollY;
        bg.style.transform = `translateY(-${scrolled * 0.45}px)`;
    }
});

// --- RENDERIZADO DE PRODUCTOS (SIN ETIQUETAS DE DISPONIBILIDAD) ---
function cargarProductos(termino = "") {
    const container = document.getElementById("products-container");
    if (!container) return;

    const busqueda = termino
        .trim()
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const productosFiltrados = productosData.filter(prod => {
        const nombre = prod.nombre
            .toLocaleLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(busqueda);
    });

    container.innerHTML = "";
    productosFiltrados.forEach(prod => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${prod.src}" alt="${prod.nombre}">
            </div>
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio.toLocaleString('es-CL')}</p>
            <button class="btn-add" onclick="agregarAlCarrito(${prod.id}, this)">
                <svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Añadir al Carrito
            </button>
        `;
        container.appendChild(div);
    });

    if (productosFiltrados.length === 0) {
        container.innerHTML = "<p>No se encontraron productos para esa búsqueda.</p>";
    }
}

function configurarBusqueda() {
    const input = document.getElementById("product-search-input");
    const button = document.getElementById("product-search-button");
    const container = document.getElementById("products-container");

    if (!input || !button || !container) return;

    const buscar = () => {
        cargarProductos(input.value);
        container.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    button.addEventListener("click", buscar);
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") buscar();
    });
}

function configurarClicker() {
    const boton = document.getElementById("clicker");
    const contador = document.getElementById("clicker-count");

    if (!boton || !contador) return;

    let clicks = Number(localStorage.getItem("clicker")) || 0;
    contador.textContent = clicks;

    boton.addEventListener("click", () => {
        clicks++;
        contador.textContent = clicks;
        localStorage.setItem("clicker", clicks);
     });
}

function agregarAlCarrito(id, boton) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = "login.html";
        return;
    }
    
    let carrito = obtenerCarritoActual();
    const prod = productosData.find(p => p.id === id);
    if (prod) {
        carrito.push(prod);
        guardarCarritoActual(carrito);
        actualizarCarritoContador();
        
        // Cambiar color del botón a verde por 1 segundo
        if (boton) {
            const colorOriginal = window.getComputedStyle(boton).backgroundColor;
            boton.style.backgroundColor = "#4CAF50";
            boton.style.transition = "background-color 0.3s ease";
            setTimeout(() => {
                boton.style.backgroundColor = colorOriginal;
            }, 1000);
        }
    }
}

function actualizarCarritoContador() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        const carrito = obtenerCarritoActual();
        cartCount.textContent = carrito.length;
    }
}

function cargarCarrito() {
    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const emptyMessage = document.getElementById("cart-empty");
    const clearButton = document.getElementById("clear-all");

    if (!container || !totalElement || !emptyMessage || !clearButton) return;

    const carrito = obtenerCarritoActual();
    container.innerHTML = "";
    let total = 0;

    carrito.forEach((producto, index) => {
        const productoCatalogo = productosData.find(item => item.id === producto.id);
        const imagenProducto = productoCatalogo ? productoCatalogo.src : producto.src;
        total += producto.precio;
        const item = document.createElement("article");
        item.className = "cart-item";
        item.innerHTML = `
            <img src="${imagenProducto}" alt="${producto.nombre}">
            <div class="cart-item-info">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio.toLocaleString("es-CL")}</p>
            </div>
            <button class="cart-remove" type="button" data-index="${index}">Eliminar</button>
        `;
        container.appendChild(item);
    });

    totalElement.textContent = `$${total.toLocaleString("es-CL")}`;
    emptyMessage.hidden = carrito.length > 0;
    clearButton.disabled = carrito.length === 0;

    container.querySelectorAll(".cart-remove").forEach(button => {
        button.addEventListener("click", () => {
            const productos = obtenerCarritoActual();
            productos.splice(Number(button.dataset.index), 1);
            guardarCarritoActual(productos);
            actualizarCarritoContador();
            cargarCarrito();
        });
    });

    clearButton.onclick = clearAllCarrito;
}

function clearAllCarrito() {
    const key = obtenerKeyCarrito();
    if (key) {
        localStorage.removeItem(key);
    }
    actualizarCarritoContador();

    if (document.getElementById("cart-items")) {
        cargarCarrito();
    }
}

function cargarRegiones() {
    const selectRegion = document.getElementById("region");
    const selectComuna = document.getElementById("comuna");
    if (!selectRegion || !selectComuna) return;

    regionesComunas.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.region;
        opt.textContent = item.region;
        selectRegion.appendChild(opt);
    });

    selectRegion.addEventListener("change", (e) => {
        const regSeleccionada = e.target.value;
        selectComuna.innerHTML = '<option value="">-- Seleccione una Comuna --</option>';
        
        if (regSeleccionada) {
            const data = regionesComunas.find(r => r.region === regSeleccionada);
            if (data) {
                data.comunas.forEach(comuna => {
                    const opt = document.createElement("option");
                    opt.value = comuna;
                    opt.textContent = comuna;
                    selectComuna.appendChild(opt);
                });
                selectComuna.disabled = false;
            }
        } else {
            selectComuna.disabled = true;
        }
    });
}

function configurarValidacionRegistro() {
    const form = document.getElementById("form-registro");
    if (!form) return;

    const contrasenaInput = document.getElementById("contrasena");
    const confirmarContrasenaInput = document.getElementById("confirmar-contrasena");
    const confirmarContrasenaError = document.getElementById("error-confirmar-contrasena");
    const mostrarContrasena = document.getElementById("mostrar-contrasena");

    mostrarContrasena.addEventListener("click", () => {
        const mostrar = contrasenaInput.type === "password";
        contrasenaInput.type = mostrar ? "text" : "password";
        mostrarContrasena.textContent = mostrar ? "Ocultar contraseña" : "Mostrar contraseña";
        mostrarContrasena.setAttribute("aria-pressed", String(mostrar));
    });

    const validarContrasenas = () => {
        const coinciden = contrasenaInput.value === confirmarContrasenaInput.value;
        const confirmacionIncompleta = confirmarContrasenaInput.value.length === 0;
        const mensaje = confirmacionIncompleta || coinciden
            ? ""
            : "Las contraseñas no coinciden. Usa una contraseña igual en ambos campos.";

        confirmarContrasenaInput.setCustomValidity(mensaje);
        confirmarContrasenaError.textContent = mensaje;
    };

    contrasenaInput.addEventListener("input", validarContrasenas);
    confirmarContrasenaInput.addEventListener("input", validarContrasenas);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let esValido = true;

        validarContrasenas();

        if (!form.checkValidity()) {
            form.reportValidity();
            esValido = false;
        }

        const runInput = document.getElementById("run");
        const runError = document.getElementById("error-run");
        const runRegex = /^\d{7,8}[0-9kK]$/;
        if (!runRegex.test(runInput.value.trim())) {
            runError.textContent = "RUN inválido. Ingrese entre 7 y 9 caracteres sin puntos ni guión.";
            esValido = false;
        } else {
            runError.textContent = "";
        }

        const correoInput = document.getElementById("correo");
        const correoError = document.getElementById("error-correo");
        const correoVal = correoInput.value.trim();
        const dominioPermitido = correoVal.endsWith("@duoc.cl") || 
                                 correoVal.endsWith("@profesor.duoc.cl") || 
                                 correoVal.endsWith("@gmail.com");

        if (!correoVal || !dominioPermitido || correoVal.length > 100) {
            correoError.textContent = "El correo debe terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.";
            esValido = false;
        } else {
            correoError.textContent = "";
        }

        const contrasenaError = document.getElementById("error-contrasena");
        if (contrasenaInput.validity.tooShort || contrasenaInput.validity.tooLong) {
            contrasenaError.textContent = "La contraseña debe tener entre 4 y 10 caracteres.";
            esValido = false;
        } else {
            contrasenaError.textContent = "";
        }

        if (esValido) {
            const resultado = registrarUsuario(
                runInput.value.trim(),
                correoInput.value.trim(),
                contrasenaInput.value.trim()
            );
            
            if (resultado.exito) {
                const feedbackEl = document.getElementById("error-correo");
                feedbackEl.textContent = resultado.mensaje;
                feedbackEl.classList.remove("error-msg");
                feedbackEl.classList.add("success-msg");
                form.reset();
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                const feedbackEl = document.getElementById("error-correo");
                feedbackEl.textContent = resultado.mensaje;
                feedbackEl.classList.add("error-msg");
            }
        }
    });
}

function configurarFormulariosAdicionales() {
    const contacto = document.getElementById("form-contacto");
    const contactoFeedback = document.getElementById("contacto-feedback");
    if (contacto && contactoFeedback) {
        contacto.addEventListener("submit", event => {
            event.preventDefault();
            if (!contacto.checkValidity()) {
                contactoFeedback.textContent = "Completa todos los campos antes de enviar la consulta.";
                contactoFeedback.classList.add("error-msg");
                contacto.reportValidity();
                return;
            }
            contactoFeedback.textContent = "Tu consulta fue enviada correctamente.";
            contactoFeedback.classList.remove("error-msg");
            contacto.reset();
        });
    }

    const login = document.getElementById("form-login");
    const loginFeedback = document.getElementById("login-feedback");
    if (login && loginFeedback) {
        login.addEventListener("submit", event => {
            event.preventDefault();

            const correoInput = document.getElementById("login-correo");
            const contrasenaInput = document.getElementById("login-clave");
            
            if (!correoInput || !contrasenaInput) {
                loginFeedback.textContent = "Error en el formulario. Recarga la página.";
                loginFeedback.classList.add("error-msg");
                return;
            }

            const resultado = iniciarSesion(correoInput.value.trim(), contrasenaInput.value.trim());

            if (resultado.exito) {
                loginFeedback.textContent = "Inicio de sesión exitoso. Redirigiendo...";
                loginFeedback.classList.remove("error-msg");
                loginFeedback.classList.add("success-msg");
                login.reset();
                setTimeout(() => {
                    mostrarOcultarAdminLink();
                    mostrarOcultarLogout();
                    window.location.href = "index.html";
                }, 1500);
            } else {
                loginFeedback.textContent = resultado.mensaje;
                loginFeedback.classList.add("error-msg");
            }
        });
    }
}