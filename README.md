# API REST de Productos con Node.js + Express

> **Tema 3:** Backend con Node.js + Express + JavaScript  
> **Modalidad:** Exposición: el grupo ENSEÑA a sus compañeros a construir la app *(Aprender enseñando)*.  
> **Objetivo:** Construir el mismo CRUD de "productos" del Tema 1, pero en JavaScript, para comparar cómo se resuelve el mismo problema frente a Java con Spring Boot.

---

## 📚 1. Preguntas de Investigación (Fundamentos Teóricos)

Antes de exponer, el grupo domina los siguientes conceptos esenciales:

### • ¿Qué es Node.js y por qué permite usar JavaScript fuera del navegador?
* **Node.js** es un entorno de ejecución (*runtime*) para JavaScript basado en el motor **V8 de Google Chrome** y la librería **libuv**.
* Históricamente, JavaScript solo vivía dentro de los navegadores web. Node.js extrae el motor V8 y lo envuelve con APIs en C++ que permiten acceder al sistema operativo: interactuar con el sistema de archivos, manejar sockets de red y puertos TCP/HTTP, y gestionar procesos del sistema.
* Su arquitectura se basa en un **bucle de eventos (*Event Loop*) monohilo no bloqueante**, lo que le permite atender miles de conexiones concurrentes de entrada/salida (I/O) de forma muy ligera.

### • ¿Qué es Express y qué es un middleware?
* **Express** es el framework web minimalista y rápido más utilizado para Node.js. Provee un conjunto flexible de utilidades para crear APIs REST (enrutamiento de métodos HTTP, gestión de peticiones y respuestas).
* Un **Middleware** es una función intermedia que se ejecuta en el ciclo de vida de una petición HTTP, entre la llegada de la solicitud (*Request*) y la emisión de la respuesta final (*Response*).
  * Tiene acceso a los objetos `req`, `res` y a la función `next()`.
  * En este proyecto usamos `app.use(express.json())`, un middleware incorporado que intercepta el cuerpo (*body*) de las peticiones en formato JSON y lo convierte automáticamente en un objeto JavaScript accesible en `req.body`.

### • ¿Qué es npm y para qué sirve el archivo `package.json`?
* **npm (*Node Package Manager*)** es el gestor de dependencias y paquetes por defecto de Node.js, así como el repositorio de librerías más grande del mundo.
* El archivo **`package.json`** es el manifiesto del proyecto:
  * Contiene los metadatos (nombre, versión, autor, scripts ejecutables).
  * Registra las **dependencias** exactas que necesita el proyecto (por ejemplo, `"express": "^5.2.1"`).
  * Permite que cualquier otro desarrollador o compañero clone el repositorio y con solo ejecutar `npm install` descargue automáticamente todas las dependencias necesarias.

### • ¿En qué se parece y en qué se diferencia de Spring Boot?
* **Semejanzas:**
  1. Ambos permiten diseñar **APIs RESTful** siguiendo las convenciones de verbos HTTP (`GET`, `POST`, `PUT`, `DELETE`).
  2. Ambos retornan y consumen datos en formato estándar **JSON**.
  3. Ambos pueden conectarse a bases de datos relacionales y no relacionales y manejar códigos de estado HTTP estándar (200, 201, 404, etc.).
* **Diferencias principales:**
  1. **Lenguaje y Tipado:** Node.js usa JavaScript (interpretado y tipado dinámico); Spring Boot usa Java (compilado y tipado estático con clases y POJOs).
  2. **Arquitectura:** Express es un micro-framework minimalista y no estructurado (puedes hacer la API en un solo archivo `index.js`); Spring Boot es un framework empresarial robusto, basado en convenciones estrictas y arquitectura en capas (Controller, Service, Repository, Entity).
  3. **Concurrencia:** Node.js es monohilo asíncrono (*Event Loop*); Spring Boot usa multihilo mediante un servidor embebido (Tomcat) administrado por la JVM.

---

