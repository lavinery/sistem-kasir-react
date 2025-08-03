// backend/routes/categories.js - Fixed version
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET all categories (PUBLIC - no auth required)
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET category by ID (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        products: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create category (REQUIRES AUTH)
router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update category (REQUIRES AUTH)
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name already exists (exclude current category)
    if (name && name !== existingCategory.name) {
      const duplicateName = await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          id: {
            not: parseInt(id),
          },
        },
      });

      if (duplicateName) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });

    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE category (REQUIRES AUTH)
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category with existing products. Please reassign or delete products first.",
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
