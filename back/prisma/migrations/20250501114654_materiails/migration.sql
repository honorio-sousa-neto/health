/*
  Warnings:

  - Added the required column `categoryId` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('reagent', 'consumable', 'equipment', 'epi', 'glassware', 'standardSolution');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "categoryId" UUID NOT NULL,
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "minimumStock" DOUBLE PRECISION,
ADD COLUMN     "type" "MaterialCategory" NOT NULL;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
