/*
  Warnings:

  - Added the required column `productId` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_materialId_fkey";

-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "productId" UUID NOT NULL,
ALTER COLUMN "materialId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
