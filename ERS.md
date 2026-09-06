# ERS - Especificación de Requisitos del Software

## 1. Identificación

**Proyecto:** Farmacia de Raza  
**Tipo:** Aplicación web frontend para una tienda online  
**Versión:** 1.0

## 2. Objetivo

Entregar una experiencia web clara para consultar productos de salud, buscar artículos, agregarlos a un carrito y contactar a la farmacia mediante formularios validados.

## 3. Usuarios

- **Visitante:** consulta información, productos, blog y datos de contacto.
- **Cliente:** registra sus datos, inicia sesión de forma validada y administra su carrito.

## 4. Requisitos funcionales

| ID | Requisito |
| --- | --- |
| RF-01 | El sistema debe mostrar productos con nombre, precio e imagen. |
| RF-02 | El usuario debe poder buscar productos por nombre. |
| RF-03 | El usuario debe poder agregar productos al carrito. |
| RF-04 | El carrito debe persistir los productos con `localStorage`. |
| RF-05 | El usuario debe poder eliminar productos o vaciar el carrito. |
| RF-06 | El sistema debe validar registro, contacto e inicio de sesión con JavaScript. |
| RF-07 | El sistema debe cargar comunas según la región seleccionada. |
| RF-08 | Las páginas deben estar conectadas mediante hipervínculos funcionales. |
| RF-09 | La página principal debe ofrecer contenido multimedia mediante un video HTML5. |

## 5. Requisitos no funcionales

- Las páginas deben utilizar una hoja CSS externa.
- El sitio debe utilizar HTML5 semántico.
- La interfaz debe adaptarse a pantallas pequeñas.
- Los formularios deben utilizar etiquetas asociadas, campos requeridos, límites y `autocomplete` cuando corresponda.
- Los mensajes de validación deben ser comprensibles y aparecer junto al formulario.
- El código debe mantenerse en archivos separados para HTML, CSS y JavaScript.

## 6. Tecnologías y herramientas

- HTML5
- CSS3
- JavaScript ES6+
- Visual Studio Code
- Git y GitHub
- Live Server para desarrollo local

## 7. Restricciones

- Es un prototipo frontend; no incluye backend ni conexión a una base de datos.
- El carrito se guarda únicamente en el navegador del usuario.
- El inicio de sesión valida el formato, pero no autentica contra un servidor.

## 8. Criterios de aceptación

- Los enlaces principales no deben apuntar a páginas inexistentes.
- El catálogo, búsqueda, carrito, video y formularios deben funcionar al abrir `index.html`.
- Los formularios no deben aceptar envíos incompletos o con formatos inválidos.
- El proyecto debe incluir commits descriptivos y un repositorio remoto público antes de la entrega.
