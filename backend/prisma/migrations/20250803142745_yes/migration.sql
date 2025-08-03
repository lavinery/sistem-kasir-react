/*
  Warnings:

  - You are about to drop the column `isActive` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[saleNumber]` on the table `sales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subtotal` to the `sale_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleNumber` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_items` DROP FOREIGN KEY `sale_items_saleId_fkey`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `isActive`;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `minStock` INTEGER NOT NULL DEFAULT 10,
    MODIFY `barcode` VARCHAR(191) NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL,
    MODIFY `categoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `sale_items` ADD COLUMN `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `subtotal` DECIMAL(12, 2) NOT NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `memberDiscount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `memberId` INTEGER NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `receiptPrinted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `saleNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalDiscount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `transactionDiscount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY `subtotal` DECIMAL(12, 2) NOT NULL,
    MODIFY `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY `total` DECIMAL(12, 2) NOT NULL,
    MODIFY `cashAmount` DECIMAL(12, 2) NULL,
    MODIFY `change` DECIMAL(12, 2) NULL;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `name` DROP DEFAULT,
    ALTER COLUMN `role` DROP DEFAULT;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `discountRate` DECIMAL(3, 2) NOT NULL DEFAULT 0.05,
    `totalPurchase` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `visitCount` INTEGER NOT NULL DEFAULT 0,
    `lastVisit` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `members_memberId_key`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `previousStock` INTEGER NOT NULL,
    `newStock` INTEGER NOT NULL,
    `saleId` INTEGER NULL,
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'STRING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `sales_saleNumber_key` ON `sales`(`saleNumber`);

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
