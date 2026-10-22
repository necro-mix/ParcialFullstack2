# Proceso de pruebas unitarias

## Objetivo y alcance

El proceso valida la lógica de persistencia y los resultados visibles en la interfaz. Combina Jasmine, Karma y Vitest con entornos DOM simulados; no requiere backend ni datos externos.

## Entorno

- Jasmine 5 ejecuta la lógica de `src/storage.spec.js`.
- Karma ejecuta Jasmine en jsdom y usa esbuild para transformar JSX en `src/components/Catalog.karma.spec.js`.
- Vitest 2 y React Testing Library cubren interacciones de componentes y páginas.
- `test/jasmine-setup.js` prepara jsdom para las pruebas de lógica; `src/test/setup.js` limpia `localStorage` y desmonta React Testing Library.

## Pruebas de componentes con Jasmine y Karma

`src/components/Catalog.karma.spec.js` contiene diez casos:

1. Renderizado del nombre recibido por props.
2. Formato del precio.
3. Visibilidad de la insignia de oferta.
4. Ausencia de la insignia cuando no hay oferta.
5. Bloqueo de la acción de carrito sin sesión.
6. Persistencia y notificación al componente padre con sesión.
7. Renderizado del catálogo completo.
8. Filtrado por categoría.
9. Búsqueda sin distinguir mayúsculas ni tildes.
10. Mensaje de catálogo vacío.

Las pruebas usan `jasmine.createSpy` como mock de la función de notificación, y verifican tanto la llamada como los cambios en `localStorage`.

## Pruebas de interacción y mocks

Vitest y Testing Library prueban además el registro y sus validaciones, el acceso por rol, la gestión de productos y permisos, la sincronización de sesión, y el carrito. `vi.fn()` verifica callbacks y `vi.spyOn(window, 'confirm')` simula la confirmación de acciones administrativas. Los casos interactúan con controles accesibles mediante etiquetas, roles y texto visible, evitando depender de detalles internos.

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

1. Explicar que `App.jsx` conecta rutas y páginas; `Layout` conserva sesión/carrito; `ProductGrid` recibe props y maneja búsqueda, categoría y feedback con estado React.
2. Mostrar en `ProductGrid.jsx` la grilla Bootstrap: una columna en móvil, dos desde `sm`, tres desde `lg` y cuatro desde `xl`; cada `ProductCard` recibe `producto` y `onAdded`.
3. Ejecutar `npm run test:karma` y presentar los diez casos Jasmine: mocks con `jasmine.createSpy`, interacción en jsdom y comprobación del almacenamiento.
4. Ejecutar `npm test`, explicar los resultados de los tres runners y abrir `coverage/vitest/index.html` para comentar cobertura y ramas pendientes.
5. Cerrar con `npm run build` como comprobación de integración antes de publicar.
