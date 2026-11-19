# Prompt para construir la API Django de Farmacia de Raza

Copia este prompt en la IA que implementará el backend:

---

Actúa como desarrollador/a senior de Django y Django REST Framework. Mantén y amplía una API REST para el frontend existente **Farmacia de Raza**, una aplicación React 18 + Vite en español. La API disponible está en `http://192.168.1.94:12696/api/` y ya implementa autenticación JWT, usuarios, permisos y productos según el contrato de este documento. Antes de cambiar archivos, inspecciona el backend y sus dependencias; conserva su estructura, datos y comportamiento. No hagas migraciones destructivas ni cambies rutas/campos consumidos por el frontend sin actualizar ambos lados.

## Alcance funcional existente

El cliente tiene un catálogo de productos con nombre, precio, imagen, categoría y oferta; registro e inicio de sesión; y un panel administrativo que lista usuarios, edita correo/RUN/rol, bloquea y desbloquea cuentas, administra permisos, y crea/edita/elimina productos. Actualmente el backend no tiene endpoints de carrito, pedidos/checkout, contacto, regiones ni carga de imágenes. El frontend no persiste esos datos localmente y mantiene esas funciones deshabilitadas. No afirmes que una compra/consulta se guardó sin una respuesta satisfactoria de la API. Si se amplía el backend para esas funciones, acuerda primero sus rutas, autorización, modelos y respuestas y documenta el contrato antes de habilitarlas en el cliente.

Los roles son `usuario`, `moderador` y `admin`. El panel permite a administradores y moderadores gestionar usuarios/productos; solo administradores administran permisos y pueden asignar el rol admin. Un moderador no puede editar ni bloquear administradores ni asignar el rol admin. Estas reglas deben validarse en el servidor, no confiar en las restricciones de la interfaz.

## Requisitos técnicos y de seguridad

- Usa Django REST Framework y JWT con `djangorestframework-simplejwt`.
- Usa una identidad de usuario basada en email único (un modelo de usuario personalizado si el proyecto aún no tiene usuarios/migraciones incompatibles). Nunca devuelvas contraseñas, hashes, tokens de refresh en listados ni datos sensibles no requeridos.
- Configura CORS para el origen del frontend por variable de entorno; no uses `CORS_ALLOW_ALL_ORIGINS` en producción. Lee secretos y configuración sensible desde variables de entorno.
- Valida en servidor emails, RUN, campos requeridos, precios positivos, rutas/URLs de imágenes, roles permitidos y permisos. Usa contraseñas seguras y validadores Django; nunca almacenes contraseñas en texto plano.
- El formulario actual permite los dominios `duoc.cl`, `profesor.duoc.cl` y `gmail.com`; conserva esta regla también en el backend para evitar que se omita llamando directamente a la API. El frontend exige contraseñas de 8 a 128 caracteres y Django debe aplicar sus propios validadores.
- Los productos publicados pueden consultarse sin autenticación. Mutaciones de productos requieren usuario autenticado con rol `admin` o `moderador`.
- Registro e inicio de sesión son públicos. En registro fuerza `role=usuario` y `is_active=true`; ignora/rechaza cualquier rol enviado por el cliente. Un usuario inactivo no debe autenticarse.
- El listado y edición de usuarios requieren autenticación de rol `admin` o `moderador`. Aplica en el servidor las restricciones de jerarquía anteriores y evita que un moderador cambie roles de admin. Solo admin puede crear/cambiar permisos.
- Devuelve errores en formato DRF (`{"detail":"..."}` o errores por campo) con códigos HTTP correctos: 400 validación, 401 sin sesión, 403 sin autorización, 404 inexistente, 409 para conflictos si corresponde.
- Añade paginación DRF compatible con el cliente (`{"count": n, "next": null, "previous": null, "results": [...]}`), manteniendo el orden estable. Si no usas paginación, devuelve arreglos JSON.
- Documenta ejecución, variables, migraciones, creación de admin y CORS. Añade pruebas automatizadas de modelos, endpoints, autenticación, permisos y restricciones de moderador/admin.
- No cambies ni publiques el frontend, credenciales reales, datos personales ni archivos `.env`. No hagas migraciones destructivas.

