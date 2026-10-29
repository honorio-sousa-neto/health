/*
  Warnings:

  - You are about to drop the column `customerId` on the `Observation` table. All the data in the column will be lost.
  - You are about to drop the column `nurseId` on the `Observation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Observation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[observationId]` on the table `Consultation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internmentId]` on the table `Consultation` will be added. If there are existing duplicate values, this will fail.
  - Made the column `serviceId` on table `Observation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_internmentId_fkey";

-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_observationId_fkey";

-- DropForeignKey
ALTER TABLE "Observation" DROP CONSTRAINT "Observation_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Observation" DROP CONSTRAINT "Observation_nurseId_fkey";

-- DropForeignKey
ALTER TABLE "Observation" DROP CONSTRAINT "Observation_serviceId_fkey";

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "serviceId" UUID;

-- AlterTable
ALTER TABLE "Observation" DROP COLUMN "customerId",
DROP COLUMN "nurseId",
DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "serviceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RequestExams" ADD COLUMN     "internmentId" UUID,
ADD COLUMN     "observationId" UUID;

-- CreateTable
CREATE TABLE "Internment" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Internment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_observationId_key" ON "Consultation"("observationId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_internmentId_key" ON "Consultation"("internmentId");

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_internmentId_fkey" FOREIGN KEY ("internmentId") REFERENCES "Internment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internment" ADD CONSTRAINT "Internment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestExams" ADD CONSTRAINT "RequestExams_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestExams" ADD CONSTRAINT "RequestExams_internmentId_fkey" FOREIGN KEY ("internmentId") REFERENCES "Internment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
