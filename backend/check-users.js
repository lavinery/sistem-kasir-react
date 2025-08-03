// backend/check-users.js - Script untuk cek user data
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log("👀 Checking users in database...\n");

    const users = await prisma.user.findMany();

    console.log(`📊 Found ${users.length} users:`);

    for (const user of users) {
      console.log(`\n👤 User ${user.id}:`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hash: ${user.password}`);

      // Test password verification
      const testPassword =
        user.email === "admin@kasir.com" ? "admin123" : "kasir123";
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(
        `   Password test (${testPassword}): ${
          isValid ? "✅ VALID" : "❌ INVALID"
        }`
      );
    }

    // Test database connection
    console.log("\n🔍 Testing database connection...");
    const count = await prisma.user.count();
    console.log(`✅ Database connected. Total users: ${count}`);
  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