## 🛠️ 2. Construcción Paso a Paso (Puntos 1, 2 y 3)

### Paso 1: Inicializar el proyecto e instalar Express
1. Crear el archivo `package.json`:
   ```bash
   npm init -y
   ```
2. Instalar Express:
   ```bash
   npm install express
   ```

### Paso 2: Crear el servidor básico que escuche en un puerto
En `index.js`:
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para procesar cuerpos JSON
app.use(express.json());

// Escuchar peticiones en el puerto asignado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});
```
Para ejecutar:
```bash
npm start
```

### Paso 3: Definir las rutas del CRUD de productos
En `index.js` creamos el arreglo en memoria y las rutas:
```javascript
let productos = [
  { id: 1, nombre: 'Laptop Gamer', precio: 2500, stock: 10 },
  { id: 2, nombre: 'Mouse Inalámbrico', precio: 50, stock: 30 },
  { id: 3, nombre: 'Teclado Mecánico', precio: 120, stock: 15 }
];
```
* `GET /productos` - Listar todos.
* `GET /productos/:id` - Buscar por ID.
* `POST /productos` - Registrar producto.
* `PUT /productos/:id` - Actualizar producto.
* `DELETE /productos/:id` - Borrar producto.

---

## 🧪 3. Pruebas con Postman y Respuestas JSON (Punto 4)

Colección disponible en: [`postman_collection.json`](./postman_collection.json) *(importar en Postman)*.

### 1. `GET /productos` (Listar productos)
* **Status:** `200 OK`
* **Respuesta JSON:**
```json
[
  { "id": 1, "nombre": "Laptop Gamer", "precio": 2500, "stock": 10 },
  { "id": 2, "nombre": "Mouse Inalámbrico", "precio": 50, "stock": 30 },
  { "id": 3, "nombre": "Teclado Mecánico", "precio": 120, "stock": 15 }
]
```

### 2. `GET /productos/:id` (Buscar por ID)
* **Caso Existente (`GET /productos/1`):** Status `200 OK`
```json
{
  "id": 1,
  "nombre": "Laptop Gamer",
  "precio": 2500,
  "stock": 10
}
```
* **Caso No encontrado (`GET /productos/99`):** Status `404 Not Found`
```json
{
  "mensaje": "Producto no encontrado"
}
```

### 3. `POST /productos` (Crear producto)
* **Headers:** `Content-Type: application/json`
* **Body enviado:**
```json
{
  "nombre": "Monitor 24 pulgadas",
  "precio": 800,
  "stock": 5
}
```
* **Status:** `201 Created`
* **Respuesta JSON:**
```json
{
  "id": 4,
  "nombre": "Monitor 24 pulgadas",
  "precio": 800,
  "stock": 5
}
```

### 4. `PUT /productos/1` (Actualizar producto)
* **Headers:** `Content-Type: application/json`
* **Body enviado:**
```json
{
  "nombre": "Laptop Gamer RTX",
  "precio": 2800,
  "stock": 8
}
```
* **Status:** `200 OK`
* **Respuesta JSON:**
```json
{
  "id": 1,
  "nombre": "Laptop Gamer RTX",
  "precio": 2800,
  "stock": 8
}
```

### 5. `DELETE /productos/1` (Eliminar producto)
* **Status:** `200 OK`
* **Respuesta JSON:**
```json
{
  "mensaje": "Producto con ID 1 eliminado con éxito"
}
```

---

## ⚖️ 4. Comparativa Lado a Lado: Node.js vs Spring Boot (Punto 5)

### Comparativa A: Endpoint `GET /productos/:id` (Buscar por ID con error 404)

#### 🟢 Node.js + Express (`index.js`)
```javascript
app.get('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  res.json(producto);
});
```

#### 🍃 Spring Boot (`ProductoController.java`)
```java
@GetMapping("/{id}")
public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
    return productoRepository.findById(id)
        .map(producto -> ResponseEntity.ok(producto))
        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("mensaje", "Producto no encontrado")));
}
```

---

### Comparativa B: Endpoint `POST /productos` (Crear producto)

#### 🟢 Node.js + Express (`index.js`)
```javascript
app.post('/productos', (req, res) => {
  const { nombre, precio, stock } = req.body;

  const nuevoProducto = {
    id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
    nombre,
    precio,
    stock
  };

  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});
