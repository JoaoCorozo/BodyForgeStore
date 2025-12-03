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
app.use(express.static('public')); // Serve static files from 'public' folder

// Database Paths
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Helper: Read JSON
const readJSON = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(JSON.parse(data || '[]'));
        });
    });
};

// Helper: Write JSON
const writeJSON = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Ensure orders file exists
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
}

// Routes

// GET /api/products
app.get('/api/products', async (req, res) => {
    try {
        const products = await readJSON(PRODUCTS_FILE);
        res.json(products);
    } catch (error) {
        console.error("Error reading products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = req.body;

        // Basic validation
        if (!newOrder.items || newOrder.items.length === 0) {
            return res.status(400).json({ error: "Order must contain items" });
        }

        const orders = await readJSON(ORDERS_FILE);

        const orderEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...newOrder
        };

        orders.push(orderEntry);
        await writeJSON(ORDERS_FILE, orders);

        console.log(`Order created: ${orderEntry.id}`);
        res.status(201).json({ message: "Order created successfully", orderId: orderEntry.id });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
