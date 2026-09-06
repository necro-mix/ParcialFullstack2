const productosData = [
    { 
        id: 1, 
        nombre: "Clonazepam 0.25 mg (Bioequivalente)", 
        precio: 15000, 
        src: "src/clona.png" 
    },
    { 
        id: 2, 
        nombre: "Preservativo  masculino", 
        precio: 3500, 
        src: "src/condon1.png" 
    },
    { 
        id: 3, 
        nombre: "Preservativo SIMIcondon", 
        precio: 3500, 
        src: "src/simicondon.png" 
    },
    { 
        id: 4, 
        nombre: "Suplemento Nutricional Pediasure 900g", 
        precio: 15000,
        src: "src/pediasure.png" 
    },
    {
        id: 5, 
        nombre: "Pañales para adulto mayor", 
        precio: 22990, 
        src: "src/pañalespawelito.png" 
    },
    { 
        id: 6, 
        nombre: "Paracetamol 500 mg", 
        precio: 22990, 
        src: "src/paracetamol.png" 
    },
    { 
        id: 7, 
        nombre: "Pañales Premium Besuper", 
        precio: 18990, 
        src: "src/pañales.png" 
    }
];

const regionesComunas = [
    { region: "Región Metropolitana", comunas: ["Santiago", "Ñuñoa", "Maipú", "Providencia"] },
    { region: "Valparaíso", comunas: ["Valparaíso", "Viña del Mar", "Quilpué"] }
];

document.addEventListener("DOMContentLoaded", () => {
    actualizarCarritoContador();
    cargarProductos();
    cargarRegiones();
    configurarValidacionRegistro();
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
function cargarProductos() {
    const container = document.getElementById("products-container");
    if (!container) return;

    container.innerHTML = "";
    productosData.forEach(prod => {
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

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let esValido = true;

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

        if (esValido) {
            alert("Cuenta registrada con éxito.");
            form.reset();
        }
    });
}