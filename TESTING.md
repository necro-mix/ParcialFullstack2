# Proceso de pruebas unitarias

## Objetivo y alcance

El proceso valida el cliente REST, la sesión mínima local y los resultados visibles en la interfaz. Combina Jasmine, Karma y Vitest con entornos DOM simulados; las pruebas interceptan las solicitudes y no escriben en la API real.

## Entorno

- Jasmine 5 verifica sesión y jerarquía de roles en `src/storage.spec.js`.
- Karma ejecuta Jasmine en jsdom y usa esbuild para transformar JSX en `src/components/Catalog.karma.spec.js`.
- Vitest 2 y React Testing Library cubren interacciones de componentes y páginas.
- `test/jasmine-setup.js` prepara jsdom para las pruebas de lógica; `src/test/setup.js` limpia el almacenamiento de sesión y desmonta React Testing Library.

## Pruebas de componentes con Jasmine y Karma

`src/components/Catalog.karma.spec.js` cubre:

1. Renderizado de datos remotos del producto y formato de precio.
2. Visibilidad de la insignia de oferta.
3. Acción de compra deshabilitada mientras no exista API de carrito/pedidos.
4. Carga del catálogo remoto.
5. Filtrado por categoría y búsqueda sin distinguir mayúsculas ni tildes.
6. Mensaje de catálogo vacío.

Las pruebas sustituyen `fetch` con respuestas paginadas simuladas y comprueban que no se persista el catálogo en `localStorage`.

## Pruebas de interacción y mocks

Vitest y Testing Library prueban el contrato HTTP, el refresh JWT, la paginación, el registro, el inicio de sesión, la gestión remota de usuarios/productos/permisos, y los estados de funciones sin endpoint. `vi.fn()` simula respuestas de API y `vi.spyOn(window, 'confirm')` simula la confirmación de acciones administrativas. Los casos interactúan con controles accesibles mediante etiquetas, roles y texto visible.

## Ejecución y lectura de resultados

```bash
npm test
```

El comando ejecuta, en orden, Jasmine (lógica), Jasmine/Karma (componentes) y Vitest (interacciones). Cada grupo debe terminar con cero fallos. Para aislar un grupo:

```bash
npm run test:jasmine
npm run test:karma
npm run test:react
```

La cobertura de los componentes principales se genera con V8:

```bash
npm run test:coverage
```

El comando imprime porcentajes de sentencias, ramas, funciones y líneas en consola, y crea el informe HTML en `coverage/vitest/index.html` y el formato LCOV en `coverage/vitest/lcov.info`. Se incluye explícitamente `ProductCard.jsx` y `ProductGrid.jsx`; revisar ramas bajas permite priorizar nuevos casos en errores, permisos y estados vacíos. La cobertura complementa las pruebas, no demuestra por sí sola que la lógica sea correcta.

## Validación de producción

```bash
npm run build
```

La compilación debe finalizar sin errores y generar el bundle de producción en `dist/`.

## Guion breve para la presentación individual

1. Explicar que `api.js` centraliza las rutas y JWT, y que `storage.js` conserva solo la sesión.
2. Mostrar cómo `ProductGrid.jsx` carga, filtra y presenta productos remotos en la grilla Bootstrap.
3. Ejecutar `npm run test:karma` y presentar las respuestas simuladas de API en jsdom.
4. Ejecutar `npm test`, explicar los resultados de los tres runners y abrir `coverage/vitest/index.html` para comentar cobertura y ramas pendientes.
5. Cerrar con `npm run build` como comprobación de integración antes de publicar.
