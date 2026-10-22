# Farmacia de Raza

Aplicación frontend de una farmacia en línea, construida con React y JavaScript. Permite explorar un catálogo, filtrar productos, crear una cuenta, iniciar sesión, administrar un carrito y simular un proceso de compra. Incluye además un panel de administración para gestionar usuarios y permisos.

> **Alcance:** es un prototipo frontend. No utiliza servidor, base de datos ni pasarela de pago; usuarios, sesión, permisos y carritos se guardan en `localStorage` del navegador. No uses datos personales o contraseñas reales.

## Requisitos y comandos

Necesitas Node.js y npm. Desde la carpeta raíz del proyecto:

```bash
npm install
npm run dev
```

Vite mostrará la dirección local para abrir la aplicación. Para comprobar el proyecto:

```bash
npm test             # Jasmine (lógica) y Vitest (componentes React)
npm run test:jasmine # pruebas Jasmine de datos y persistencia
npm run test:react   # pruebas React con Vitest y Testing Library
npm run test:watch   # Vitest en modo de observación
npm run build        # compilación de producción en dist/
```

## Cómo está organizado

```text
index.html                 Entrada HTML; contiene el elemento #root
vite.config.js             Configuración de Vite y Vitest
jasmine.json               Descubrimiento de las pruebas Jasmine
css/                       Estilos globales y estilos de la versión anterior
src/
  main.jsx                 Arranque de React, router y hojas de estilo
  App.jsx                  Mapa de rutas y composición de páginas
  data.js                  Productos, regiones/comunas y permisos iniciales
  storage.js               Usuarios, sesión, carrito y permisos en localStorage
  styles-react.css         Estilos principales de la interfaz React
  components/              Piezas de interfaz reutilizables
  pages/                   Una pantalla por ruta o flujo
  test/setup.js            Preparación común de Vitest
  *.spec.js                Pruebas unitarias de Jasmine
  **/*.test.jsx            Pruebas de interfaz con Vitest y Testing Library
test/jasmine-setup.js      DOM simulado para Jasmine
```

## Recorrido de la aplicación

1. `index.html` define el contenedor `#root` y carga `/src/main.jsx`.
2. `main.jsx` monta React, activa `BrowserRouter` y carga Bootstrap y los estilos.
3. `App.jsx` selecciona una página según la URL y envuelve todas las páginas con `Layout`.
4. `Layout.jsx` contiene navegación, pie de página, estado de sesión y contador del carrito.
5. Las páginas y componentes leen el catálogo de `data.js` y usan las funciones de `storage.js` para guardar o recuperar datos.

### Rutas

Las rutas se declaran en `src/App.jsx`:

| URL | Página | Para qué sirve |
|---|---|---|
| `/` | `Home` | Portada, productos destacados y video |
| `/productos` | `Products` | Catálogo |
| `/categorias` | `Categories` | Catálogo presentado por categorías |
| `/ofertas` | `Offers` | Selección de productos destacados |
| `/nosotros`, `/blogs`, `/contacto` | `About`, `Blog`, `Contact` | Contenido informativo y contacto |
| `/login`, `/registro` | `Login`, `Register` | Acceso y creación de cuenta |
| `/carrito`, `/checkout` | `Cart`, `Checkout` | Carrito y compra simulada |
| `/compra-exitosa`, `/compra-no-realizada` | `PurchaseSuccess`, `PurchaseFailed` | Resultado del flujo de compra |
| `/admin` | `Admin` | Gestión de usuarios, estados y permisos |

El `*` final de `App.jsx` es la ruta de respaldo para direcciones desconocidas. Para añadir una página, crea un componente en `src/pages/`, impórtalo en `App.jsx` y agrega su `<Route>`. Si debe aparecer en la navegación, agrega también un enlace en `src/components/Layout.jsx`.

## Cambios habituales

### Productos y categorías

