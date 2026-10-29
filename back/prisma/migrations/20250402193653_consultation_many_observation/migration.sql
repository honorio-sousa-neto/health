/*
  Warnings:

  - You are about to drop the column `observationId` on the `Consultation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_observationId_fkey";

-- DropIndex
DROP INDEX "Consultation_observationId_key";

-- AlterTable
ALTER TABLE "Consultation" DROP COLUMN "observationId";

-- AlterTable
ALTER TABLE "Observation" ADD COLUMN     "consultationId" UUID;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
