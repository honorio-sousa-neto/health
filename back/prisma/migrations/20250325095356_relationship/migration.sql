/*
  Warnings:

  - Added the required column `canal` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "consultationId" UUID;

-- AlterTable
ALTER TABLE "PrescriptionItem" ADD COLUMN     "canal" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
