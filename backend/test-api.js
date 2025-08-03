// backend/test-api.js - File untuk test API
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("🔍 Testing database connection...");

    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Count records
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();

    console.log("📊 Database Summary:");
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Users: ${userCount}`);

    // Test fetching products
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        category: true,
      },
    });

    console.log("📦 Sample Products:");
    products.forEach((product) => {
      console.log(
        `   - ${product.name} (${product.category.name}) - Rp ${product.price}`
      );
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Database Error:", error);
  }
}

// Test API endpoints
async function testAPI() {
  try {
    const fetch = (await import("node-fetch")).default;

    console.log("\n🌐 Testing API endpoints...");

    // Test products endpoint
    const productsResponse = await fetch("http://localhost:5000/api/products");
    const products = await productsResponse.json();

    console.log(`✅ GET /api/products - Status: ${productsResponse.status}`);
    console.log(`   Products found: ${products.length || 0}`);

    // Test categories endpoint
    const categoriesResponse = await fetch(
      "http://localhost:5000/api/categories"
    );
    const categories = await categoriesResponse.json();

    console.log(
      `✅ GET /api/categories - Status: ${categoriesResponse.status}`
    );
    console.log(`   Categories found: ${categories.length || 0}`);
  } catch (error) {
    console.error("❌ API Test Error:", error.message);
  }
}

// Run tests
async function runTests() {
  await testDatabase();

  // Give server time to start if needed
  console.log("\n⏳ Waiting for server...");
  setTimeout(testAPI, 2000);
}

runTests();
