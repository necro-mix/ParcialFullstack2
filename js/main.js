// --- DATOS DE EJEMPLO Y LOCALSTORAGE ---
const productosData = [
    { id: 1, nombre: "clonazepam 10 mg", precio: 1200, img: "https://via.placeholder.com/150" },
    { id: 2, nombre: "SIMIcondon", precio: 800, img: "https://via.placeholder.com/150" },
    { id: 3, nombre: "Besuper (Pañales)", precio: 1599990, img: "https://via.placeholder.com/150" }
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

// --- LISTAR PRODUCTOS Y MANEJO DEL CARRITO ---
function cargarProductos() {
    const container = document.getElementById("products-container");
    if (!container) return;

    container.innerHTML = "";
    productosData.forEach(prod => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <img src="${prod.img}" alt="${prod.nombre}">
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio}</p>
            <button class="btn-add" onclick="agregarAlCarrito(${prod.id})">Añadir al Carrito</button>
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
        alert(`${prod.nombre} añadido al carrito.`);
    }
}

function actualizarCarritoContador() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        cartCount.textContent = carrito.length;
    }
}

// --- CASCADA DE REGIÓN Y COMUNA ---
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

// --- VALIDACIONES DE FORMULARIO ---
function configurarValidacionRegistro() {
    const form = document.getElementById("form-registro");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let esValido = true;

        // Validar RUN
        const runInput = document.getElementById("run");
        const runError = document.getElementById("error-run");
        const runRegex = /^[0-9]{7,8}[0-9kK]{1}$/; // Entre 7 y 9 caracteres sin puntos ni guión
        if (!runRegex.test(runInput.value.trim())) {
            runError.textContent = "RUN inválido. Ingrese entre 7 y 9 caracteres, sin puntos ni guión.";
            esValido = false;
        } else {
            runError.textContent = "";
        }

        // Validar Correo
        const correoInput = document.getElementById("correo");
        const correoError = document.getElementById("error-correo");
        const correoVal = correoInput.value.trim();
        const dominioPermitido = correoVal.endsWith("@duoc.cl") || 
                                 correoVal.endsWith("@profesor.duoc.cl") || 
                                 correoVal.endsWith("@gmail.com");

        if (!correoVal || !dominioPermitido || correoVal.length > 100) {
            correoError.textContent = "El correo debe terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com (Máx 100 caracteres).";
            esValido = false;
        } else {
            correoError.textContent = "";
        }

        if (esValido) {
            alert("Formulario enviado con éxito.");
            form.reset();
        }
    });
}