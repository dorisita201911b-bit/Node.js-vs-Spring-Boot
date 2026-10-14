// 1. IMPORTAR EXPRESS, PATH Y CONFIGURAR LA APP
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 2. MIDDLEWARES
// Permite al servidor entender datos en formato JSON en el body de las peticiones
app.use(express.json());

// Servir archivos estáticos del frontend (HTML, CSS, JS) desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// 3. DATOS DE PRUEBA EN MEMORIA (Simula nuestra base de datos con un catálogo amplio)
let productos = [
  { id: 1, nombre: 'Laptop Gamer', precio: 2500, stock: 10, categoria: 'Computadores', icono: '💻' },
  { id: 2, nombre: 'Mouse Inalámbrico', precio: 50, stock: 30, categoria: 'Periféricos', icono: '🖱️' },
  { id: 3, nombre: 'Teclado Mecánico', precio: 120, stock: 15, categoria: 'Periféricos', icono: '⌨️' },
  { id: 4, nombre: 'Monitor Curvo UltraWide 34" 144Hz', precio: 480, stock: 8, categoria: 'Monitores', icono: '🖥️' },
  { id: 5, nombre: 'Auriculares Inalámbricos Noise-Cancelling', precio: 180, stock: 22, categoria: 'Audio', icono: '🎧' },
  { id: 6, nombre: 'Silla Ergonómica Pro Reclinable', precio: 240, stock: 7, categoria: 'Mobiliario', icono: '🪑' },
  { id: 7, nombre: 'Webcam 4K Ultra HD con Micrófono', precio: 95, stock: 20, categoria: 'Accesorios', icono: '📷' },
  { id: 8, nombre: 'Disco Sólido SSD NVMe 1TB PCIe 4.0', precio: 110, stock: 25, categoria: 'Componentes', icono: '💾' },
  { id: 9, nombre: 'Memoria RAM DDR5 32GB RGB (2x16GB)', precio: 145, stock: 18, categoria: 'Componentes', icono: '⚡' },
  { id: 10, nombre: 'Micrófono Condensador USB Podcast', precio: 85, stock: 14, categoria: 'Audio', icono: '🎙️' },
  { id: 11, nombre: 'Soporte de Aluminio Regulable Laptop', precio: 35, stock: 40, categoria: 'Accesorios', icono: '📐' },
  { id: 12, nombre: 'Mousepad Gamer XXL Antideslizante', precio: 25, stock: 50, categoria: 'Accesorios', icono: '⬛' }
];

// Objeto de información de la API (para pruebas y clientes HTTP)
const apiInfo = {
  mensaje: 'API REST de Productos con Node.js y Express lista y en funcionamiento',
  version: '1.0.0',
  endpoints: [
    'GET /productos',
    'GET /productos/:id',
    'POST /productos',
    'PUT /productos/:id',
    'DELETE /productos/:id',
    'GET /api'
  ]
};

// 4. RUTAS DEL CRUD (Endpoints)

// GET: Ruta raíz (Sirve la interfaz web moderna tipo Dashboard)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET: Endpoint explícito para ver la metadata de la API en JSON
app.get('/api', (req, res) => {
  res.json(apiInfo);
});

// GET: Obtener todos los productos
app.get('/productos', (req, res) => {
  res.json(productos);
});

// GET: Obtener un solo producto por su ID
app.get('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  res.json(producto);
});

// POST: Crear un nuevo producto
app.post('/productos', (req, res) => {
  const { nombre, precio, stock, categoria, icono } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: 'Los campos nombre, precio y stock son obligatorios' });
  }

  // Generamos un ID autoincremental seguro
  const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

  const nuevoProducto = {
    id: nuevoId,
    nombre,
    precio: parseFloat(precio),
    stock: parseInt(stock, 10),
    categoria: categoria || 'General',
    icono: icono || '📦'
  };

  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto); // 201 significa "Creado con éxito"
});

// PUT: Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio, stock, categoria, icono } = req.body;

  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  // Actualizamos los datos manteniendo valores anteriores si no se envían
  productos[indice] = {
    id,
    nombre: nombre !== undefined ? nombre : productos[indice].nombre,
    precio: precio !== undefined ? parseFloat(precio) : productos[indice].precio,
    stock: stock !== undefined ? parseInt(stock, 10) : productos[indice].stock,
    categoria: categoria !== undefined ? categoria : (productos[indice].categoria || 'General'),
    icono: icono !== undefined ? icono : (productos[indice].icono || '📦')
  };

  res.json(productos[indice]);
});

// DELETE: Eliminar un producto por ID
app.delete('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  productos.splice(indice, 1); // Quita el producto del arreglo
  res.json({ mensaje: `Producto con ID ${id} eliminado con éxito` });
});

// 5. PONER A ESCUCHAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});
