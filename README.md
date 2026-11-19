# Farmacia de Raza

Aplicación frontend de una farmacia en línea, construida con React y JavaScript. El catálogo, registro, inicio de sesión y panel administrativo consumen la API Django. Las pantallas de carrito, pedidos y contacto quedan deshabilitadas hasta que el backend exponga sus endpoints.

> **Persistencia:** productos y usuarios se consultan y modifican en Django. El navegador conserva únicamente JWT y los datos mínimos de la sesión activa. La API aún no ofrece carrito, pedidos ni envío de contacto; la interfaz no finge guardar esas operaciones.

## Requisitos y comandos

Necesitas Node.js y npm. Desde la carpeta raíz del proyecto:

```bash
npm install
npm run dev
```

Vite mostrará la dirección local para abrir la aplicación. Para comprobar el proyecto:

```bash
npm test                 # Jasmine, Jasmine/Karma y Vitest
npm run test:jasmine     # Jasmine: lógica, datos y persistencia
npm run test:karma       # pruebas Jasmine de componentes en Karma/jsdom
npm run test:react       # pruebas de interacción React con Vitest/Testing Library
npm run test:coverage    # Vitest más informe V8 en coverage/vitest/
npm run test:watch       # Vitest en modo de observación
npm run build            # compilación de producción en dist/
```

## Publicar en GitHub Pages

El proyecto incluye `.github/workflows/deploy.yml`. Cada push a `main` ejecuta las pruebas, compila la aplicación y la publica automáticamente. La app usa `HashRouter` para que las rutas internas sigan funcionando al abrirlas o actualizar el navegador en GitHub Pages.

Debes configurar Pages una sola vez:

1. Sube el proyecto a GitHub, en la rama `main`.
2. Abre el repositorio en GitHub y ve a **Settings → Pages**.
3. En **Build and deployment → Source**, elige **GitHub Actions**.
4. Ve a **Actions**, abre el flujo **Deploy to GitHub Pages** y espera a que la ejecución termine correctamente.
5. Vuelve a **Settings → Pages** y abre la dirección publicada. En este repositorio de proyecto será normalmente `https://necro-mix.github.io/ParcialFullstack2/`.

Para publicar cambios después, haz commit y push a `main`; Actions repetirá la compilación y el despliegue. No subas ni edites `dist/` manualmente: es una carpeta generada durante la compilación. Si renombras el repositorio, el flujo adapta automáticamente la ruta base al nuevo nombre.

## Cómo está organizado

```text
index.html                 Entrada HTML; contiene el elemento #root
vite.config.js             Configuración de Vite y Vitest
jasmine.json               Descubrimiento de las pruebas Jasmine
karma.conf.cjs             Runner Karma y entorno Jasmine/jsdom
css/                       Estilos globales y estilos de la versión anterior
src/
  main.jsx                 Arranque de React, router y hojas de estilo
  App.jsx                  Mapa de rutas y composición de páginas
  api.js                   Cliente REST, normalización, JWT y llamadas al backend
  storage.js               JWT y sesión activa en localStorage
  styles-react.css         Estilos principales de la interfaz React
  components/              Piezas de interfaz reutilizables
  pages/                   Una pantalla por ruta o flujo
  test/setup.js            Preparación común de Vitest
  *.spec.js                Pruebas unitarias de Jasmine
  **/*.karma.spec.js       Pruebas de componentes con Jasmine y Karma
  **/*.test.jsx            Pruebas de interfaz con Vitest y Testing Library
test/jasmine-setup.js      DOM simulado para Jasmine
```

## Recorrido de la aplicación

1. `index.html` define el contenedor `#root` y carga `/src/main.jsx`.
2. `main.jsx` monta React, activa `HashRouter` y carga Bootstrap y los estilos.
3. `App.jsx` selecciona una página según la URL y envuelve todas las páginas con `Layout`.
4. `Layout.jsx` contiene navegación, pie de página y estado de sesión.
5. `api.js` consulta y modifica los recursos remotos; `storage.js` mantiene solo la sesión local.

## Conectar la API Django

El cliente apunta por defecto a `http://192.168.1.94:12696/api/`. `.env.example` contiene esa misma URL; para cambiarla, copia el archivo a `.env.local`, modifica `VITE_API_BASE_URL` y reinicia Vite. El catálogo, ofertas, registro, login y panel admin usan siempre el backend: no hay fallback de usuarios o productos en `localStorage`. Los errores remotos se muestran sin ocultarlos con datos locales.

El cliente requiere el contrato de endpoints, campos y JWT documentado en [DJANGO_API_PROMPT.md](./DJANGO_API_PROMPT.md). Configura CORS en Django para el origen del frontend. Los roles y permisos deben validarse siempre en el servidor. El servidor usa HTTP en la red local: no lo expongas a Internet ni uses credenciales reales hasta habilitar HTTPS. Los JWT se guardan localmente según el requisito de sesión; `localStorage` es accesible para JavaScript y requiere protección contra XSS.

### Rutas

Las rutas se declaran en `src/App.jsx`:

