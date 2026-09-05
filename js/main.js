const productosData = [
    { 
        id: 1, 
        nombre: "Clonazepam 0.25 mg (Bioequivalente)", 
        precio: 15000, 
        img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500" 
    },
    { 
        id: 2, 
        nombre: "Preservativo SIMIcondon Pro Pack x12", 
        precio: 3500, 
        img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500" 
    },
    { 
        id: 3, 
        nombre: "Suplemento Nutricional Pediasure 900g", 
        precio: 15000, 
        img: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=500" 
    },
    { 
        id: 4, 
        nombre: "Complejo Multivitamínico Premium", 
        precio: 22990, 
        img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500" 
    },
    { 
        id: 5, 
        nombre: "Pañales Premium Besuper Talla M x80", 
        precio: 18990, 
        img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=500" 
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
                <img src="${prod.img}" alt="${prod.nombre}" loading="lazy">
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