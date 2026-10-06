# API REST de Productos con Node.js y Express

Proyecto del Tema 3: Construcción de una API REST utilizando Node.js y Express para gestionar un CRUD de productos, comparándolo con la solución en Java (Spring Boot).

## Tecnologías utilizadas
* **Node.js** (Entorno de ejecución con JavaScript del lado del servidor)
* **Express** (Micro-framework minimalista)
* **Postman** (Pruebas de endpoints)

## Endpoints del CRUD
* `GET /productos` - Listar todos los productos.
* `GET /productos/:id` - Obtener un producto por ID.
* `POST /productos` - Crear un nuevo producto.
* `PUT /productos/:id` - Actualizar un producto existente.
* `DELETE /productos/:id` - Eliminar un producto.

---

## Tabla Comparativa: Node.js + Express vs Spring Boot

| Criterio | Node.js + Express | Spring Boot (Java) |
| :--- | :--- | :--- |
| **Lenguaje y Tipado** | JavaScript (Tipado dinámico e interpretado) | Java (Tipado estático y compilado) |
| **Filosofía del Framework** | Minimalista, no opinado (libertad de estructura) | Robusto, opinado (arquitectura formal y convencional) |
| **Gestor de Paquetes** | `npm` (`package.json`) | `Maven` (`pom.xml`) o `Gradle` (`build.gradle`) |
| **Definición de Endpoints** | Funciones directas con rutas y middlewares (`app.get()`, `app.post()`) | Clases con anotaciones (`@RestController`, `@GetMapping`, `@PostMapping`) |
| **Manejo de Concurrencia** | Bucle de eventos (*Event Loop*) monohilo no bloqueante | Multihilo administrado por el servidor embebido (Tomcat) |
| **Tiempo de arranque** | Milisegundos y muy bajo consumo de memoria | Segundos y mayor consumo de memoria por la JVM |
