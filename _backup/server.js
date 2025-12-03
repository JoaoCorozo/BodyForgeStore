const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Servir archivos estáticos desde 'public'

// Rutas API

// Obtener productos
app.get('/api/products', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al leer productos' });
        }
        res.json(JSON.parse(data));
    });
});

// Crear orden
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    newOrder.date = new Date().toISOString();
    newOrder.id = Date.now(); // ID simple basado en timestamp

    const ordersPath = path.join(__dirname, 'data', 'orders.json');

    fs.readFile(ordersPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al leer base de datos de órdenes' });
        }

        let orders = [];
        try {
            orders = JSON.parse(data);
        } catch (e) {
            orders = [];
        }

        orders.push(newOrder);

        fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al guardar la orden' });
            }
            res.status(201).json({ message: 'Orden creada exitosamente', orderId: newOrder.id });
        });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
