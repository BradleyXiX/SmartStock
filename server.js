const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/products: Returns all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
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
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check stock
      const product = await tx.product.findUnique({
        where: { id: parseInt(productId) }
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stockQuantity < quantitySold) {
        throw new Error("Insufficient stock");
      }

      // 2. Decrement stock
      const updatedProduct = await tx.product.update({
        where: { id: parseInt(productId) },
        data: {
          stockQuantity: {
            decrement: quantitySold
          }
        }
      });

      // 3. Create sale record
      const sale = await tx.sale.create({
        data: {
          productId: parseInt(productId),
          quantitySold: quantitySold
        }
      });

      return { updatedProduct, sale };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Transaction error:", error);
    if (error.message === "Insufficient stock" || error.message === "Product not found") {
       return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bi/dashboard: Return recent sales and low stock products
app.get('/api/bi/dashboard', async (req, res) => {
  try {
    // Recent sales data for chart
    const recentSales = await prisma.sale.findMany({
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    // Format data for chart
    const salesData = recentSales.map(sale => ({
      name: sale.product.name,
      quantitySold: sale.quantitySold,
      date: sale.date.toISOString().split('T')[0]
    }));

    // Products with stockQuantity < 10 for low stock alert
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQuantity: {
          lt: 10
        }
      }
    });

    res.json({
      salesChartData: salesData.reverse(), // Reverse to show chronological order
      lowStockProducts: lowStockProducts
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
