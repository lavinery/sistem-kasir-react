// backend/server.js - Main server file
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Import routes with error handling
let authRoutes,
  categoriesRoutes,
  productsRoutes,
  salesRoutes,
  membersRoutes,
  usersRoutes,
  settingsRoutes,
  favoritesRoutes,
  dashboardRoutes;

try {
  authRoutes = require("./routes/auth");
  categoriesRoutes = require("./routes/categories");
  productsRoutes = require("./routes/products");
  salesRoutes = require("./routes/sales");
  membersRoutes = require("./routes/members");
  usersRoutes = require("./routes/users");
  settingsRoutes = require("./routes/settings");
  favoritesRoutes = require("./routes/favorites");
  dashboardRoutes = require("./routes/dashboard");
  console.log("✅ All routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading routes:", error.message);
  process.exit(1);
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173", // Vite default port
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173", // Vite default port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "POS Backend Server is running",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Database test endpoint
app.get("/api/test", async (req, res) => {
  try {
    // Test database connectivity
    const [categories, products, users, sales, members] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.sale.count(),
      prisma.member.count(),
    ]);

    res.json({
      status: "Database Connected",
      data: {
        categories,
        products,
        users,
        sales,
        members,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      status: "Database Error",
      error: error.message,
    });
  }
});

// API Routes with error handling
try {
  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/sales", salesRoutes);
  app.use("/api/members", membersRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/favorites", favoritesRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  console.log("✅ All API routes registered successfully");
} catch (error) {
  console.error("❌ Error registering routes:", error.message);
}

// Catch-all for undefined API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "GET /health",
      "GET /api/test",
      "POST /api/auth/login",
      "GET /api/categories",
      "GET /api/products",
      "GET /api/sales",
      "GET /api/members",
      "GET /api/users",
      "GET /api/settings",
      "GET /api/favorites",
    ],
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for non-API routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 POS Backend Server Started Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server URL: http://localhost:${PORT}
🏥 Health Check: http://localhost:${PORT}/health
🧪 Database Test: http://localhost:${PORT}/api/test
📅 Started at: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available API Endpoints:
• POST /api/auth/login - User authentication
• GET  /api/categories - Get all categories  
• GET  /api/products - Get all products
• GET  /api/sales - Get sales transactions
• GET  /api/members - Get all members
• GET  /api/users - Get all users (admin only)
• GET  /api/settings - Get system settings
• GET  /api/favorites - Get favorite products
• PUT  /api/favorites - Update favorite products

Ready to serve POS requests! 🛒✨
`);
});

module.exports = app;
