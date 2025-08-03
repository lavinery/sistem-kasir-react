// backend/routes/members.js - Simple version
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all members
router.get("/", auth, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        memberId: true,
        name: true,
        email: true,
        phone: true,
        discountRate: true,
        totalPurchase: true,
        visitCount: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// Validate member ID (for POS usage)
router.post("/validate", auth, async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const member = await prisma.member.findUnique({
      where: {
        memberId: memberId,
        isActive: true,
      },
      select: {
        id: true,
        memberId: true,
        name: true,
        discountRate: true,
        totalPurchase: true,
        visitCount: true,
      },
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found or inactive" });
    }

    res.json(member);
  } catch (error) {
    console.error("Error validating member:", error);
    res.status(500).json({ error: "Failed to validate member" });
  }
});

module.exports = router;
