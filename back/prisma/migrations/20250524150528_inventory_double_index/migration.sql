-- DropIndex
DROP INDEX "Inventory_productId_key";

-- CreateIndex
CREATE INDEX "Inventory_productId_categoryId_idx" ON "Inventory"("productId", "categoryId");
