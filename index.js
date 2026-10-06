// 1. IMPORTAR EXPRESS Y CONFIGURAR LA APP
const express = require('express');
const app = express();
const PORT = 3000;

// 2. MIDDLEWARE (Permite al servidor entender datos en formato JSON que vienen en el body)
app.use(express.json());

// 3. DATOS DE PRUEBA EN MEMORIA (Simula nuestra base de datos de productos)
let productos = [
  { id: 1, nombre: 'Laptop Gamer', precio: 2500, stock: 10 },
  { id: 2, nombre: 'Mouse Inalámbrico', precio: 50, stock: 30 },
  { id: 3, nombre: 'Teclado Mecánico', precio: 120, stock: 15 }
];

// 4. RUTAS DEL CRUD (Endpoints)

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
  const { nombre, precio, stock } = req.body;

  // Creamos un nuevo producto con un ID autoincrementable
  const nuevoProducto = {
    id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
    nombre,
    precio,
    stock
  };

  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto); // 201 significa "Creado con éxito"
});

// PUT: Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio, stock } = req.body;

  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  // Actualizamos los datos
  productos[indice] = { id, nombre, precio, stock };
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
