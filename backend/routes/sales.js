// ============================================
// backend/routes/sales.js - Updated with member integration
// ============================================

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all sales
router.get("/", auth, async (req, res) => {
  try {
    const { start_date, end_date, user_id, member_id } = req.query;

    let where = {};

    // Date filter
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = new Date(start_date);
      if (end_date) where.createdAt.lte = new Date(end_date);
    }

    // User filter (for kasir to see only their sales)
    if (user_id) {
      where.userId = parseInt(user_id);
    } else if (req.user.role === "kasir") {
      where.userId = req.user.id;
    }

    // Member filter
    if (member_id) {
      where.memberId = parseInt(member_id);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
        member: {
          select: { memberId: true, name: true },
        },
        items: {
          include: {
            product: {
              select: { name: true, barcode: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// Get sale by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: { name: true, email: true },
        },
        member: {
          select: { memberId: true, name: true, phone: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // Check access (kasir can only see their own sales)
    if (req.user.role === "kasir" && sale.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({ error: "Failed to fetch sale" });
  }
});

// Create new sale
router.post("/", auth, async (req, res) => {
  try {
    const {
      items,
      subtotal,
      tax,
      total,
      cashAmount,
      change,
      paymentMethod,
      memberId,
      memberDiscount,
      transactionDiscount,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in sale" });
    }

    // Generate sale number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const dailySalesCount = await prisma.sale.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const saleNumber = `TRX-${String(dailySalesCount + 1).padStart(
      3,
      "0"
    )}-${today}`;

    // Validate member if provided
    let validatedMember = null;
    if (memberId) {
      validatedMember = await prisma.member.findUnique({
        where: { memberId: memberId, isActive: true },
      });

      if (!validatedMember) {
        return res.status(400).json({ error: "Invalid or inactive member ID" });
      }
    }

    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Check stock availability for all items
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          );
        }
      }

      // Create sale
      const sale = await prisma.sale.create({
        data: {
          saleNumber,
          subtotal: parseFloat(subtotal),
          tax: parseFloat(tax),
          total: parseFloat(total),
          memberDiscount: parseFloat(memberDiscount) || 0,
          transactionDiscount: parseFloat(transactionDiscount) || 0,
          totalDiscount:
            (parseFloat(memberDiscount) || 0) +
            (parseFloat(transactionDiscount) || 0),
          cashAmount: cashAmount ? parseFloat(cashAmount) : null,
          change: change ? parseFloat(change) : null,
          paymentMethod: paymentMethod || "cash",
          memberId: validatedMember?.id || null,
          userId: req.user.id,
          notes,
          receiptPrinted: false,
        },
      });

      // Create sale items and update stock
      for (const item of items) {
        // Create sale item
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.price) * item.quantity,
            discount: item.discount || 0,
          },
        });

        // Update product stock
        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Create stock movement
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: -item.quantity,
            previousStock: updatedProduct.stock + item.quantity,
            newStock: updatedProduct.stock,
            saleId: sale.id,
            reference: saleNumber,
            notes: "Sale transaction",
            userId: req.user.id,
          },
        });
      }

      // Update member stats if member purchase
      if (validatedMember) {
        await prisma.member.update({
          where: { id: validatedMember.id },
          data: {
            totalPurchase: {
              increment: parseFloat(total),
            },
            visitCount: {
              increment: 1,
            },
            lastVisit: new Date(),
          },
        });
      }

      return sale;
    });

    // Fetch complete sale data
    const completeSale = await prisma.sale.findUnique({
      where: { id: result.id },
      include: {
        user: {
          select: { name: true },
        },
        member: {
          select: { memberId: true, name: true },
        },
        items: {
          include: {
            product: {
              select: { name: true, barcode: true },
            },
          },
        },
      },
    });

    res.status(201).json(completeSale);
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({
      error: error.message || "Failed to create sale",
    });
  }
});

// Get sales reports
router.get("/reports", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { period = "today" } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
    }

    const [totalSales, totalRevenue, topProducts, salesByUser] =
      await Promise.all([
        // Total sales count
        prisma.sale.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        }),

        // Total revenue
        prisma.sale.aggregate({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
        }),

        // Top selling products
        prisma.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: {
              createdAt: { gte: startDate, lte: endDate },
            },
          },
          _sum: { quantity: true },
          _count: { productId: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 10,
        }),

        // Sales by user
        prisma.sale.groupBy({
          by: ["userId"],
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
          _count: { id: true },
        }),
      ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });
        return {
          ...item,
          product,
        };
      })
    );

    // Get user details for sales by user
    const salesByUserWithDetails = await Promise.all(
      salesByUser.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: { name: true },
        });
        return {
          ...item,
          user,
        };
      })
    );

    res.json({
      period,
      startDate,
      endDate,
      totalSales,
      totalRevenue: totalRevenue._sum.total || 0,
      topProducts: topProductsWithDetails,
      salesByUser: salesByUserWithDetails,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ error: "Failed to generate sales report" });
  }
});

module.exports = router;