```

#### 🍃 Spring Boot (`ProductoController.java`)
```java
@PostMapping
public ResponseEntity<Producto> crearProducto(@RequestBody Producto nuevoProducto) {
    Producto guardado = productoRepository.save(nuevoProducto);
    return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
}
```

---

## 📊 5. Tabla Comparativa General (Entregable de la Exposición)

| Criterio | Node.js + Express | Spring Boot (Java) |
| :--- | :--- | :--- |
| **Lenguaje y Tipado** | JavaScript (Dinámico, débilmente tipado, interpretado) | Java (Estático, fuertemente tipado, compilado) |
| **Filosofía del Framework** | Minimalista, no opinado (libertad total de archivos) | Convención sobre configuración, opinado y empresarial |
| **Definición de Endpoints** | Funciones con rutas directas (`app.get`, `app.post`) | Métodos dentro de clases con anotaciones (`@RestController`, `@GetMapping`) |
| **Captura de Parámetros** | `req.params.id` (requiere conversión manual a número) | `@PathVariable Long id` (conversión de tipo automática) |
| **Recepción de JSON Body** | `req.body` gracias al middleware `express.json()` | `@RequestBody Producto` mapeado automáticamente por Jackson |
| **Gestor de Paquetes** | `npm` con archivo manifiesto `package.json` | `Maven` (`pom.xml`) o `Gradle` (`build.gradle`) |
| **Modelo de Concurrencia** | Bucle de eventos monohilo (*Event Loop* no bloqueante) | Multihilo por petición (*Thread per request*) con Tomcat |
| **Curva de Aprendizaje** | Rápida, muy pocas líneas de configuración inicial | Más pronunciada (requiere conocer POJOs, inyección de dependencias, etc.) |

---

## 🎯 6. Dinámica para los Compañeros: ¿En qué se parecen y en qué cambian?

Para cumplir el objetivo de la exposición (*hacer que los compañeros identifiquen al menos 2 diferencias y similitudes*), el grupo formulará estas preguntas a la audiencia:

1. **¿En qué se parecen ambas soluciones?**
   * Ambas exponen los mismos verbos HTTP (`GET`, `POST`, `PUT`, `DELETE`).
   * Ambas devuelven el mismo contrato de datos en formato JSON con los códigos de estado `200`, `201` y `404`.
2. **Diferencia 1 (Sintaxis y Anotaciones):**
   * *En Express:* Las rutas se definen mediante funciones y métodos directos (`app.get(...)`).
   * *En Spring Boot:* Se utilizan anotaciones sobre clases y métodos (`@RestController`, `@GetMapping`).
3. **Diferencia 2 (Tipado y Validación de Datos):**
   * *En Express:* Los datos en `req.body` son objetos flexibles de JavaScript sin validación de tipo previa obligatoria.
   * *En Spring Boot:* Es obligatorio mapear a una clase fuertemente tipada (`Producto`) con atributos declarados y getters/setters.

---

## 📦 7. Checklist de Entregables de la Exposición

* [x] **Proyecto en GitHub:** Código funcional con `index.js`, `package.json` y `.gitignore`.
* [x] **Colección de Postman:** Archivo [`postman_collection.json`](./postman_collection.json) con peticiones y respuestas JSON embebidas.
* [x] **Tabla Comparativa Node.js vs Spring Boot:** Documentada y explicada paso a paso.
* [x] **Dashboard Visual Interactivo:** Interfaz web moderna servida en `http://localhost:3000` para probar el CRUD visualmente.
* [x] **Enseñanza guiada:** Estructura preparada para enseñar a los compañeros a construir la app desde cero.
