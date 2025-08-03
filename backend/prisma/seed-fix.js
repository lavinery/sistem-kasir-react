// backend/prisma/seed-fix.js - Script untuk fix user passwords
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function fixUsers() {
  try {
    console.log("🔧 Fixing user passwords...");

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const kasirPassword = await bcrypt.hash("kasir123", 10);

    console.log("🔑 Admin password hash:", adminPassword);
    console.log("🔑 Kasir password hash:", kasirPassword);

    // Delete existing users
    await prisma.user.deleteMany();
    console.log("🗑️ Deleted existing users");

    // Create users with correct passwords
    const admin = await prisma.user.create({
      data: {
        name: "Administrator",
        email: "admin@kasir.com",
        password: adminPassword,
        role: "admin",
      },
    });

    const kasir = await prisma.user.create({
      data: {
        name: "Kasir 1",
        email: "kasir@kasir.com",
        password: kasirPassword,
        role: "kasir",
      },
    });

    console.log("✅ Created admin user:", { id: admin.id, email: admin.email });
    console.log("✅ Created kasir user:", { id: kasir.id, email: kasir.email });

    // Test password verification
    const testAdmin = await bcrypt.compare("admin123", adminPassword);
    const testKasir = await bcrypt.compare("kasir123", kasirPassword);

    console.log("🧪 Password test admin:", testAdmin);
    console.log("🧪 Password test kasir:", testKasir);

    console.log("🎉 User fix completed!");
    console.log("🔑 Login credentials:");
    console.log("   👨‍💼 Admin: admin@kasir.com / admin123");
    console.log("   👩‍💻 Kasir: kasir@kasir.com / kasir123");
  } catch (error) {
    console.error("❌ Error fixing users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUsers();
