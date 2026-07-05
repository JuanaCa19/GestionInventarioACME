# ProyectoAcmeProduccion_JavaScript
 
Sistema de gestión de inventario y producción para la planta de Acme en Macondo. Permite controlar el inventario de materia prima y productos terminados, administrar usuarios del sistema y ejecutar el proceso productivo (transformación de materia prima en producto terminado según una receta/fórmula).
 
## Tabla de contenido
 
- [Descripción general](#descripción-general)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instrucciones de ejecución](#instrucciones-de-ejecución)
- [Módulos y funcionalidades](#módulos-y-funcionalidades)
- [Web Components](#web-components)
- [Base de datos](#base-de-datos)
- [Wireframes](#wireframes)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Autor](#autor)
## Descripción general
 
La aplicación resuelve el flujo operativo de una planta de producción:
 
1. Un usuario autenticado registra materia prima y productos terminados en el **inventario**.
2. A cada producto terminado se le asocia una **receta** (fórmula) que indica cuánta materia prima se necesita para fabricarlo.
3. Al ejecutar el proceso de **producción**, el sistema valida que haya stock suficiente de cada material, descuenta la materia prima usada y aumenta el stock del producto terminado.
## Tecnologías utilizadas
 
- **HTML5** — estructura de las vistas.
- **CSS3** (Flexbox, media queries) — estilos y diseño responsive.
- **JavaScript (ES6+)** — lógica de negocio, sin frameworks.
- **Web Components** (`customElements`) — componentes reutilizables de tabla y buscador.
- **Firebase Realtime Database** — persistencia de datos (usuarios, inventario, recetas) vía REST API.
- **Bootstrap Icons** (CDN) — iconografía de botones de acción.
## Estructura del proyecto
 
```
GestionInventarioACME/
├── index.html              # Login
├── usuarios.html           # Módulo de usuarios
├── inventario.html         # Módulo de inventario y producción
├── receta.html             # Módulo de recetas/fórmulas
├── CSS/
│   ├── login.css
│   ├── style.css           # Estilos compartidos (nav, tabla, modal, buscador)
│   ├── usuarios.css
│   ├── inventario.css
│   └── receta.css
└── JS/
    ├── main.js              # Autenticación (login)
    ├── usuarios.js           # CRUD de usuarios
    ├── inventario.js         # CRUD de inventario + proceso de producción
    ├── receta.js              # CRUD de recetas/fórmulas
    └── componentes.js         # Web Components (tabla, buscador, nav)
```
 
## Instrucciones de ejecución
 
Este proyecto no requiere instalación de dependencias ni proceso de build: es HTML, CSS y JavaScript puro.
 
1. Clona el repositorio:
```bash
   git clone <url-del-repositorio>
   cd ProyectoAcmeProduccion_JavaScript_ApellidoNombre
```
2. Como el proyecto usa rutas absolutas (`/CSS/...`, `/JS/...`) y `fetch` hacia Firebase, se recomienda servirlo con un servidor local en vez de abrir los `.html` directamente con `file://`. Por ejemplo, con la extensión **Live Server** de VS Code, o con:
```bash
   npx serve .
```
3. Abre `index.html` en el navegador (o la URL que indique tu servidor local).
4. Inicia sesión con un usuario previamente registrado en la base de datos, o crea uno directamente desde la consola de Firebase en la ruta `/user/usuarios.json` si es el primer uso.
> **Nota:** la aplicación depende de una instancia de Firebase Realtime Database ya configurada (ver `API_URL` en cada archivo JS). Si vas a desplegar tu propia instancia, reemplaza esa constante en `main.js`, `usuarios.js`, `inventario.js` y `receta.js` por la URL de tu proyecto.
 
## Módulos y funcionalidades
 
### Login (`index.html`)
- Autenticación por número de identificación y contraseña.
- Al validar credenciales contra la base de datos, guarda la sesión en `sessionStorage`.
- Las páginas internas verifican la existencia de sesión activa al cargar; si no hay sesión, redirigen al login.
### Módulo de usuarios (`usuarios.html`)
- Crear, editar y eliminar usuarios.
- Registro de número de identificación, nombre completo, cargo y contraseña.
- Doble validación de contraseña (campo de confirmación) para prevenir errores de digitación al registrar.
### Módulo de inventario (`inventario.html`)
- Crear productos de tipo **Materia Prima** o **Producto Elaborado**, con código, nombre, proveedor y stock inicial.
- Editar y eliminar productos. La eliminación está protegida: no se puede borrar un producto que tenga una receta asociada, ni una materia prima que esté referenciada como ingrediente en alguna receta activa.
- Buscador por código o nombre, con filtro insensible a mayúsculas/minúsculas.
- Acción de **producir**: para productos de tipo "Producto Elaborado" con receta asociada, solicita la cantidad a fabricar, valida que haya stock suficiente de cada material de la receta y, si es así, descuenta la materia prima y aumenta el stock del producto terminado.
### Módulo de recetas (`receta.html`)
- Asociar a un producto elaborado la lista de materiales (materia prima) y la cantidad necesaria de cada uno para fabricar una unidad.
- Un producto elaborado solo puede tener una receta activa a la vez.
- Editar y eliminar recetas existentes.
## Web Components
 
Para favorecer la reutilización de código entre los distintos módulos, se implementaron los siguientes componentes personalizados (`JS/componentes.js`):
 
- **`<mi-tabla>`**: renderiza dinámicamente una tabla a partir de un arreglo de columnas y datos, generando también los botones de acción (editar, eliminar, producir) según el tipo de entidad. Se reutiliza en los módulos de inventario, usuarios y recetas.
- **`<buscador-componente>`**: renderiza el campo de búsqueda junto con el selector de campo por el cual filtrar. Se reutiliza en los tres módulos con listas.
- **`<barra-aside>`**: barra de navegación lateral, reutilizada en todas las vistas internas.
## Base de datos
 
Se utiliza Firebase Realtime Database como backend, consumido directamente vía `fetch` (GET/PUT) sin backend propio. Las entidades persistidas son:
 
- `/user/usuarios.json` → lista de usuarios del sistema.
- `/inventario.json` → lista de productos (materia prima y productos elaborados) con su stock actual.
- `/receta.json` → lista de recetas, cada una asociada a un `codigoProducto` con su lista de materiales y cantidades.
## Wireframes
 
Los bocetos de las pantallas de Login, Usuarios, Inventario y Producción se encuentran en la carpeta `/wireframes` de este repositorio *(agrega aquí el enlace a Figma/imagen si aplica)*.
 
## Limitaciones conocidas
 
En esta entrega, el proceso de producción se ejecuta directamente desde la tabla de inventario (acción "producir" por producto), y no como un módulo independiente con historial. Como trabajo futuro queda pendiente:
 
- Registrar cada proceso de producción como una entidad propia con un código consecutivo (1, 2, 3…) y mostrar un resumen (cantidad fabricada y materiales consumidos) al finalizar cada proceso.
- Permitir producir varios productos en un mismo proceso.
- Una acción independiente para "ingresar/aumentar stock" de un producto existente sin pasar por el formulario completo de edición.
## Autor
 
**Juan Esteban Cardenas Rivera**
Proyecto individual — Curso de JavaScript.
