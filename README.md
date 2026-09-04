# Farmacia De RazaRaza - Evaluación Parcial 1

Este proyecto consiste en que tanto puede hacer un estudiante de informatica del duoc en 1 noche junto a claudio (El gratis), este proyecto está desarrollado segun rubrica y es una mezcla de html css y javascript (PorFavorDejenDeConfundirAlNiñoConJavaQueEsElTioALcholico)

---

## Descripcion

El sistema esta organizado en dos grandes secciones:

1. **Seccion Tienda**: Vista publica accesible por clientes donde se incluye la página principal, catalogo de productos, detalle de ítems, blog de noticias, formulario de contacto, registro de usuarios e inicio de sesión.


2. **Seccion Administrador**: Interfaz de gestión protegida con menú lateral para administrar productos y usuarios, visualizar listados en tablas y gestionar roles del sistema (Administrador, Vendedor y Cliente).



---

## Directorios

```text
mitienda/
├── index.html                # Página principal (Home)[cite: 2]
├── productos.html            # Catálogo general de productos[cite: 2]
├── detalle-producto.html     # Detalle individual del producto[cite: 2]
├── nosotros.html             # Información sobre la empresa y desarrolladores[cite: 2]
├── blogs.html                # Listado de blogs/noticias[cite: 2]
├── detalle-blog1.html        # Artículo informativo 1[cite: 2]
├── detalle-blog2.html        # Artículo informativo 2[cite: 2]
├── contacto.html             # Formulario de contacto[cite: 2]
├── login.html                # Inicio de sesión[cite: 2]
├── registro.html             # Registro público de usuarios[cite: 2]
├── admin/
│   ├── index.html            # Panel principal de administración[cite: 2]
│   ├── usuarios.html         # Listado/Tabla de usuarios[cite: 2]
│   ├── nuevo-usuario.html    # Formulario para crear o editar usuarios[cite: 2]
│   ├── productos.html        # Listado/Tabla de productos[cite: 2]
│   └── nuevo-producto.html   # Formulario para crear o editar productos[cite: 2]
├── css/
│   └── styles.css            # Estilos globales responsivos y de contraste medio[cite: 2]
└── js/
    └── main.js               # Validaciones de formularios, cascada y LocalStorage[cite: 2]

```

---

## Reglas del Negocio y Validaciones (JavaScript)

Las reglas de negocio implementadas en los formularios cubren las siguientes restricciones:

* **Registro de Usuario y Administrador de Usuarios**:
* **RUT**: Campo requerido, sin puntos ni guión (ej: `19011022K`), de entre 7 y 9 caracteres.


* **Nombre y Apellidos**: Obligatorios; máximo 50 caracteres para el nombre y 100 para los apellidos.


* **Correo Electrónico**: Requiere pertenecer a los dominios `@duoc.cl`, `@profesor.duoc.cl` o `@gmail.com` (máximo 100 caracteres).


* **Región y Comuna**: Cascada en JavaScript que activa y carga dinámicamente las comunas según la región seleccionada.


* **Dirección**: Requerida (máximo 300 caracteres).




* **Inicio de Sesion**:
* **Correo**: Requerido, validado con dominios `@duoc.cl`, `@profesor.duoc.cl` y `@gmail.com`.


* **Contraseña**: Requerida, con una extensión entre 4 y 10 caracteres.




* **Formulario de Contacto**:
* **Nombre**: Requerido (máx. 100 caracteres).


* **Correo**: Valida dominios permitidos (máx. 100 caracteres).


* **Comentario**: Requerido (máx. 500 caracteres).




* **Mantenedor de Productos**:
* **Código**: Requerido, mínimo 3 caracteres.


* **Nombre**: Requerido (máx. 100 caracteres).


* **Precio y Stock**: Requeridos, valores numéricos mayores o iguales a 0.




* **Carrito de Compras**:
* Los productos añadidos se persisten mediante `localStorage` para mantener la información al recargar la página.


---

## Instalación y Ejecución

1. Clona el repositorio desde GitHub:
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git

```


2. Accede a la carpeta del proyecto:
```bash
cd tu-repositorio

```


3. Abre el archivo `index.html` en el navegador de tu preferencia o utiliza una extensión de servidor local como *Live Server* en Visual Studio Code.

---

## Integrantes del Equipo

* **Samuel Jaraquemada.**

* **Patricio **pon tu apellido aqui plsssss**.**
