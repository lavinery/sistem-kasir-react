// ============================================
// backend/routes/favorites.js
// ============================================

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get favorite products
router.get("/", auth, async (req, res) => {
  try {
    const favorites = await prisma.product.findMany({
      where: {
        isFavorite: true,
        stock: { gt: 0 }, // Only products with stock
      },
      include: {
        category: true,
      },
      orderBy: { favoriteOrder: "asc" },
      take: 6, // Maximum 6 favorites
    });

    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorite products" });
  }
});

// Update favorite products
router.put("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { favoriteIds } = req.body; // Array of product IDs in order

    if (!Array.isArray(favoriteIds) || favoriteIds.length > 6) {
      return res.status(400).json({ error: "Invalid favorite products data" });
    }

    // First, remove all current favorites
    await prisma.product.updateMany({
      where: { isFavorite: true },
      data: {
        isFavorite: false,
        favoriteOrder: null,
      },
    });

    // Then set new favorites
    const updatePromises = favoriteIds.map((productId, index) =>
      prisma.product.update({
        where: { id: productId },
        data: {
          isFavorite: true,
          favoriteOrder: index + 1,
        },
      })
    );

    await Promise.all(updatePromises);

    res.json({ message: "Favorite products updated successfully" });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ error: "Failed to update favorite products" });
  }
});

module.exports = router;
