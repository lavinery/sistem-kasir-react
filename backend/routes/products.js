// backend/routes/products.js - Enhanced version
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all products (requires auth)
router.get("/", auth, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get product by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create new product (admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { name, description, barcode, price, stock, categoryId } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    // Check if barcode already exists
    if (barcode) {
      const existingProduct = await prisma.product.findUnique({
        where: { barcode },
      });

      if (existingProduct) {
        return res.status(400).json({ error: "Barcode already exists" });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        barcode,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId: categoryId ? parseInt(categoryId) : null,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { id } = req.params;
    const { name, description, barcode, price, stock, categoryId } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if barcode already exists (exclude current product)
    if (barcode && barcode !== existingProduct.barcode) {
      const duplicateBarcode = await prisma.product.findUnique({
        where: { barcode },
      });

      if (duplicateBarcode) {
        return res.status(400).json({ error: "Barcode already exists" });
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        barcode,
        price: price ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : null,
      },
      include: {
        category: true,
      },
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if product has sales history
    const salesCount = await prisma.saleItem.count({
      where: { productId: parseInt(id) },
    });

    if (salesCount > 0) {
      // Don't delete, just deactivate
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { isActive: false },
      });

      return res.json({
        message: "Product deactivated due to sales history",
        product,
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
