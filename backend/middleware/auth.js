// backend/middleware/auth.js - JWT Authentication Middleware
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "User account is inactive" });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    res.status(500).json({ error: "Server error in authentication" });
  }
};

// Alternative function name for backward compatibility
const authenticateToken = auth;

module.exports = auth;
module.exports.authenticateToken = authenticateToken;
