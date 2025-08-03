// backend/prisma/seed.js - Enhanced seed for Stationery Store
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed for Stationery Store POS...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.supplierInvoiceItem.deleteMany();
    await prisma.supplierInvoice.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.member.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.settings.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Data cleared successfully");

    // Create categories for stationery store
    console.log("📂 Creating stationery categories...");
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Pulpen & Marker",
          description:
            "Pulpen, ballpoint, gel pen, marker, dan alat tulis sejenis",
        },
      }),
      prisma.category.create({
        data: {
          name: "Pensil & Pensil Warna",
          description: "Pensil grafit, pensil warna, pensil mekanik",
        },
      }),
      prisma.category.create({
        data: {
          name: "Buku & Kertas",
          description: "Buku tulis, kertas HVS, kertas gambar, amplop",
        },
      }),
      prisma.category.create({
        data: {
          name: "Perlengkapan Kantor",
          description:
            "Gunting, stepler, paper clip, penggaris, dan alat kantor",
        },
      }),
      prisma.category.create({
        data: {
          name: "Alat Gambar & Lukis",
          description: "Crayon, cat air, kuas, canvas, alat gambar teknik",
        },
      }),
      prisma.category.create({
        data: {
          name: "Lem & Perekat",
          description: "Lem cair, lem stick, double tape, isolasi",
        },
      }),
      prisma.category.create({
        data: {
          name: "Penghapus & Korektor",
          description:
            "Penghapus karet, penghapus pensil, tip-ex, correction tape",
        },
      }),
    ]);

    console.log(`✅ Created ${categories.length} stationery categories`);

    // Create users with different roles
    console.log("👥 Creating users...");
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedKasirPassword = await bcrypt.hash("kasir123", 10);
    const hashedGudangPassword = await bcrypt.hash("gudang123", 10);

    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: "Administrator",
          email: "admin@kasir.com",
          password: hashedAdminPassword,
          role: "admin",
          phone: "0291-123456",
          address: "Jl. Admin No. 1, Kudus",
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          name: "Kasir 1",
          email: "kasir@kasir.com",
          password: hashedKasirPassword,
          role: "kasir",
          phone: "0291-123457",
          address: "Jl. Kasir No. 2, Kudus",
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          name: "Staff Gudang",
          email: "gudang@kasir.com",
          password: hashedGudangPassword,
          role: "gudang",
          phone: "0291-123458",
          address: "Jl. Gudang No. 3, Kudus",
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create members
    console.log("👤 Creating sample members...");
    const members = await Promise.all([
      prisma.member.create({
        data: {
          memberId: "MBR001",
          name: "Budi Santoso",
          email: "budi@email.com",
          phone: "081234567890",
          address: "Jl. Mawar No. 15, Kudus",
          discountRate: 0.05,
          totalPurchase: 150000,
          visitCount: 8,
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          memberId: "MBR002",
          name: "Siti Aminah",
          email: "siti@email.com",
          phone: "081234567891",
          address: "Jl. Melati No. 20, Kudus",
          discountRate: 0.05,
          totalPurchase: 75000,
          visitCount: 3,
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${members.length} members`);

    // Create products for stationery store
    console.log("📦 Creating stationery products...");
    const productsData = [
      // Pulpen & Marker (Category 1) - FAVORITES
      {
        name: "Pilot G2 Gel Pen 0.7mm",
        description: "Pulpen gel premium dengan tinta halus dan tahan lama",
        price: 5500,
        stock: 25,
        barcode: "PEN001",
        categoryId: categories[0].id,
        brand: "Pilot",
        supplier: "PT Pilot Indonesia",
        unit: "pcs",
        isFavorite: true,
        favoriteOrder: 1,
        minStock: 10,
      },
      {
        name: "Stabilo Boss Original Highlighter",
        description: "Marker stabilo untuk highlighting dengan berbagai warna",
        price: 8500,
        stock: 30,
        barcode: "STB001",
        categoryId: categories[0].id,
        brand: "Stabilo",
        supplier: "PT Stabilo Indonesia",
        unit: "pcs",
        isFavorite: false,
        minStock: 15,
      },
      {
        name: "Snowman Permanent Marker",
        description: "Spidol permanen hitam untuk berbagai keperluan",
        price: 4500,
        stock: 40,
        barcode: "SNW001",
        categoryId: categories[0].id,
        brand: "Snowman",
        supplier: "CV Alat Tulis Jaya",
        unit: "pcs",
        isFavorite: false,
        minStock: 20,
      },

      // Pensil & Pensil Warna (Category 2) - FAVORITES
      {
        name: "Faber Castell 2B Pencil",
        description:
          "Pensil 2B berkualitas tinggi untuk menulis dan menggambar",
        price: 2500,
        stock: 50,
        barcode: "PEN002",
        categoryId: categories[1].id,
        brand: "Faber Castell",
        supplier: "PT Faber Castell Indonesia",
        unit: "pcs",
        isFavorite: true,
        favoriteOrder: 3,
        minStock: 25,
      },
      {
        name: "Faber Castell Pensil Warna 12 Set",
        description: "Set pensil warna 12 warna untuk mewarnai",
        price: 18500,
        stock: 15,
        barcode: "FC001",
        categoryId: categories[1].id,
        brand: "Faber Castell",
        supplier: "PT Faber Castell Indonesia",
        unit: "set",
        isFavorite: false,
        minStock: 8,
      },

      // Buku & Kertas (Category 3) - FAVORITES
      {
        name: "Buku Tulis Sinar Dunia 38 Lembar",
        description: "Buku tulis dengan garis standar 38 lembar",
        price: 3500,
        stock: 100,
        barcode: "BUK001",
        categoryId: categories[2].id,
        brand: "Sinar Dunia",
        supplier: "PT Sinar Dunia",
        unit: "pcs",
        isFavorite: true,
        favoriteOrder: 2,
        minStock: 30,
      },
      {
        name: "Kertas HVS A4 70gsm (1 Rim)",
        description: "Kertas HVS putih A4 70gsm isi 500 lembar",
        price: 45000,
        stock: 25,
        barcode: "HVS001",
        categoryId: categories[2].id,
        brand: "Paper One",
        supplier: "PT Paper Sejahtera",
        unit: "rim",
        isFavorite: false,
        minStock: 10,
      },
      {
        name: "Amplop Putih No. 90",
        description: "Amplop putih ukuran standar untuk surat",
        price: 500,
        stock: 200,
        barcode: "AMP001",
        categoryId: categories[2].id,
        brand: "Standard",
        supplier: "CV Amplop Jaya",
        unit: "pcs",
        isFavorite: false,
        minStock: 50,
      },

      // Perlengkapan Kantor (Category 4) - FAVORITES
      {
        name: "Penggaris Plastik 30cm",
        description: "Penggaris plastik transparan 30cm",
        price: 3000,
        stock: 35,
        barcode: "RUL001",
        categoryId: categories[3].id,
        brand: "Standard",
        supplier: "CV Alat Kantor",
        unit: "pcs",
        isFavorite: true,
        favoriteOrder: 5,
        minStock: 15,
      },
      {
        name: "Gunting Joyko SC-848",
        description: "Gunting kantor berkualitas dengan pegangan nyaman",
        price: 12000,
        stock: 20,
        barcode: "GUN001",
        categoryId: categories[3].id,
        brand: "Joyko",
        supplier: "PT Joyko Indonesia",
        unit: "pcs",
        isFavorite: false,
        minStock: 8,
      },
      {
        name: "Stepler Joyko HD-50",
        description: "Stepler kecil untuk 20 lembar kertas",
        price: 15000,
        stock: 15,
        barcode: "STP001",
        categoryId: categories[3].id,
        brand: "Joyko",
        supplier: "PT Joyko Indonesia",
        unit: "pcs",
        isFavorite: false,
        minStock: 8,
      },
      {
        name: "Paper Clip No. 3 (1 Box)",
        description: "Paper clip besi ukuran standar isi 100 pcs",
        price: 8000,
        stock: 25,
        barcode: "PC001",
        categoryId: categories[3].id,
        brand: "Standard",
        supplier: "CV Alat Kantor",
        unit: "box",
        isFavorite: false,
        minStock: 10,
      },

      // Alat Gambar & Lukis (Category 5)
      {
        name: "Crayon Faber Castell 12 Warna",
        description: "Crayon warna berkualitas untuk anak-anak",
        price: 18500,
        stock: 20,
        barcode: "CRY001",
        categoryId: categories[4].id,
        brand: "Faber Castell",
        supplier: "PT Faber Castell Indonesia",
        unit: "set",
        isFavorite: false,
        minStock: 8,
      },
      {
        name: "Cat Air Joyko 12 Warna",
        description: "Cat air untuk melukis dengan kuas",
        price: 25000,
        stock: 12,
        barcode: "CAT001",
        categoryId: categories[4].id,
        brand: "Joyko",
        supplier: "PT Joyko Indonesia",
        unit: "set",
        isFavorite: false,
        minStock: 5,
      },

      // Lem & Perekat (Category 6) - FAVORITES
      {
        name: "Lem Povinal 60ml",
        description: "Lem cair serbaguna untuk kertas dan karton",
        price: 6500,
        stock: 30,
        barcode: "LEM001",
        categoryId: categories[5].id,
        brand: "Povinal",
        supplier: "PT Povinal Indonesia",
        unit: "pcs",
        isFavorite: true,
        favoriteOrder: 6,
        minStock: 15,
      },
      {
        name: "Lem Stick UHU 21g",
        description: "Lem stick praktis untuk kertas",
        price: 12000,
        stock: 25,
        barcode: "UHU001",
        categoryId: categories[5].id,
        brand: "UHU",
        supplier: "PT UHU Indonesia",
        unit: "pcs",
        isFavorite: false,
        minStock: 10,
      },
      {
        name: "Double Tape 1 Inch",
        description: "Double tape putih lebar 1 inch",
        price: 8500,
        stock: 20,
        barcode: "DT001",
        categoryId: categories[5].id,
        brand: "Standard",
        supplier: "CV Alat Kantor",
        unit: "roll",
        isFavorite: false,
        minStock: 10,
      },

      // Penghapus & Korektor (Category 7) - FAVORITES
      {
        name: "Penghapus Steadtler Mars Plastic",
        description: "Penghapus putih berkualitas tinggi",
        price: 4000,
        stock: 40,
        barcode: "ERA001",
        categoryId: categories[6].id,
        brand: "Steadtler",
        supplier: "PT Steadtler Indonesia",
        unit: "pcs",
        isFavorite: true,
        favoriteOrder: 4,
        minStock: 20,
      },
      {
        name: "Tip-Ex Correction Fluid",
        description: "Cairan koreksi putih dengan kuas",
        price: 7500,
        stock: 25,
        barcode: "TPX001",
        categoryId: categories[6].id,
        brand: "Tip-Ex",
        supplier: "PT Correction Indonesia",
        unit: "pcs",
        isFavorite: false,
        minStock: 12,
      },
    ];

    const products = [];
    for (const productData of productsData) {
      const product = await prisma.product.create({
        data: productData,
      });
      products.push(product);
    }

    console.log(`✅ Created ${products.length} stationery products`);

    // Create system settings
    console.log("⚙️ Creating system settings...");
    const settings = await Promise.all([
      prisma.settings.create({
        data: {
          key: "tax_rate",
          value: "0.11",
          type: "NUMBER",
        },
      }),
      prisma.settings.create({
        data: {
          key: "tax_enabled",
          value: "true",
          type: "BOOLEAN",
        },
      }),
      prisma.settings.create({
        data: {
          key: "member_discount_rate",
          value: "0.05",
          type: "NUMBER",
        },
      }),
      prisma.settings.create({
        data: {
          key: "member_discount_enabled",
          value: "true",
          type: "BOOLEAN",
        },
      }),
      prisma.settings.create({
        data: {
          key: "min_stock_alert",
          value: "10",
          type: "NUMBER",
        },
      }),
      prisma.settings.create({
        data: {
          key: "store_name",
          value: "Toko Alat Tulis & Kantor",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "store_address",
          value: "Jl. Pendidikan No. 123, Kudus, Jawa Tengah",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "store_phone",
          value: "0291-123456",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "receipt_footer",
          value:
            "Terima kasih atas kunjungan Anda!\nSelamat berbelanja kembali 😊",
          type: "STRING",
        },
      }),
      prisma.settings.create({
        data: {
          key: "auto_print_receipt",
          value: "true",
          type: "BOOLEAN",
        },
      }),
    ]);

    console.log(`✅ Created ${settings.length} system settings`);

    // Create sample sales
    console.log("💰 Creating sample sales...");
    const sale = await prisma.sale.create({
      data: {
        saleNumber:
          "TRX-001-" + new Date().toISOString().slice(0, 10).replace(/-/g, ""),
        subtotal: 14000,
        memberDiscount: 700, // 5% member discount
        transactionDiscount: 0,
        totalDiscount: 700,
        tax: 1463, // 11% from (subtotal - discount)
        total: 14763,
        cashAmount: 15000,
        change: 237,
        paymentMethod: "cash",
        memberId: members[0].id,
        userId: users[1].id, // Kasir
        receiptPrinted: true,
        notes: "Transaksi sample untuk testing",
      },
    });

    // Create sale items
    await Promise.all([
      prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[0].id, // Pilot G2 Gel Pen
          quantity: 2,
          price: 5500,
          subtotal: 11000,
          discount: 0,
        },
      }),
      prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[2].id, // Buku Tulis
          quantity: 1,
          price: 3000,
          subtotal: 3000,
          discount: 0,
        },
      }),
    ]);

    // Create stock movements for the sale
    await Promise.all([
      prisma.stockMovement.create({
        data: {
          productId: products[0].id,
          type: "OUT",
          quantity: -2,
          previousStock: 25,
          newStock: 23,
          saleId: sale.id,
          reference: sale.saleNumber,
          notes: "Penjualan barang",
          userId: users[1].id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId: products[2].id,
          type: "OUT",
          quantity: -1,
          previousStock: 100,
          newStock: 99,
          saleId: sale.id,
          reference: sale.saleNumber,
          notes: "Penjualan barang",
          userId: users[1].id,
        },
      }),
    ]);

    console.log("✅ Created sample sale with stock movements");

    console.log("🎉 Seed completed successfully!");

    // Summary
    const finalCategoryCount = await prisma.category.count();
    const finalProductCount = await prisma.product.count();
    const finalUserCount = await prisma.user.count();
    const finalMemberCount = await prisma.member.count();
    const finalSaleCount = await prisma.sale.count();
    const finalSettingsCount = await prisma.settings.count();
    const favoriteProducts = await prisma.product.findMany({
      where: { isFavorite: true },
      orderBy: { favoriteOrder: "asc" },
    });

    console.log("📊 Database summary:");
    console.log(`   - Categories: ${finalCategoryCount}`);
    console.log(`   - Users: ${finalUserCount}`);
    console.log(`   - Members: ${finalMemberCount}`);
    console.log(`   - Products: ${finalProductCount}`);
    console.log(`   - Favorite Products: ${favoriteProducts.length}`);
    console.log(`   - Sales: ${finalSaleCount}`);
    console.log(`   - Settings: ${finalSettingsCount}`);

    console.log("🔑 Login credentials:");
    console.log("   👨‍💼 Admin: admin@kasir.com / admin123");
    console.log("   👩‍💻 Kasir: kasir@kasir.com / kasir123");
    console.log("   📦 Gudang: gudang@kasir.com / gudang123");

    console.log("👤 Sample members:");
    console.log("   🆔 Member ID: MBR001 (Budi Santoso)");
    console.log("   🆔 Member ID: MBR002 (Siti Aminah)");

    console.log("⭐ Favorite products (F1-F6):");
    favoriteProducts.forEach((product, index) => {
      console.log(
        `   F${index + 1}: ${product.name} - Rp ${product.price.toLocaleString(
          "id-ID"
        )}`
      );
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
