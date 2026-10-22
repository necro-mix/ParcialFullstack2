# Documentación de pruebas

## 1. Objetivo

Validar tanto la lógica de datos/persistencia como los flujos de interacción visibles de la aplicación.

## 2. Herramientas

- Jasmine 5
- Vitest 2
- Testing Library React
- Testing Library user-event
- jsdom

## 3. Estructura

### Jasmine: lógica unitaria

- `src/storage.spec.js`: catálogo, cuentas, sesión, carrito, permisos y actualización de usuarios.
- `test/jasmine-setup.js`: prepara jsdom y limpia `localStorage`.
- `jasmine.json`: configura descubrimiento y ejecución de las especificaciones.

### Vitest: componentes e interacción

- `src/components/ProductCard.test.jsx`: renderizado, acción de agregar y persistencia.
- `src/pages/Register.test.jsx`: registro, validación y sincronización del layout al iniciar sesión.
- `src/pages/Admin.test.jsx`: edición y guardado de permisos.
- `src/test/setup.js`: limpia `localStorage` y desmonta React Testing Library.

## 5. Comportamiento

- Jasmine prueba funciones directamente y usa jsdom para simular el almacenamiento del navegador.
- Vitest prueba los componentes con DOM simulado y Testing Library.
- Cada suite limpia su `localStorage` para evitar que un caso dependa de otro.
- Se prioriza validar resultados observables y persistencia sobre detalles internos.

## 6. Ejecución

Ejecutar ambas suites:

```bash
npm test
```

Ejecutar una suite específica:

```bash
npm run test:jasmine
npm run test:react
```

## 7. Compilación

Comando:

```bash
npm run build
```

Resultado esperado:

- 61 módulos transformados.
- Paquete de producción generado en dist.
- 0 errores de compilación.

## 8. Siguientes pruebas recomendadas

- Formulario de contacto y checkout.
- Total del carrito y navegación a compra exitosa.
- Restricción de rutas y permisos administrativos.
- Apariencia responsive en distintos tamaños de pantalla.
