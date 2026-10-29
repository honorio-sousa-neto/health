/*
  Warnings:

  - A unique constraint covering the columns `[productId,categoryId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Inventory_productId_categoryId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_categoryId_key" ON "Inventory"("productId", "categoryId");
