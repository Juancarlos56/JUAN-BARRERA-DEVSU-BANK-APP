# Banco — Productos Financieros

Aplicación frontend en **Angular 21** para administrar los productos financieros de un banco:
listar, buscar, paginar, agregar, editar y eliminar productos consumiendo una API REST local.

Prueba técnica Frontend (Devsu) — **Juan Carlos Barrera Barrera**.

| Funcionalidad                                                    | Estado |
| ---------------------------------------------------------------- | :----: |
| **F1** Listado de productos financieros (D1)                     |   ✅   |
| **F2** Búsqueda de productos                                     |   ✅   |
| **F3** Cantidad de registros (5, 10, 20) + paginación simple     |   ✅   |
| **F4** Agregar producto con validaciones (D2, D3)                |   ✅   |
| **F5** Editar producto desde menú contextual (D2, D3)            |   ✅   |
| **F6** Eliminar producto con modal de confirmación (D3, D4)      |   ✅   |
| Skeletons de precarga, responsive design y rendimiento           |   ✅   |
| Pruebas unitarias con Jest — **100 % de coverage** (mínimo 70 %) |   ✅   |

---

## Tabla de contenido

1. [Requisitos](#requisitos)
2. [Estructura del repositorio](#estructura-del-repositorio)
3. [Ejecución del proyecto](#ejecución-del-proyecto)
4. [Pruebas unitarias](#pruebas-unitarias)
5. [Otros comandos](#otros-comandos)
6. [Arquitectura](#arquitectura)
7. [Decisiones técnicas](#decisiones-técnicas)
8. [Consideraciones sobre el enunciado](#consideraciones-sobre-el-enunciado)

---

## Requisitos

| Herramienta | Versión                                                 |
| ----------- | ------------------------------------------------------- |
| Node.js     | `^20.19.0`, `^22.12.0` o `>=24` (ver `frontend/.nvmrc`) |
| npm         | 10 o superior                                           |

Tecnologías principales: Angular 21 (standalone, signals, sin zone.js), TypeScript 5.9,
RxJS 7, Jest 30 + `jest-preset-angular`, ESLint (`angular-eslint`) y Prettier.
**No se usan frameworks de estilos ni librerías de componentes**: toda la maquetación es SCSS propio.

## Estructura del repositorio

```
.
├── repo-interview-main/   # Backend provisto (Node.js + Express) — puerto 3002
└── frontend/              # Aplicación Angular — puerto 4200
```

## Ejecución del proyecto

Se necesitan **dos terminales**: una para el backend y otra para el frontend.

### 1. Backend (API local)

```bash
cd repo-interview-main
npm install
npm run start:dev
```

La API queda disponible en `http://localhost:3002/bp/products`.

> El backend guarda los productos **en memoria**: al reiniciarlo, el listado vuelve a estar vacío.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Abrir **http://localhost:4200**.

El backend no tiene CORS habilitado, por eso el frontend **no** llama directamente a
`localhost:3002`: el servidor de desarrollo redirige las peticiones `/bp/*` al backend mediante
[`frontend/proxy.conf.json`](frontend/proxy.conf.json). No es necesario modificar el backend.

### Rutas de la aplicación

| Ruta                 | Pantalla                       |
| -------------------- | ------------------------------ |
| `/products`          | Listado, búsqueda y paginación |
| `/products/new`      | Formulario de registro         |
| `/products/:id/edit` | Formulario de edición          |

## Pruebas unitarias

Las pruebas usan **Jest** y no necesitan el backend ni un navegador.

```bash
cd frontend
npm test                 # ejecuta todas las pruebas
npm run test:coverage    # ejecuta las pruebas y genera el reporte de coverage
npm run test:watch       # modo observación durante el desarrollo
```

El reporte HTML queda en `frontend/coverage/index.html`.
La configuración ([`frontend/jest.config.js`](frontend/jest.config.js)) **falla si el coverage baja del 70 %**.

### Resultado actual

```
Test Suites: 31 passed, 31 total
Tests:       212 passed, 212 total

Statements   : 100% ( 601/601 )
Branches     : 100% ( 128/128 )
Functions    : 100% ( 153/153 )
Lines        : 100% ( 515/515 )
```

Qué se prueba:

- **Dominio y utilidades**: reglas de fechas (incluido el 29 de febrero), normalización de texto, pipe de fechas.
- **Infraestructura**: repositorio HTTP con `HttpTestingController` (URLs, métodos, cuerpos y mapeo DTO ↔ dominio).
- **Aplicación**: casos de uso con un repositorio simulado y el store del listado (filtro, paginación, carga, errores, eliminación).
- **Presentación**: validadores (síncronos y asíncrono del ID), formulario en modo registro y edición, tabla, menú, modal y páginas completas.
- **Core**: traducción de errores HTTP, interceptor y notificaciones.

## Otros comandos

```bash
cd frontend
npm run lint      # ESLint (exige OnPush y reglas de accesibilidad en plantillas)
npm run build     # build de producción en frontend/dist
npm run format    # Prettier
```

## Arquitectura

Se aplica **Clean Architecture** dentro de la feature `products`. Las dependencias apuntan
siempre hacia el dominio:

```
presentation ──► application ──► domain ◄── infrastructure
```

```
frontend/src/app/
├── core/                         # Transversal a toda la app
│   ├── config/                   #   API_BASE_URL y CLOCK (inyectables)
│   ├── errors/                   #   AppError y traducción de errores HTTP a mensajes
│   ├── interceptors/             #   Interceptor que normaliza los errores HTTP
│   ├── layout/header/            #   Encabezado "BANCO"
│   └── notifications/            #   Servicio y contenedor de toasts
├── shared/                       # Reutilizable y sin lógica de negocio
│   ├── ui/                       #   avatar, skeleton, paginador, form-field, dropdown, modal
│   ├── pipes/                    #   isoDate (YYYY-MM-DD → dd/MM/yyyy)
│   └── utils/                    #   fechas y texto
└── features/products/
    ├── domain/                   # Entidad Product, contrato ProductRepository, reglas de negocio
    ├── application/              # Casos de uso y estado del listado (signals)
    ├── infrastructure/           # DTOs, mapper y HttpProductRepository
    ├── presentation/             # Páginas, componentes, validadores y mensajes de formulario
    ├── products.providers.ts     # Enlaza ProductRepository → HttpProductRepository
    └── products.routes.ts        # Rutas con lazy loading
```

### Principios SOLID aplicados

| Principio                     | Dónde se ve                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsabilidad única**     | El repositorio solo hace HTTP; el mapper solo traduce; el interceptor solo normaliza errores; las páginas orquestan y los componentes de presentación solo muestran. |
| **Abierto/cerrado**           | La tabla relaciona cada opción del menú con su evento mediante un mapa: agregar una acción no modifica la lógica existente.                                          |
| **Sustitución de Liskov**     | `HttpProductRepository` y el repositorio simulado de las pruebas son intercambiables donde se espera un `ProductRepository`.                                         |
| **Segregación de interfaces** | Cada caso de uso expone una única operación; los componentes reciben solo los datos que necesitan.                                                                   |
| **Inversión de dependencias** | Los casos de uso dependen del contrato abstracto `ProductRepository`; la implementación se inyecta en `provideProducts()`.                                           |

## Decisiones técnicas

- **Signals + `OnPush` + zoneless.** El estado vive en signals y todas las derivaciones
  (filtro, conteo, paginación) son `computed`, que se recalculan solo cuando cambian sus dependencias.
  ESLint obliga a usar `OnPush` en todos los componentes.
- **Rendimiento.** Rutas con lazy loading (cada pantalla es un chunk aparte), `track` por id en
  las listas, imágenes con `loading="lazy"`, búsqueda con debounce de 300 ms y eliminación sin
  volver a pedir todo el listado.
- **Skeletons.** Filas de precarga en la tabla mientras se cargan los productos y skeleton del
  formulario en la pantalla de edición.
- **Responsive.** La tabla tiene scroll horizontal propio (como en el diseño D1), el formulario
  pasa a una columna y los botones ocupan todo el ancho en pantallas pequeñas.
- **Manejo de errores visual.** Un interceptor convierte cualquier error HTTP en un `AppError` con
  un mensaje en español (sin conexión, datos inválidos, ID duplicado, no encontrado, error del servidor).
  Se muestran como toasts o en línea (listado con botón _Reintentar_, edición de un producto inexistente).
- **Fechas como texto `YYYY-MM-DD`.** Evita el desfase por zona horaria de `new Date('2025-01-01')`
  (se interpreta en UTC). La fecha actual se obtiene del token inyectable `CLOCK`, lo que permite
  pruebas deterministas.
- **Validaciones (F4/F5).** Formulario reactivo tipado. El ID se verifica contra
  `/bp/products/verification/:id` con un validador asíncrono (debounce de 400 ms e indicador
  _Verificando ID..._). La fecha de revisión se calcula automáticamente (un año después de la de
  liberación, ajustando el 29 de febrero) y además se valida.
- **Un solo formulario para registrar y editar.** En edición el ID queda deshabilitado, no se
  verifica contra la API y _Reiniciar_ restaura los valores originales.
- **Accesibilidad.** Etiquetas asociadas a cada campo, `aria-invalid` y mensajes enlazados con
  `aria-describedby`, menú con `aria-haspopup`/`aria-expanded`, modal `role="alertdialog"` con foco
  inicial en _Cancelar_ y cierre con Escape, y soporte de `prefers-reduced-motion`.

## Consideraciones sobre el enunciado

- **Longitud mínima del nombre.** El enunciado pide mínimo **5** caracteres y el frontend valida eso,
  pero el backend provisto exige **6** (`@MinLength(6)`). Un nombre de 5 caracteres pasa la validación
  del formulario y el backend lo rechaza; la aplicación muestra el error al usuario sin perder lo ingresado.
- **Texto de los botones.** Cuando el texto del enunciado y el diseño difieren se siguió el enunciado:
  el formulario usa **Agregar** (D2 muestra _Enviar_) y el modal usa **Eliminar** (D4 muestra _Confirmar_).
- **"N Resultados"** muestra el total de productos que cumplen la búsqueda; la paginación indica la
  página actual.
- **Edición y fecha de liberación.** Como F5 mantiene las validaciones de F4, un producto cuya fecha de
  liberación ya pasó necesita una nueva fecha para poder guardarse; el error se muestra al abrir el formulario.
- **Endpoint adicional.** La pantalla de edición usa `GET /bp/products/:id` (existe en el backend aunque
  no está documentado) para que la URL de edición funcione al recargar o abrirla directamente.