| URL | Página | Para qué sirve |
|---|---|---|
| `/` | `Home` | Portada, productos destacados y video |
| `/productos` | `Products` | Catálogo |
| `/categorias` | `Categories` | Catálogo presentado por categorías |
| `/ofertas` | `Offers` | Productos remotos con `is_offer=true` |
| `/nosotros`, `/blogs`, `/contacto` | `About`, `Blog`, `Contact` | Contenido informativo y contacto |
| `/login`, `/registro` | `Login`, `Register` | Acceso y creación de cuenta |
| `/carrito`, `/checkout` | `Cart`, `Checkout` | Informan que faltan endpoints de carrito/pedidos |
| `/compra-exitosa`, `/compra-no-realizada` | `PurchaseSuccess`, `PurchaseFailed` | No confirma pedidos: el endpoint todavía no existe |
| `/admin` | `Admin` | Gestión de usuarios, estados y permisos |

El `*` final de `App.jsx` es la ruta de respaldo para direcciones desconocidas. Para añadir una página, crea un componente en `src/pages/`, impórtalo en `App.jsx` y agrega su `<Route>`. Si debe aparecer en la navegación, agrega también un enlace en `src/components/Layout.jsx`.

## Cambios habituales

### Productos y categorías

Los productos se consultan desde `GET /api/products/` y se gestionan desde el panel admin. La API ya contiene los siete productos iniciales migrados y verificados. El frontend conserva los archivos de imagen en `public/media/` y la API guarda sus rutas `/media/...`; no se proporcionó un endpoint de carga de archivos.

El registro envía región y comuna como texto a la API; no hay un endpoint de catálogo geográfico disponible.

### Diseño y estilos

- `src/styles-react.css`: estilos específicos de la interfaz React.
- `css/styles.css`: estilos globales que también se importan al iniciar la app.
- `css/admin.css`: presentación del panel administrativo.
- `css/clicker.css` y estilos de componentes: estilos de otras áreas/versión del proyecto.
- Bootstrap 5 se importa en `src/main.jsx`; el catálogo usa su grilla responsiva (`row`, `col-sm-6`, `col-lg-4`, `col-xl-3`) y los estilos de marca complementan sus componentes.

Busca la clase CSS usada en el `className` del componente y cambia su regla en la hoja de estilos correspondiente. Para colores o medidas repetidas, revisa las variables CSS ya existentes antes de crear otras. Evita modificar la estructura HTML si solo necesitas un cambio visual.

### Registro, inicio de sesión y sesión

- `src/pages/Register.jsx` envía el alta a `POST /api/auth/register/`.
- `src/pages/Login.jsx` autentica contra `POST /api/auth/login/`; `api.js` guarda los JWT y renueva el access token mediante `/api/auth/refresh/`.
- `src/storage.js` conserva solo tokens y sesión local para la navegación.
- `src/components/Layout.jsx` escucha los cambios de sesión.

Al cambiar una validación, revisa tanto el formulario como las pruebas de `src/pages/Register.test.jsx`. El backend debe volver a validar todas las entradas y contraseñas.

### Carrito y compra

La API actual no tiene rutas de carrito, checkout/pedidos ni contacto. Por eso las compras y el envío del formulario de contacto están deshabilitados y no se almacenan en el navegador. Para habilitarlos, primero agrega al backend endpoints autenticados para carrito (listar/agregar/eliminar/vaciar) y pedidos (crear/consultar), además del endpoint de contacto si se requiere; luego conecta la UI a esos contratos.

### Usuarios, permisos y administrador

`src/pages/Admin.jsx` consulta y modifica usuarios, estados, permisos y productos mediante los endpoints `/api/users/` y `/api/products/`. La API es la fuente de verdad y debe aplicar roles y restricciones de acceso.

La vista admin usa el rol de la sesión solo para navegación; no sustituye la autorización del servidor. No hay un usuario admin predeterminado en el frontend.

### Imágenes, video y contenido

Las imágenes y archivos del video publicados están en `public/media/`; Vite los copia sin cambios al sitio final. La portada y el video se muestran desde `src/pages/Home.jsx`. Los textos de contenido informativo están en las páginas correspondientes de `src/pages/`.

## Cómo se prueban los cambios

- Jasmine verifica la persistencia mínima de sesión en `src/storage.spec.js`.
- Jasmine con Karma prueba los componentes de catálogo con respuestas simuladas de la API en `src/components/Catalog.karma.spec.js`.
- Vitest con Testing Library prueba interacciones de `ProductCard`, `ProductGrid`, `Register`, `Admin`, `Layout` y `Cart`. `src/test/setup.js` limpia el almacenamiento y desmonta el DOM entre pruebas.
- Las pruebas usan respuestas HTTP simuladas; no modifican la base de datos real.

Al agregar comportamiento, prueba el resultado que verá el usuario o el estado persistido. Ejecuta `npm test` para correr los tres grupos, `npm run test:coverage` para generar el informe de cobertura y `npm run build` para verificar la aplicación de producción.