## Contrato API obligatorio

Prefijo `/api/`. Las respuestas de detalle/listado deben usar exactamente los campos indicados; pueden incluir otros campos no sensibles.

### Autenticación

`POST /api/auth/register/` — público; recibe:

```json
{
  "email": "persona@gmail.com",
  "run": "19011022K",
  "password": "una contraseña",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "region": "Región Metropolitana",
  "commune": "Santiago",
  "address": "Dirección 123"
}
```

Responde `201` con usuario creado (`id`, `email`, `run`, `first_name`, `last_name`, `role`, `is_active`), sin iniciar sesión automáticamente. `role` debe ser `usuario`.

`POST /api/auth/login/` — público; recibe `{"email":"...","password":"..."}`. Responde `200`:

```json
{
  "access": "<JWT access>",
  "refresh": "<JWT refresh>",
  "user": {
    "id": 1,
    "email": "admin@ejemplo.cl",
    "run": "11111111K",
    "first_name": "Admin",
    "last_name": "Farmacia",
    "role": "admin",
    "is_active": true
  }
}
```

`POST /api/auth/refresh/` — público; recibe `{"refresh":"<JWT refresh>"}` y responde `{"access":"<JWT access>"}`. El resto de rutas protegidas usa `Authorization: Bearer <access>`.

### Productos

Modelo/serializador: `id` (entero), `name` (texto), `price` (número), `image` (URL o ruta servible como texto), `category` (texto), `is_offer` (booleano).

- `GET /api/products/` público → arreglo de productos o paginación DRF.
- `POST /api/products/` protegido por rol admin/moderador; recibe `name`, `price`, `image`, `category`, `is_offer`; responde `201` con el producto.
- `PATCH /api/products/{id}/` protegido; acepta esos campos opcionalmente; responde producto actualizado.
- `DELETE /api/products/{id}/` protegido; responde `204`.

### Usuarios y permisos

El usuario serializado usa `id`, `email`, `run`, `first_name`, `last_name`, `role` (`usuario`, `moderador`, `admin`) e `is_active` (booleano). Nunca incluir credenciales.

- `GET /api/users/` requiere admin/moderador; devuelve usuarios y respeta la visibilidad por jerarquía (moderadores no reciben datos de admins).
- `PATCH /api/users/{id}/` requiere admin/moderador. Acepta parcialmente `email`, `run`, `first_name`, `last_name`, `role` e/o `is_active`. Aplica las restricciones de rol y jerarquía en servidor.
- `GET /api/users/{id}/permissions/` requiere admin; responde `{"permissions": {...}}`.
- `PATCH /api/users/{id}/permissions/` requiere admin; recibe `{"permissions": {...}}` y responde `{"permissions": {...}}`.

Las claves de permisos existentes son `ver-productos`, `comprar`, `ver-carrito`, `acceso-admin`, `editar-perfil`, `ver-historial`. Valores booleanos. Inicializa de forma segura los no especificados:

```json
{
  "ver-productos": true,
  "comprar": true,
  "ver-carrito": true,
  "acceso-admin": false,
  "editar-perfil": true,
  "ver-historial": false
}
```

## Verificación y entrega

Ejecuta migraciones y la suite de pruebas pertinente. Prueba también el flujo completo: registro → login → consulta de productos → CRUD con admin/moderador → visibilidad/estado de usuarios → permisos solo admin → refresh JWT → rechazo de usuarios inactivos. Informa los archivos creados/modificados, comandos ejecutados, variables necesarias y cualquier limitación que quede. No afirmes que una prueba pasó si no la ejecutaste.

---
