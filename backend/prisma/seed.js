// backend/prisma/seed.js - Database seeding with comprehensive data
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("🧹 Cleaning existing data...");
    await prisma.stockMovement.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.member.deleteMany();
    await prisma.user.deleteMany();
    await prisma.settings.deleteMany();

    // Create Users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const kasirPassword = await bcrypt.hash("kasir123", 10);
    const gudangPassword = await bcrypt.hash("gudang123", 10);

    const adminUser = await prisma.user.create({
      data: {
        name: "Administrator",
        email: "admin@kasir.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
    });

    const kasirUser = await prisma.user.create({
      data: {
        name: "Kasir 1",
        email: "kasir@kasir.com",
        password: kasirPassword,
        role: "kasir",
        isActive: true,
      },
    });

    const gudangUser = await prisma.user.create({
      data: {
        name: "Staff Gudang",
        email: "gudang@kasir.com",
        password: gudangPassword,
        role: "gudang",
        isActive: true,
      },
    });

    // Create Categories
    console.log("📁 Creating categories...");
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Pulpen & Pensil",
          description: "Alat tulis untuk menulis dan menggambar",
        },
      }),
      prisma.category.create({
        data: {
          name: "Buku & Kertas",
          description: "Buku tulis, kertas, dan media tulis",
        },
      }),
      prisma.category.create({
        data: {
          name: "Alat Gambar",
          description: "Alat untuk menggambar dan melukis",
        },
      }),
      prisma.category.create({
        data: {
          name: "Perlengkapan Kantor",
          description: "Supplies untuk kebutuhan kantor",
        },
      }),
      prisma.category.create({
        data: {
          name: "Penggaris & Geometri",
          description: "Alat ukur dan geometri",
        },
      }),
      prisma.category.create({
        data: {
          name: "Tas & Tempat Pensil",
          description: "Tas sekolah dan tempat alat tulis",
        },
      }),
      prisma.category.create({
        data: {
          name: "Stationery Lainnya",
          description: "Alat tulis dan kantor lainnya",
        },
      }),
    ]);

    // Create Products
    console.log("📦 Creating products...");
    const products = await Promise.all([
      // Pulpen & Pensil
      prisma.product.create({
        data: {
          name: "Pulpen Pilot G2 0.7mm",
          description: "Pulpen gel premium dengan tinta halus",
          barcode: "PEN001",
          price: 5500,
          stock: 150,
          categoryId: categories[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Pensil 2B Faber Castell",
          description: "Pensil kayu berkualitas tinggi",
          barcode: "PEN002",
          price: 3000,
          stock: 200,
          categoryId: categories[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Pulpen Joyko GP-265",
          description: "Pulpen gel warna biru tinta halus",
          barcode: "PEN003",
          price: 2500,
          stock: 120,
          categoryId: categories[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Pensil Mekanik 0.5mm",
          description: "Pensil mekanik dengan grip nyaman",
          barcode: "PEN004",
          price: 8500,
          stock: 80,
          categoryId: categories[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Set Pulpen Warna Standler (12pcs)",
          description: "Set pulpen warna lengkap 12 warna",
          barcode: "PEN005",
          price: 45000,
          stock: 25,
          categoryId: categories[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Pensil Warna Greebel (24pcs)",
          description: "Pensil warna premium 24 warna",
          barcode: "PEN006",
          price: 35000,
          stock: 30,
          categoryId: categories[0].id,
        },
      }),

      // Buku & Kertas
      prisma.product.create({
        data: {
          name: "Buku Tulis 38 Lembar Sinar Dunia",
          description: "Buku tulis garis standar 38 lembar",
          barcode: "BUK001",
          price: 3500,
          stock: 300,
          categoryId: categories[1].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Buku Gambar A4",
          description: "Buku gambar polos ukuran A4",
          barcode: "BUK002",
          price: 8000,
          stock: 100,
          categoryId: categories[1].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Kertas HVS A4 70gsm (1 Rim)",
          description: "Kertas fotocopy putih 500 lembar",
          barcode: "KRT001",
          price: 45000,
          stock: 50,
          categoryId: categories[1].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Buku Tulis 58 Lembar Campus",
          description: "Buku tulis garis tebal 58 lembar",
          barcode: "BUK003",
          price: 5000,
          stock: 200,
          categoryId: categories[1].id,
        },
      }),

      // Alat Gambar
      prisma.product.create({
        data: {
          name: "Crayon Joyko 12 Warna",
          description: "Crayon lilin berkualitas 12 warna",
          barcode: "ART001",
          price: 12000,
          stock: 75,
          categoryId: categories[2].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Spidol Snowman Whiteboard",
          description: "Spidol papan tulis warna hitam",
          barcode: "ART002",
          price: 8500,
          stock: 60,
          categoryId: categories[2].id,
        },
      }),

      // Perlengkapan Kantor
      prisma.product.create({
        data: {
          name: "Stapler Joyko HD-10",
          description: "Stapler kecil untuk 10 lembar",
          barcode: "OFF001",
          price: 15000,
          stock: 40,
          categoryId: categories[3].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Isi Staples No.10",
          description: "Isi stapler ukuran standar",
          barcode: "OFF002",
          price: 2000,
          stock: 200,
          categoryId: categories[3].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Paper Clip Joyko (1 Box)",
          description: "Klip kertas ukuran sedang",
          barcode: "OFF003",
          price: 8000,
          stock: 80,
          categoryId: categories[3].id,
        },
      }),

      // Penggaris & Geometri
      prisma.product.create({
        data: {
          name: "Penggaris Plastik 30cm",
          description: "Penggaris transparan 30 cm",
          barcode: "GEO001",
          price: 3000,
          stock: 150,
          categoryId: categories[4].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Jangka Kompas Butterfly",
          description: "Jangka untuk menggambar lingkaran",
          barcode: "GEO002",
          price: 25000,
          stock: 35,
          categoryId: categories[4].id,
        },
      }),

      // Tas & Tempat Pensil
      prisma.product.create({
        data: {
          name: "Tempat Pensil Dompet Kain",
          description: "Tempat pensil model dompet",
          barcode: "BAG001",
          price: 15000,
          stock: 90,
          categoryId: categories[5].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Tas Ransel Sekolah",
          description: "Tas ransel untuk pelajar",
          barcode: "BAG002",
          price: 85000,
          stock: 20,
          categoryId: categories[5].id,
        },
      }),

      // Stationery Lainnya
      prisma.product.create({
        data: {
          name: "Penghapus Faber Castell",
          description: "Penghapus putih berkualitas",
          barcode: "STA001",
          price: 2500,
          stock: 180,
          categoryId: categories[6].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Tip-Ex Correction Pen",
          description: "Pen koreksi untuk menutupi kesalahan",
          barcode: "STA002",
          price: 7500,
          stock: 70,
          categoryId: categories[6].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Double Tape 1 inch",
          description: "Perekat dua sisi lebar 1 inch",
          barcode: "STA003",
          price: 12000,
          stock: 60,
          categoryId: categories[6].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Cutter Kenko",
          description: "Pisau cutter dengan mata pisau cadangan",
          barcode: "STA004",
          price: 8500,
          stock: 45,
          categoryId: categories[6].id,
        },
      }),
    ]);

    // Create Members
    console.log("👤 Creating members...");
    await Promise.all([
      prisma.member.create({
        data: {
          memberId: "MBR001",
          name: "Budi Santoso",
          email: "budi@email.com",
          phone: "081234567890",
          address: "Jl. Mawar No. 15, Kudus",
          discountRate: 0.05,
          totalPurchase: 125000,
          visitCount: 8,
          lastVisit: new Date(),
        },
      }),
      prisma.member.create({
        data: {
          memberId: "MBR002",
          name: "Siti Aminah",
          email: "siti@email.com",
          phone: "085678901234",
          address: "Jl. Melati No. 22, Kudus",
          discountRate: 0.05,
          totalPurchase: 89000,
          visitCount: 5,
          lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.member.create({
        data: {
          memberId: "MBR003",
          name: "Ahmad Rahman",
          email: "ahmad@email.com",
          phone: "087890123456",
          address: "Jl. Kenanga No. 8, Kudus",
          discountRate: 0.05,
          totalPurchase: 210000,
          visitCount: 12,
          lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Create Settings
    console.log("⚙️ Creating system settings...");
    await Promise.all([
      prisma.settings.create({
        data: {
          key: "memberDiscountEnabled",
          value: "true",
          type: "BOOLEAN",
        },
      }),
      prisma.settings.create({
        data: {
          key: "minStock",
          value: "10",
          type: "NUMBER",
        },
      }),
      prisma.settings.create({
        data: {
          key: "autoStockAlert",
          value: "true",
          type: "BOOLEAN",
        },
      }),
      prisma.settings.create({
        data: {
          key: "favoriteProductIds",
          value: JSON.stringify([
            products[0].id,
            products[1].id,
            products[6].id,
            products[7].id,
            products[11].id,
            products[15].id,
          ]),
          type: "JSON",
        },
      }),
      prisma.settings.create({
        data: {
          key: "maxFavorites",
          value: "6",
          type: "NUMBER",
        },
      }),
      prisma.settings.create({
        data: {
          key: "storeName",
          value: "Toko Alat Tulis & Kantor",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "storeAddress",
          value: "Jl. Pendidikan No. 123, Kudus, Jawa Tengah",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "storePhone",
          value: "0291-123456",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "receiptFooter",
          value:
            "Terima kasih atas kunjungan Anda!\nSelamat berbelanja kembali 😊",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "printReceiptAuto",
          value: "true",
          type: "BOOLEAN",
        },
      }),
      prisma.settings.create({
        data: {
          key: "currency",
          value: "IDR",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "currencySymbol",
          value: "Rp",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "dateFormat",
          value: "dd/MM/yyyy",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "allowDiscountEntry",
          value: "true",
          type: "BOOLEAN",
        },
      }),
      prisma.settings.create({
        data: {
          key: "allowNegativeStock",
          value: "false",
          type: "BOOLEAN",
        },
      }),
      prisma.settings.create({
        data: {
          key: "requireBarcodeForCheckout",
          value: "false",
          type: "BOOLEAN",
        },
      }),
    ]);

    // Create sample sales transactions
    console.log("💰 Creating sample sales...");

    // Get member IDs for sales
    const members = await prisma.member.findMany();

    const sampleSales = await Promise.all([
      prisma.sale.create({
        data: {
          saleNumber: "TRX-001-20240315",
          subtotal: 19000,
          memberDiscount: 950, // 5% member discount
          transactionDiscount: 0,
          totalDiscount: 950,
          tax: 1980.55,
          total: 20030.55,
          cashAmount: 25000,
          change: 4969.45,
          paymentMethod: "cash",
          memberId: members[0].id, // Budi Santoso
          userId: kasirUser.id,
          notes: "Pembelian alat tulis sekolah",
        },
      }),
      prisma.sale.create({
        data: {
          saleNumber: "TRX-002-20240315",
          subtotal: 45000,
          memberDiscount: 0,
          transactionDiscount: 5000, // Manual discount
          totalDiscount: 5000,
          tax: 4400,
          total: 44400,
          cashAmount: 50000,
          change: 5600,
          paymentMethod: "cash",
          userId: kasirUser.id,
          notes: "Pembelian kertas HVS",
        },
      }),
      prisma.sale.create({
        data: {
          saleNumber: "TRX-003-20240316",
          subtotal: 28500,
          memberDiscount: 1425, // 5% member discount
          transactionDiscount: 0,
          totalDiscount: 1425,
          tax: 2977.25,
          total: 30052.25,
          cashAmount: 35000,
          change: 4947.75,
          paymentMethod: "cash",
          memberId: members[1].id, // Siti Aminah
          userId: kasirUser.id,
          notes: "Pembelian perlengkapan kantor",
        },
      }),
    ]);

    // Create sale items for the sample sales
    console.log("🛒 Creating sale items...");
    await Promise.all([
      // Sale 1 items (Budi Santoso - Member discount)
      prisma.saleItem.create({
        data: {
          saleId: sampleSales[0].id,
          productId: products[0].id, // Pulpen Pilot G2
          quantity: 2,
          price: 5500,
          subtotal: 11000,
        },
      }),
      prisma.saleItem.create({
        data: {
          saleId: sampleSales[0].id,
          productId: products[6].id, // Buku Tulis 38 Lembar
          quantity: 2,
          price: 3500,
          subtotal: 7000,
        },
      }),
      prisma.saleItem.create({
        data: {
          saleId: sampleSales[0].id,
          productId: products[19].id, // Penghapus
          quantity: 1,
          price: 2500,
          subtotal: 2500,
        },
      }),

      // Sale 2 items (Non-member - Manual discount)
      prisma.saleItem.create({
        data: {
          saleId: sampleSales[1].id,
          productId: products[8].id, // Kertas HVS A4
          quantity: 1,
          price: 45000,
          subtotal: 45000,
        },
      }),

      // Sale 3 items (Siti Aminah - Member discount)
      prisma.saleItem.create({
        data: {
          saleId: sampleSales[2].id,
          productId: products[12].id, // Stapler
          quantity: 1,
          price: 15000,
          subtotal: 15000,
        },
      }),
      prisma.saleItem.create({
        data: {
          saleId: sampleSales[2].id,
          productId: products[13].id, // Isi Staples
          quantity: 5,
          price: 2000,
          subtotal: 10000,
        },
      }),
      prisma.saleItem.create({
        data: {
          saleId: sampleSales[2].id,
          productId: products[1].id, // Pensil 2B
          quantity: 1,
          price: 3500,
          subtotal: 3500,
        },
      }),
    ]);

    // Create stock movements for the sales
    console.log("📊 Creating stock movements...");
    await Promise.all([
      // Stock movements for sale 1
      prisma.stockMovement.create({
        data: {
          productId: products[0].id,
          type: "OUT",
          quantity: -2,
          previousStock: 150,
          newStock: 148,
          saleId: sampleSales[0].id,
          reference: "TRX-001-20240315",
          notes: "Sale transaction",
          userId: kasirUser.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: products[6].id,
          type: "OUT",
          quantity: -2,
          previousStock: 300,
          newStock: 298,
          saleId: sampleSales[0].id,
          reference: "TRX-001-20240315",
          notes: "Sale transaction",
          userId: kasirUser.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: products[19].id,
          type: "OUT",
          quantity: -1,
          previousStock: 180,
          newStock: 179,
          saleId: sampleSales[0].id,
          reference: "TRX-001-20240315",
          notes: "Sale transaction",
          userId: kasirUser.id,
        },
      }),

      // Stock movements for sale 2
      prisma.stockMovement.create({
        data: {
          productId: products[8].id,
          type: "OUT",
          quantity: -1,
          previousStock: 50,
          newStock: 49,
          saleId: sampleSales[1].id,
          reference: "TRX-002-20240315",
          notes: "Sale transaction",
          userId: kasirUser.id,
        },
      }),

      // Stock movements for sale 3
      prisma.stockMovement.create({
        data: {
          productId: products[12].id,
          type: "OUT",
          quantity: -1,
          previousStock: 40,
          newStock: 39,
          saleId: sampleSales[2].id,
          reference: "TRX-003-20240316",
          notes: "Sale transaction",
          userId: kasirUser.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: products[13].id,
          type: "OUT",
          quantity: -5,
          previousStock: 200,
          newStock: 195,
          saleId: sampleSales[2].id,
          reference: "TRX-003-20240316",
          notes: "Sale transaction",
          userId: kasirUser.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: products[1].id,
          type: "OUT",
          quantity: -1,
          previousStock: 200,
          newStock: 199,
          saleId: sampleSales[2].id,
          reference: "TRX-003-20240316",
          notes: "Sale transaction",
          userId: kasirUser.id,
        },
      }),

      // Sample stock adjustments (Gudang activities)
      prisma.stockMovement.create({
        data: {
          productId: products[1].id,
          type: "IN",
          quantity: 100,
          previousStock: 199,
          newStock: 299,
          reference: "STK-IN-001",
          notes: "Stock replenishment - Pensil 2B",
          userId: gudangUser.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: products[4].id,
          type: "IN",
          quantity: 25,
          previousStock: 25,
          newStock: 50,
          reference: "STK-IN-002",
          notes: "Stock replenishment - Set Pulpen Warna",
          userId: gudangUser.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: products[16].id,
          type: "ADJUSTMENT",
          quantity: -5,
          previousStock: 35,
          newStock: 30,
          reference: "STK-ADJ-001",
          notes: "Stock adjustment - Damaged items",
          userId: gudangUser.id,
        },
      }),
    ]);

    // Update product stocks based on movements
    console.log("🔄 Updating product stocks...");
    await Promise.all([
      prisma.product.update({
        where: { id: products[0].id },
        data: { stock: 148 },
      }),
      prisma.product.update({
        where: { id: products[1].id },
        data: { stock: 299 }, // After sale and restock
      }),
      prisma.product.update({
        where: { id: products[4].id },
        data: { stock: 50 }, // After restock
      }),
      prisma.product.update({
        where: { id: products[6].id },
        data: { stock: 298 },
      }),
      prisma.product.update({
        where: { id: products[8].id },
        data: { stock: 49 },
      }),
      prisma.product.update({
        where: { id: products[12].id },
        data: { stock: 39 },
      }),
      prisma.product.update({
        where: { id: products[13].id },
        data: { stock: 195 },
      }),
      prisma.product.update({
        where: { id: products[16].id },
        data: { stock: 30 }, // After adjustment
      }),
      prisma.product.update({
        where: { id: products[19].id },
        data: { stock: 179 },
      }),
    ]);

    // Update member purchase totals
    console.log("👤 Updating member statistics...");
    await Promise.all([
      prisma.member.update({
        where: { id: members[0].id }, // Budi Santoso
        data: {
          totalPurchase: 145030.55, // Original + new transaction
          visitCount: 9,
          lastVisit: new Date(),
        },
      }),
      prisma.member.update({
        where: { id: members[1].id }, // Siti Aminah
        data: {
          totalPurchase: 119052.25, // Original + new transaction
          visitCount: 6,
          lastVisit: new Date(),
        },
      }),
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log(`
🎉 Seeding Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 Users Created: 3
   • Admin: admin@kasir.com / admin123
   • Kasir: kasir@kasir.com / kasir123  
   • Gudang: gudang@kasir.com / gudang123

📁 Categories Created: ${categories.length}
📦 Products Created: ${products.length}
👤 Members Created: 3 (MBR001, MBR002, MBR003)
💰 Sample Sales: 3 transactions with complete items
⚙️ Settings: Complete system configuration
📊 Stock Movements: 15 transaction and adjustment records

🌟 Favorite Products Set:
   F1: ${products[0].name}
   F2: ${products[1].name}  
   F3: ${products[6].name}
   F4: ${products[7].name}
   F5: ${products[11].name}
   F6: ${products[15].name}

🚀 System ready for use!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Execute main function
main()
  .then(() => {
    console.log("🎉 Database seeding completed successfully!");
  })
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("🔌 Disconnecting from database...");
    await prisma.$disconnect();
    console.log("✅ Database connection closed.");
  });
