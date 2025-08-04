// backend/routes/favorites.js - Enhanced favorites management
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get favorite products
router.get("/", auth, async (req, res) => {
  try {
    // Get favorite product IDs from settings
    const favoriteSetting = await prisma.settings.findUnique({
      where: { key: "favoriteProductIds" },
    });

    if (!favoriteSetting || !favoriteSetting.value) {
      return res.json([]);
    }

    let favoriteIds;
    try {
      favoriteIds = JSON.parse(favoriteSetting.value);
    } catch (parseError) {
      console.error("Error parsing favorite IDs:", parseError);
      return res.json([]);
    }

    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      return res.json([]);
    }

    // Get the actual products
    const favoriteProducts = await prisma.product.findMany({
      where: {
        id: { in: favoriteIds },
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Sort products by the order in favoriteIds array
    const sortedProducts = favoriteIds
      .map((id) => favoriteProducts.find((product) => product.id === id))
      .filter((product) => product !== undefined);

    res.json(sortedProducts);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorite products" });
  }
});

// Update favorite products (admin only)
router.put("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { favoriteIds } = req.body;

    // Validation
    if (!Array.isArray(favoriteIds)) {
      return res.status(400).json({ error: "favoriteIds must be an array" });
    }

    if (favoriteIds.length > 6) {
      return res
        .status(400)
        .json({ error: "Maximum 6 favorite products allowed" });
    }

    // Validate that all IDs exist and are active products
    if (favoriteIds.length > 0) {
      const validProducts = await prisma.product.findMany({
        where: {
          id: { in: favoriteIds },
          isActive: true,
        },
      });

      if (validProducts.length !== favoriteIds.length) {
        return res
          .status(400)
          .json({ error: "Some product IDs are invalid or inactive" });
      }
    }

    // Update or create the setting
    await prisma.settings.upsert({
      where: { key: "favoriteProductIds" },
      update: {
        value: JSON.stringify(favoriteIds),
        type: "JSON",
      },
      create: {
        key: "favoriteProductIds",
        value: JSON.stringify(favoriteIds),
        type: "JSON",
      },
    });

    // Get the updated favorite products
    const favoriteProducts =
      favoriteIds.length > 0
        ? await prisma.product.findMany({
            where: {
              id: { in: favoriteIds },
              isActive: true,
            },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : [];

    // Sort by the order in favoriteIds
    const sortedProducts = favoriteIds
      .map((id) => favoriteProducts.find((product) => product.id === id))
      .filter((product) => product !== undefined);

    res.json({
      message: "Favorite products updated successfully",
      favorites: sortedProducts,
    });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ error: "Failed to update favorite products" });
  }
});

// Add product to favorites (admin only)
router.post("/add/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const productId = parseInt(req.params.id);

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: "Product not found or inactive" });
    }

    // Get current favorites
    const favoriteSetting = await prisma.settings.findUnique({
      where: { key: "favoriteProductIds" },
    });

    let currentFavorites = [];
    if (favoriteSetting && favoriteSetting.value) {
      try {
        currentFavorites = JSON.parse(favoriteSetting.value);
      } catch (parseError) {
        console.error("Error parsing current favorites:", parseError);
      }
    }

    // Check if already in favorites
    if (currentFavorites.includes(productId)) {
      return res.status(400).json({ error: "Product already in favorites" });
    }

    // Check maximum limit
    if (currentFavorites.length >= 6) {
      return res
        .status(400)
        .json({ error: "Maximum 6 favorite products allowed" });
    }

    // Add to favorites
    const newFavorites = [...currentFavorites, productId];

    // Update setting
    await prisma.settings.upsert({
      where: { key: "favoriteProductIds" },
      update: {
        value: JSON.stringify(newFavorites),
        type: "JSON",
      },
      create: {
        key: "favoriteProductIds",
        value: JSON.stringify(newFavorites),
        type: "JSON",
      },
    });

    res.json({
      message: "Product added to favorites successfully",
      productId: productId,
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Failed to add product to favorites" });
  }
});

// Remove product from favorites (admin only)
router.delete("/remove/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const productId = parseInt(req.params.id);

    // Get current favorites
    const favoriteSetting = await prisma.settings.findUnique({
      where: { key: "favoriteProductIds" },
    });

    if (!favoriteSetting || !favoriteSetting.value) {
      return res.status(404).json({ error: "Product not in favorites" });
    }

    let currentFavorites = [];
    try {
      currentFavorites = JSON.parse(favoriteSetting.value);
    } catch (parseError) {
      console.error("Error parsing current favorites:", parseError);
      return res.status(500).json({ error: "Error parsing favorites data" });
    }

    // Check if product is in favorites
    if (!currentFavorites.includes(productId)) {
      return res.status(404).json({ error: "Product not in favorites" });
    }

    // Remove from favorites
    const newFavorites = currentFavorites.filter((id) => id !== productId);

    // Update setting
    await prisma.settings.update({
      where: { key: "favoriteProductIds" },
      data: {
        value: JSON.stringify(newFavorites),
        type: "JSON",
      },
    });

    res.json({
      message: "Product removed from favorites successfully",
      productId: productId,
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Failed to remove product from favorites" });
  }
});

// Get available products for favorites (exclude current favorites)
router.get("/available", auth, async (req, res) => {
  try {
    // Get current favorites
    const favoriteSetting = await prisma.settings.findUnique({
      where: { key: "favoriteProductIds" },
    });

    let currentFavorites = [];
    if (favoriteSetting && favoriteSetting.value) {
      try {
        currentFavorites = JSON.parse(favoriteSetting.value);
      } catch (parseError) {
        console.error("Error parsing current favorites:", parseError);
      }
    }

    // Get all products except current favorites
    const availableProducts = await prisma.product.findMany({
      where: {
        id: { notIn: currentFavorites },
        isActive: true,
      },
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

    res.json(availableProducts);
  } catch (error) {
    console.error("Error fetching available products:", error);
    res.status(500).json({ error: "Failed to fetch available products" });
  }
});

module.exports = router;
