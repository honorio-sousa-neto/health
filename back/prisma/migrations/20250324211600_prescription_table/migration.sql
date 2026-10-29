/*
  Warnings:

  - Added the required column `type` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PrescriptionType" AS ENUM ('AMBULATORY', 'PHARMACY');

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "type" "PrescriptionType" NOT NULL,
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "PrescriptionItem" ADD COLUMN     "prescriptionId" UUID;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
