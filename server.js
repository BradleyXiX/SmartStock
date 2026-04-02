const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock data
let products = [
  { id: 1, name: 'iPhone 15 Pro', sku: 'IPHONE-15P', price: 999.99, stockQuantity: 45 },
  { id: 2, name: 'Samsung Galaxy S24', sku: 'SAMSUNG-S24', price: 899.99, stockQuantity: 8 },
  { id: 3, name: 'iPad Air', sku: 'IPAD-AIR', price: 599.99, stockQuantity: 3 },
  { id: 4, name: 'MacBook Pro 16"', sku: 'MACBOOK-16', price: 2499.99, stockQuantity: 12 },
  { id: 5, name: 'AirPods Pro', sku: 'AIRPODS-PRO', price: 249.99, stockQuantity: 67 },
];

let sales = [
  { id: 1, productId: 1, quantitySold: 2, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
  { id: 2, productId: 2, quantitySold: 1, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) },
  { id: 3, productId: 1, quantitySold: 3, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  { id: 4, productId: 5, quantitySold: 5, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
  { id: 5, productId: 4, quantitySold: 1, date: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

let nextSaleId = 6;

// GET /api/products: Returns all products
app.get('/api/products', async (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sales: Create a sale and decrement stock if enough stock exists
app.post('/api/sales', async (req, res) => {
  const { productId, quantitySold } = req.body;

  if (!productId || typeof quantitySold !== 'number' || quantitySold <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const product = products.find(p => p.id === parseInt(productId));

    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    if (product.stockQuantity < quantitySold) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Decrement stock
    product.stockQuantity -= quantitySold;

    // Create sale record
    const sale = {
      id: nextSaleId++,
      productId: parseInt(productId),
      quantitySold: quantitySold,
      date: new Date()
    };

    sales.push(sale);

    res.status(201).json({ updatedProduct: product, sale });
  } catch (error) {
    console.error("Sale error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bi/dashboard: Return recent sales and low stock products
app.get('/api/bi/dashboard', async (req, res) => {
  try {
    // Recent sales data for chart (last 10 sales)
    const recentSales = sales.slice(-10).map(sale => {
      const product = products.find(p => p.id === sale.productId);
      return {
        name: product?.name || `Product ${sale.productId}`,
        quantitySold: sale.quantitySold,
        date: sale.date.toISOString().split('T')[0]
      };
    });

    // Products with stockQuantity < 10 for low stock alert
    const lowStockProducts = products.filter(p => p.stockQuantity < 10);

    res.json({
      salesChartData: recentSales,
      lowStockProducts: lowStockProducts
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`✓ SmartStock API Server running on port ${port}`);
});