Edita el arreglo `productos` en `src/data.js`. Cada elemento usa `id`, `nombre`, `precio`, `src`, `categoria` y `oferta`. Mantén los identificadores únicos. Las imágenes locales están en `src/`; revisa la ruta `src` del objeto al cambiar una imagen. `ProductGrid.jsx` obtiene las categorías del propio arreglo y filtra por nombre (ignorando tildes y mayúsculas) y categoría. `Offers.jsx` actualmente reutiliza el catálogo general, así que el campo `oferta` todavía no limita esa pantalla a productos en oferta.

Para cambiar las regiones y comunas disponibles en el registro, modifica `regiones` en `src/data.js`; las comunas se muestran según la región seleccionada en `Register.jsx`.

### Diseño y estilos

- `src/styles-react.css`: estilos específicos de la interfaz React.
- `css/styles.css`: estilos globales que también se importan al iniciar la app.
- `css/admin.css`: presentación del panel administrativo.
- `css/clicker.css` y estilos de componentes: estilos de otras áreas/versión del proyecto.
- Bootstrap está disponible porque se importa en `src/main.jsx`.

Busca la clase CSS usada en el `className` del componente y cambia su regla en la hoja de estilos correspondiente. Para colores o medidas repetidas, revisa las variables CSS ya existentes antes de crear otras. Evita modificar la estructura HTML si solo necesitas un cambio visual.

### Registro, inicio de sesión y sesión

- `src/pages/Register.jsx` controla campos, región/comuna, confirmación de contraseña y reglas del formulario.
- `src/pages/Login.jsx` procesa el formulario y muestra errores o confirmación.
- `src/storage.js` implementa `registerUser`, `loginUser`, `getSession` y `logoutUser`.
- `src/components/Layout.jsx` escucha los eventos `sessionchange` y `cartchange` para refrescar navegación y contador.

Al cambiar una validación, revisa tanto el formulario como las pruebas de `src/pages/Register.test.jsx`. No guardes credenciales reales en este prototipo: `localStorage` no ofrece la seguridad de una autenticación de servidor.

### Carrito y compra

`ProductCard.jsx` añade productos mediante `addToCart`. `Cart.jsx` lista, elimina y vacía productos; `Checkout.jsx` valida datos de envío, vacía el carrito y navega a la confirmación. `storage.js` guarda un carrito por correo con la clave `carrito_<correo>`. Si cambias el formato del producto o el comportamiento del carrito, actualiza esos consumidores y las pruebas.

### Usuarios, permisos y administrador

`src/pages/Admin.jsx` presenta las secciones del panel y la edición de usuarios. Las operaciones de almacenamiento están en `src/storage.js`: `updateUser`, `getUserState`, `setUserState`, `getUserPermissions` y `saveUserPermissions`. `permisosDefault` en `src/data.js` define la base de permisos. El usuario administrador inicial está declarado como `ADMIN_DEFAULT` en `storage.js`.

Esto es una barrera de interfaz para una demostración, no autorización segura: sin backend, el usuario puede modificar el almacenamiento local desde el navegador. Una aplicación real debe validar roles y permisos en el servidor.

### Imágenes, video y contenido

Las imágenes del catálogo están en `src/`. La portada y el video se construyen en `src/pages/Home.jsx`; el video y subtítulos están en `src/video.mp4` y `src/video-captions.vtt`. Los textos de contenido informativo están en las páginas correspondientes de `src/pages/`.

## Cómo se prueban los cambios

- Jasmine corre pruebas unitarias de `data.js` y `storage.js` en `src/storage.spec.js`. El helper `test/jasmine-setup.js` prepara jsdom y limpia `localStorage`.
- Vitest con Testing Library prueba la experiencia observable de componentes React, por ejemplo `ProductCard`, `Register` y `Admin`. `src/test/setup.js` limpia el almacenamiento y desmonta el DOM entre pruebas.
- Las pruebas usan almacenamiento aislado por caso; no necesitan una base de datos.

Al agregar comportamiento, prueba el resultado que verá el usuario o el estado persistido. Ejecuta `npm test` para correr ambos grupos y `npm run build` para verificar que la aplicación de producción siga compilando.
