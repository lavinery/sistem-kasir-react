// backend/routes/settings.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all settings
router.get("/", auth, async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();

    // Convert to object format for easier frontend consumption
    const settingsObject = {};
    settings.forEach((setting) => {
      let value = setting.value;

      // Convert based on type
      if (setting.type === "NUMBER") {
        value = parseFloat(value);
      } else if (setting.type === "BOOLEAN") {
        value = value === "true";
      } else if (setting.type === "JSON") {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error("Error parsing JSON setting:", setting.key, e);
        }
      }

      settingsObject[setting.key] = value;
    });

    res.json(settingsObject);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings
router.put("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const settingsData = req.body;
    const updatePromises = [];

    for (const [key, value] of Object.entries(settingsData)) {
      let stringValue = value.toString();
      let type = "STRING";

      if (typeof value === "number") {
        type = "NUMBER";
      } else if (typeof value === "boolean") {
        type = "BOOLEAN";
      } else if (typeof value === "object") {
        type = "JSON";
        stringValue = JSON.stringify(value);
      }

      updatePromises.push(
        prisma.settings.upsert({
          where: { key },
          update: { value: stringValue, type },
          create: { key, value: stringValue, type },
        })
      );
    }

    await Promise.all(updatePromises);

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Reset settings to default
router.post("/reset", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const defaultSettings = [
      { key: "tax_rate", value: "0.11", type: "NUMBER" },
      { key: "tax_enabled", value: "true", type: "BOOLEAN" },
      { key: "member_discount_rate", value: "0.05", type: "NUMBER" },
      { key: "member_discount_enabled", value: "true", type: "BOOLEAN" },
      { key: "min_stock_alert", value: "10", type: "NUMBER" },
      { key: "store_name", value: "Toko Alat Tulis & Kantor", type: "STRING" },
      {
        key: "store_address",
        value: "Jl. Pendidikan No. 123, Kudus, Jawa Tengah",
        type: "STRING",
      },
      { key: "store_phone", value: "0291-123456", type: "STRING" },
      {
        key: "receipt_footer",
        value:
          "Terima kasih atas kunjungan Anda!\nSelamat berbelanja kembali 😊",
        type: "STRING",
      },
      { key: "auto_print_receipt", value: "true", type: "BOOLEAN" },
    ];

    // Delete all existing settings
    await prisma.settings.deleteMany();

    // Create default settings
    await prisma.settings.createMany({
      data: defaultSettings,
    });

    res.json({ message: "Settings reset to default successfully" });
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({ error: "Failed to reset settings" });
  }
});

module.exports = router;
