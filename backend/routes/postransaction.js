// backend/routes/postransaction.js - POS Transaction routes
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get transaction initialization data
router.get("/init", auth, async (req, res) => {
  try {
    const [products, categories, favorites, settings] = await Promise.all([
      // Get all active products
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { name: "asc" },
      }),

      // Get all categories
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),

      // Get favorite products
      getFavoriteProducts(),

      // Get system settings
      getSystemSettings(),
    ]);

    res.json({
      products: products || [],
      categories: categories || [],
      favorites: favorites || [],
      settings: settings || getDefaultSettings(),
    });
  } catch (error) {
    console.error("Error initializing POS transaction:", error);
    res.status(500).json({
      error: "Failed to initialize POS transaction",
      products: [],
      categories: [],
      favorites: [],
      settings: getDefaultSettings(),
    });
  }
});

// Search products by barcode or name
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const searchTerm = q.trim();

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { barcode: { contains: searchTerm } },
          {
            id: isNaN(parseInt(searchTerm)) ? undefined : parseInt(searchTerm),
          },
        ].filter((condition) => condition !== undefined),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
});

// Process checkout transaction
router.post("/checkout", auth, async (req, res) => {
  try {
    const {
      items,
      subtotal,
      tax,
      total,
      discount = 0,
      memberDiscount = 0,
      transactionDiscount = 0,
      memberId = null,
      paymentMethod = "cash",
      notes = "",
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    if (!subtotal || !total || subtotal <= 0 || total <= 0) {
      return res.status(400).json({ error: "Invalid amounts" });
    }

    // Validate stock availability
    const stockCheck = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, stock: true, name: true, isActive: true },
        });

        if (!product || !product.isActive) {
          throw new Error(`Product ${item.productId} not found or inactive`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        return {
          productId: product.id,
          newStock: product.stock - item.quantity,
        };
      })
    );

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sale record
      const sale = await tx.sale.create({
        data: {
          subtotal: parseFloat(subtotal),
          tax: parseFloat(tax),
          total: parseFloat(total),
          discount: parseFloat(discount),
          memberDiscount: parseFloat(memberDiscount),
          transactionDiscount: parseFloat(transactionDiscount),
          memberId: memberId,
          paymentMethod: paymentMethod,
          userId: req.user.id,
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: parseFloat(item.price),
              subtotal: parseFloat(item.price) * item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, barcode: true },
              },
            },
          },
          user: {
            select: { id: true, name: true },
          },
          member: {
            select: { id: true, name: true, memberId: true },
          },
        },
      });

      // Update product stocks
      await Promise.all(
        stockCheck.map(({ productId, newStock }) =>
          tx.product.update({
            where: { id: productId },
            data: { stock: newStock },
          })
        )
      );

      return sale;
    });

    res.json({
      success: true,
      message: "Transaction completed successfully",
      sale: result,
      receiptData: generateReceiptData(result),
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      error: "Transaction failed",
      message: error.message,
    });
  }
});

// Get product by barcode
router.get("/barcode/:barcode", auth, async (req, res) => {
  try {
    const { barcode } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { barcode: barcode },
          { id: isNaN(parseInt(barcode)) ? -1 : parseInt(barcode) },
        ],
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Get member by ID
router.get("/member/:memberId", auth, async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await prisma.member.findFirst({
      where: {
        memberId: memberId,
        isActive: true,
      },
      select: {
        id: true,
        memberId: true,
        name: true,
        email: true,
        phone: true,
        discountRate: true,
      },
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});

// Helper functions
async function getFavoriteProducts() {
  try {
    const favoriteSetting = await prisma.settings.findUnique({
      where: { key: "favoriteProductIds" },
    });

    if (!favoriteSetting || !favoriteSetting.value) {
      return [];
    }

    const favoriteIds = JSON.parse(favoriteSetting.value);

    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      return [];
    }

    const favoriteProducts = await prisma.product.findMany({
      where: {
        id: { in: favoriteIds },
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    // Sort by favorite order
    return favoriteIds
      .map((id) => favoriteProducts.find((product) => product.id === id))
      .filter((product) => product !== undefined);
  } catch (error) {
    console.error("Error fetching favorite products:", error);
    return [];
  }
}

async function getSystemSettings() {
  try {
    const settings = await prisma.settings.findMany();
    const settingsObject = {};

    settings.forEach((setting) => {
      try {
        switch (setting.type) {
          case "NUMBER":
            settingsObject[setting.key] = parseFloat(setting.value);
            break;
          case "BOOLEAN":
            settingsObject[setting.key] = setting.value === "true";
            break;
          case "JSON":
            settingsObject[setting.key] = JSON.parse(setting.value);
            break;
          default:
            settingsObject[setting.key] = setting.value;
        }
      } catch (parseError) {
        console.error(`Error parsing setting ${setting.key}:`, parseError);
      }
    });

    return { ...getDefaultSettings(), ...settingsObject };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return getDefaultSettings();
  }
}

function getDefaultSettings() {
  return {
    tax: 0.11,
    taxEnabled: true,
    memberDiscountRate: 0.05,
    memberDiscountEnabled: true,
    minStock: 10,
    storeName: "Toko Alat Tulis & Kantor",
    storeAddress: "Jl. Pendidikan No. 123, Kudus",
    storePhone: "0291-123456",
    currency: "IDR",
    currencySymbol: "Rp",
  };
}

function generateReceiptData(sale) {
  return {
    saleId: sale.id,
    timestamp: sale.createdAt,
    cashier: sale.user.name,
    member: sale.member
      ? {
          name: sale.member.name,
          memberId: sale.member.memberId,
        }
      : null,
    items: sale.items.map((item) => ({
      name: item.product.name,
      barcode: item.product.barcode,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    })),
    totals: {
      subtotal: sale.subtotal,
      memberDiscount: sale.memberDiscount,
      transactionDiscount: sale.transactionDiscount,
      tax: sale.tax,
      total: sale.total,
    },
    paymentMethod: sale.paymentMethod,
  };
}

module.exports = router;
