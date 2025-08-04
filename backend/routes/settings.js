// backend/routes/settings.js - Enhanced settings management
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Default settings
const DEFAULT_SETTINGS = {
  // Tax Settings
  tax: 0.11,
  taxEnabled: true,

  // Member Discount Settings
  memberDiscountRate: 0.05,
  memberDiscountEnabled: true,

  // Stock Settings
  minStock: 10,
  autoStockAlert: true,

  // Favorite Products
  favoriteProductIds: [],
  maxFavorites: 6,

  // Store Information
  storeName: "Toko Alat Tulis & Kantor",
  storeAddress: "Jl. Pendidikan No. 123, Kudus",
  storePhone: "0291-123456",

  // Receipt Settings
  receiptFooter:
    "Terima kasih atas kunjungan Anda!\nSelamat berbelanja kembali 😊",
  printReceiptAuto: true,

  // Other Settings
  currency: "IDR",
  currencySymbol: "Rp",
  dateFormat: "dd/MM/yyyy",

  // User Permissions
  allowDiscountEntry: true,
  allowNegativeStock: false,
  requireBarcodeForCheckout: false,
};

// Get all settings
router.get("/", auth, async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();

    // Convert to object format
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
        // Use default value if parsing fails
        settingsObject[setting.key] = DEFAULT_SETTINGS[setting.key];
      }
    });

    // Merge with defaults for missing settings
    const completeSettings = { ...DEFAULT_SETTINGS, ...settingsObject };

    res.json(completeSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings (admin only)
router.put("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const settingsData = req.body;

    // Validate settings
    const validationErrors = validateSettings(settingsData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    // Prepare settings for database
    const settingsArray = Object.entries(settingsData).map(([key, value]) => {
      let type = "STRING";
      let stringValue = String(value);

      if (typeof value === "number") {
        type = "NUMBER";
      } else if (typeof value === "boolean") {
        type = "BOOLEAN";
        stringValue = value.toString();
      } else if (Array.isArray(value) || typeof value === "object") {
        type = "JSON";
        stringValue = JSON.stringify(value);
      }

      return {
        key,
        value: stringValue,
        type,
      };
    });

    // Update settings in database using transactions
    await prisma.$transaction(async (tx) => {
      for (const setting of settingsArray) {
        await tx.settings.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            type: setting.type,
            updatedAt: new Date(),
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type,
          },
        });
      }
    });

    res.json({
      message: "Settings updated successfully",
      settings: settingsData,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Get specific setting
router.get("/:key", auth, async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await prisma.settings.findUnique({
      where: { key },
    });

    if (!setting) {
      // Return default value if setting doesn't exist
      const defaultValue = DEFAULT_SETTINGS[key];
      if (defaultValue !== undefined) {
        return res.json({ key, value: defaultValue });
      }
      return res.status(404).json({ error: "Setting not found" });
    }

    let value;
    try {
      switch (setting.type) {
        case "NUMBER":
          value = parseFloat(setting.value);
          break;
        case "BOOLEAN":
          value = setting.value === "true";
          break;
        case "JSON":
          value = JSON.parse(setting.value);
          break;
        default:
          value = setting.value;
      }
    } catch (parseError) {
      console.error(`Error parsing setting ${key}:`, parseError);
      value = DEFAULT_SETTINGS[key];
    }

    res.json({ key: setting.key, value });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
});

// Update specific setting (admin only)
router.put("/:key", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { key } = req.params;
    const { value } = req.body;

    // Validate the setting
    const validationError = validateSingleSetting(key, value);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    let type = "STRING";
    let stringValue = String(value);

    if (typeof value === "number") {
      type = "NUMBER";
    } else if (typeof value === "boolean") {
      type = "BOOLEAN";
      stringValue = value.toString();
    } else if (Array.isArray(value) || typeof value === "object") {
      type = "JSON";
      stringValue = JSON.stringify(value);
    }

    const setting = await prisma.settings.upsert({
      where: { key },
      update: {
        value: stringValue,
        type,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: stringValue,
        type,
      },
    });

    res.json({
      message: "Setting updated successfully",
      setting: { key, value },
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

// Reset settings to defaults (admin only)
router.post("/reset", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    // Delete all existing settings
    await prisma.settings.deleteMany();

    // Insert default settings
    const defaultSettingsArray = Object.entries(DEFAULT_SETTINGS).map(
      ([key, value]) => {
        let type = "STRING";
        let stringValue = String(value);

        if (typeof value === "number") {
          type = "NUMBER";
        } else if (typeof value === "boolean") {
          type = "BOOLEAN";
          stringValue = value.toString();
        } else if (Array.isArray(value) || typeof value === "object") {
          type = "JSON";
          stringValue = JSON.stringify(value);
        }

        return {
          key,
          value: stringValue,
          type,
        };
      }
    );

    await prisma.settings.createMany({
      data: defaultSettingsArray,
    });

    res.json({
      message: "Settings reset to defaults successfully",
      settings: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({ error: "Failed to reset settings" });
  }
});

// Validation functions
function validateSettings(settings) {
  const errors = [];

  // Tax validation
  if (settings.tax !== undefined) {
    if (
      typeof settings.tax !== "number" ||
      settings.tax < 0 ||
      settings.tax > 1
    ) {
      errors.push("Tax must be a number between 0 and 1");
    }
  }

  // Member discount validation
  if (settings.memberDiscountRate !== undefined) {
    if (
      typeof settings.memberDiscountRate !== "number" ||
      settings.memberDiscountRate < 0 ||
      settings.memberDiscountRate > 1
    ) {
      errors.push("Member discount rate must be a number between 0 and 1");
    }
  }

  // Min stock validation
  if (settings.minStock !== undefined) {
    if (typeof settings.minStock !== "number" || settings.minStock < 0) {
      errors.push("Minimum stock must be a positive number");
    }
  }

  // Max favorites validation
  if (settings.maxFavorites !== undefined) {
    if (
      typeof settings.maxFavorites !== "number" ||
      settings.maxFavorites < 1 ||
      settings.maxFavorites > 10
    ) {
      errors.push("Max favorites must be a number between 1 and 10");
    }
  }

  // Store name validation
  if (settings.storeName !== undefined) {
    if (
      typeof settings.storeName !== "string" ||
      settings.storeName.trim().length === 0
    ) {
      errors.push("Store name is required");
    }
  }

  return errors;
}

function validateSingleSetting(key, value) {
  switch (key) {
    case "tax":
      if (typeof value !== "number" || value < 0 || value > 1) {
        return "Tax must be a number between 0 and 1";
      }
      break;
    case "memberDiscountRate":
      if (typeof value !== "number" || value < 0 || value > 1) {
        return "Member discount rate must be a number between 0 and 1";
      }
      break;
    case "minStock":
      if (typeof value !== "number" || value < 0) {
        return "Minimum stock must be a positive number";
      }
      break;
    case "maxFavorites":
      if (typeof value !== "number" || value < 1 || value > 10) {
        return "Max favorites must be a number between 1 and 10";
      }
      break;
    case "storeName":
      if (typeof value !== "string" || value.trim().length === 0) {
        return "Store name is required";
      }
      break;
  }
  return null;
}

module.exports = router;
