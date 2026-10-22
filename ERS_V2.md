# ERS - Especificación de Requisitos del Software V2

## 1. Identificación

**Proyecto:** Farmacia de Raza  
**Tipo:** Aplicación web frontend React  
**Versión:** 2.0  
**Tecnologías:** React, JavaScript ES6+, JSX, Bootstrap 5, Vite, CSS3

## 2. Objetivo

Adaptar la tienda online existente a una aplicación React estructurada, responsable y mantenible, manteniendo la identidad visual, la paleta y los estados de interacción del frontend original.

## 3. Usuarios

- Visitante: consulta productos, categorías, ofertas, contenido y contacto.
- Cliente: registra su cuenta, inicia sesión y administra su carrito.
- Administrador: consulta estadísticas, administra usuarios y permisos.

## 4. Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-01 | Convertir las páginas HTML existentes a componentes React reutilizables. |
| RF-02 | Mantener una fuente de datos simulada en JavaScript con operaciones CRUD. |
| RF-03 | Conectar la fuente de datos con componentes React y persistencia local. |
| RF-04 | Implementar navegación entre inicio, productos, categorías, ofertas, historia, blog, contacto, login, registro, carrito, checkout y administración. |
| RF-05 | Implementar búsqueda y filtrado por categoría. |
| RF-06 | Persistir el carrito por usuario con localStorage. |
| RF-07 | Implementar registro, inicio de sesión y cierre de sesión. |
| RF-08 | Validar RUN, correo, contraseña, confirmación, región, comuna y dirección. |
| RF-09 | Implementar checkout, compra exitosa y compra no realizada. |
| RF-10 | Implementar panel administrativo con estadísticas, usuarios, estado y permisos. |
| RF-11 | Mantener diseño responsive mediante Bootstrap y CSS3. |
| RF-12 | Usar componentes con responsabilidades únicas, props y estado local cuando corresponda. |

## 5. Requisitos no funcionales

- Aplicación React moderna y estructurada.
- Responsividad para móvil, tablet y escritorio.
- Bootstrap 5 para layout y componentes responsivos.
- CSS3 externo y variables de apariencia preservadas.
- Semántica HTML, accesibilidad y mensajes de validación.
- Separación entre datos, servicios, componentes y páginas.
- No se utiliza backend ni base de datos.

## 6. Testing

- Jasmine ejecuta pruebas unitarias de los datos y la persistencia.
- Vitest con Testing Library verifica renderizado, eventos e interacción de componentes React.
- jsdom simula el entorno del navegador.
- localStorage se usa para validar persistencia y sesiones.
- Las suites se ejecutan con `npm test`.

## 7. Restricciones

- El sistema es frontend y usa datos simulados.
- La contraseña se almacena en localStorage únicamente para el prototipo.
- La compra no realiza una transacción financiera real.
- La apariencia original no se modifica en colores, estados de interacción o estructura visual.

## 8. Criterios de aceptación

- Compilación de producción correcta.
- Rutas principales funcionales.
- Registro válido y de error.
- Carrito persistente y eliminable.
- Panel administrativo protegido por rol.
- Pruebas unitarias ejecutadas correctamente.
