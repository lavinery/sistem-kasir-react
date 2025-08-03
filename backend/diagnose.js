// backend/diagnose.js - Complete diagnosis script
const { PrismaClient } = require("@prisma/client");
const mysql = require("mysql2/promise");

const prisma = new PrismaClient();

async function diagnosisComplete() {
  console.log("🔍 SISTEM KASIR - COMPLETE DIAGNOSIS");
  console.log("=====================================\n");

  // 1. Test raw MySQL connection
  console.log("1️⃣ Testing Raw MySQL Connection...");
  try {
    const connection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "sistem_kasir",
    });

    console.log("✅ Raw MySQL connection successful");

    // Check if database exists
    const [databases] = await connection.execute(
      "SHOW DATABASES LIKE 'sistem_kasir'"
    );
    if (databases.length > 0) {
      console.log("✅ Database sistem_kasir exists");

      // Check tables
      const [tables] = await connection.execute("SHOW TABLES");
      console.log(`📊 Found ${tables.length} tables:`);
      tables.forEach((table) => {
        console.log(`   - ${Object.values(table)[0]}`);
      });

      // Check specific tables with data count
      const expectedTables = [
        "categories",
        "products",
        "users",
        "sales",
        "sale_items",
      ];
      for (const tableName of expectedTables) {
        try {
          const [rows] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${tableName}`
          );
          console.log(`   📈 ${tableName}: ${rows[0].count} records`);
        } catch (error) {
          console.log(`   ❌ ${tableName}: Table not found`);
        }
      }
    } else {
      console.log("❌ Database sistem_kasir does not exist");
    }

    await connection.end();
  } catch (error) {
    console.log("❌ Raw MySQL connection failed:", error.message);
  }

  console.log("\n2️⃣ Testing Prisma Connection...");
  try {
    await prisma.$connect();
    console.log("✅ Prisma connection successful");

    // Test Prisma introspection
    console.log("🔍 Prisma introspection test...");
    try {
      const result = await prisma.$queryRaw`SELECT DATABASE() as current_db`;
      console.log("✅ Current database:", result[0].current_db);
    } catch (error) {
      console.log("❌ Prisma query failed:", error.message);
    }
  } catch (error) {
    console.log("❌ Prisma connection failed:", error.message);
  }

  console.log("\n3️⃣ Testing Prisma Models...");
  const models = ["category", "product", "user", "sale"];

  for (const modelName of models) {
    try {
      const count = await prisma[modelName].count();
      console.log(`✅ ${modelName}: ${count} records`);
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message}`);
    }
  }

  console.log("\n4️⃣ Environment Check...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL || "Not set");
  console.log("NODE_ENV:", process.env.NODE_ENV || "Not set");

  console.log("\n5️⃣ Recommendations...");

  // Generate recommendations
  console.log("🔧 RECOMMENDED ACTIONS:");
  console.log("1. Run: npx prisma migrate reset --force");
  console.log("2. Run: npx prisma db push");
  console.log("3. Run: npx prisma generate");
  console.log("4. Run: npx prisma db seed");
  console.log("5. Check .env file configuration");

  await prisma.$disconnect();
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});

// Run diagnosis
diagnosisComplete().catch(console.error);
