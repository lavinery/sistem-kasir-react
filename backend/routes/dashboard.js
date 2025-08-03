// backend/routes/dashboard.js - Fixed version
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard stats endpoint
router.get("/stats", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const [todaySales, todayRevenue, totalProducts, lowStockProducts] =
      await Promise.all([
        // Today's transaction count
        prisma.sale.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),

        // Today's revenue
        prisma.sale.aggregate({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          _sum: {
            total: true,
          },
        }),

        // Total products
        prisma.product.count({
          where: {
            isActive: true,
          },
        }),

        // Low stock products
        prisma.product.count({
          where: {
            stock: {
              lte: 10,
            },
            isActive: true,
          },
        }),
      ]);

    res.json({
      today: {
        sales: todaySales,
        revenue: todayRevenue._sum.total || 0,
      },
      inventory: {
        totalProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Recent activity endpoint
router.get("/activity", auth, async (req, res) => {
  try {
    const recentSales = await prisma.sale.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        member: {
          select: {
            name: true,
            memberId: true,
          },
        },
      },
    });

    res.json({
      recentSales,
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

// Basic dashboard endpoint (backward compatibility)
router.get("/", auth, (req, res) => {
  res.json({
    message: "Dashboard endpoint working",
    user: req.user.name,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
