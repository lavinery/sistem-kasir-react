// ============================================
// backend/routes/members.js
// ============================================

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
      include: {
        sales: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5, // Last 5 transactions
        },
      },
    });

    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// Get member by ID
router.get("/:memberId", auth, async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { memberId: req.params.memberId },
      include: {
        sales: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
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

// Create new member
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, phone, address, discountRate } = req.body;

    // Generate member ID
    const memberCount = await prisma.member.count();
    const memberId = `MBR${String(memberCount + 1).padStart(3, "0")}`;

    const member = await prisma.member.create({
      data: {
        memberId,
        name,
        email,
        phone,
        address,
        discountRate: discountRate || 0.05,
        isActive: true,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ error: "Failed to create member" });
  }
});

// Update member
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, phone, address, discountRate, isActive } = req.body;

    const member = await prisma.member.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        email,
        phone,
        address,
        discountRate,
        isActive,
      },
    });

    res.json(member);
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: "Failed to update member" });
  }
});

// Validate member ID (for POS usage)
router.post("/validate", auth, async (req, res) => {
  try {
    const { memberId } = req.body;

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

// Update member purchase stats (called after successful sale)
router.post("/:id/purchase", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const memberId = parseInt(req.params.id);

    const member = await prisma.member.update({
      where: { id: memberId },
      data: {
        totalPurchase: {
          increment: amount,
        },
        visitCount: {
          increment: 1,
        },
        lastVisit: new Date(),
      },
    });

    res.json(member);
  } catch (error) {
    console.error("Error updating member purchase:", error);
    res.status(500).json({ error: "Failed to update member purchase" });
  }
});

module.exports = router;
