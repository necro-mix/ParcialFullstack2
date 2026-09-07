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

document.addEventListener("DOMContentLoaded", () => {
    actualizarCarritoContador();
    cargarProductos();
    configurarBusqueda();
    cargarCarrito();
    cargarRegiones();
    configurarValidacionRegistro();
    configurarFormulariosAdicionales();
    configurarClicker();
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
            <button class="btn-add" onclick="agregarAlCarrito(${prod.id})">
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

function agregarAlCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const prod = productosData.find(p => p.id === id);
    if (prod) {
        carrito.push(prod);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarCarritoContador();
    }
}

function actualizarCarritoContador() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        cartCount.textContent = carrito.length;
    }
}

function cargarCarrito() {
    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const emptyMessage = document.getElementById("cart-empty");
    const clearButton = document.getElementById("clear-all");

    if (!container || !totalElement || !emptyMessage || !clearButton) return;

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
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
            const productos = JSON.parse(localStorage.getItem("carrito")) || [];
            productos.splice(Number(button.dataset.index), 1);
            localStorage.setItem("carrito", JSON.stringify(productos));
            actualizarCarritoContador();
            cargarCarrito();
        });
    });

    clearButton.onclick = clearAllCarrito;
}

function clearAllCarrito() {
    localStorage.removeItem("carrito");
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
        const runRegex = /^[0-9]{7,8}[0-9kK]{1}$/;
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
            alert("Cuenta registrada con éxito.");
            form.reset();
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
            const correo = document.getElementById("login-correo");
            if (!login.checkValidity()) {
                loginFeedback.textContent = "Ingresa un correo válido y una contraseña de 4 a 10 caracteres.";
                loginFeedback.classList.add("error-msg");
                login.reportValidity();
                return;
            }
            if (!correo.value.endsWith("@duoc.cl") && !correo.value.endsWith("@profesor.duoc.cl") && !correo.value.endsWith("@gmail.com")) {
                loginFeedback.textContent = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
                loginFeedback.classList.add("error-msg");
                return;
            }
            loginFeedback.textContent = "Inicio de sesión validado correctamente.";
            loginFeedback.classList.remove("error-msg");
        });
    }
}
