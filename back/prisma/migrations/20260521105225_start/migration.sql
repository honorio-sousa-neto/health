/*
  Warnings:

  - You are about to drop the `StockProducts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockProducts" DROP CONSTRAINT "StockProducts_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "StockProducts" DROP CONSTRAINT "StockProducts_productId_fkey";

-- AlterTable
ALTER TABLE "MovimentationStock" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "StockProducts";
