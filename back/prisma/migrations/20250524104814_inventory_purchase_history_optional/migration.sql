-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_categoryId_fkey";

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
