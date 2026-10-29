-- AlterEnum
ALTER TYPE "TypeItem" ADD VALUE 'CONSUMABLE';

-- DropForeignKey
ALTER TABLE "ExpendableMaterial" DROP CONSTRAINT "ExpendableMaterial_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "HistoryInventory" DROP CONSTRAINT "HistoryInventory_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialOfService" DROP CONSTRAINT "MaterialOfService_materialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialStock" DROP CONSTRAINT "MaterialStock_materialId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_expendableMaterialId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_expendableMaterialId_fkey";

-- AlterTable
ALTER TABLE "MaterialOfService" DROP CONSTRAINT "MaterialOfService_pkey",
DROP COLUMN "materialId",
ADD COLUMN     "consumableId" UUID NOT NULL,
ADD CONSTRAINT "MaterialOfService_pkey" PRIMARY KEY ("consumableId", "serviceId");

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "materialCategory" "MaterialCategory",
ADD COLUMN     "minimumStock" DOUBLE PRECISION;

-- DropTable
DROP TABLE "ExpendableMaterial";

-- DropTable
DROP TABLE "HistoryInventory";

-- DropTable
DROP TABLE "Inventory";

-- DropTable
DROP TABLE "Material";

-- DropTable
DROP TABLE "MaterialStock";

-- DropTable
DROP TABLE "Stock";

-- DropTable
DROP TABLE "Transaction";

-- DropEnum
DROP TYPE "MovementType";

-- AddForeignKey
ALTER TABLE "MaterialOfService" ADD CONSTRAINT "MaterialOfService_consumableId_fkey" FOREIGN KEY ("consumableId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
