/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,productId,batch,expiration]` on the table `StockProducts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "EntryOrOut" ADD VALUE 'TRANSFER';

-- AlterTable
ALTER TABLE "StockProducts" ADD COLUMN     "batch" TEXT,
ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "expiration" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BatchProduct" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "batch" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "expiration" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentationStock" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "type" "EntryOrOut" NOT NULL DEFAULT 'ENTRY',
    "batchProductId" UUID,
    "sourceCategoryId" UUID,
    "destinationCategoryId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovimentationStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockProducts_categoryId_productId_batch_expiration_key" ON "StockProducts"("categoryId", "productId", "batch", "expiration");

-- AddForeignKey
ALTER TABLE "StockProducts" ADD CONSTRAINT "StockProducts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchProduct" ADD CONSTRAINT "BatchProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_batchProductId_fkey" FOREIGN KEY ("batchProductId") REFERENCES "BatchProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_sourceCategoryId_fkey" FOREIGN KEY ("sourceCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentationStock" ADD CONSTRAINT "MovimentationStock_destinationCategoryId_fkey" FOREIGN KEY ("destinationCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
