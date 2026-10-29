/*
  Warnings:

  - You are about to drop the column `name` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `Consultation` table. All the data in the column will be lost.
  - The `bloodPressure` column on the `Screening` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_serviceId_fkey";

-- DropIndex
DROP INDEX "Consultation_serviceId_key";

-- AlterTable
ALTER TABLE "Consultation" DROP COLUMN "name",
DROP COLUMN "serviceId",
ADD COLUMN     "screeningId" UUID;

-- AlterTable
ALTER TABLE "Screening" DROP COLUMN "bloodPressure",
ADD COLUMN     "bloodPressure" TEXT;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "Screening"("id") ON DELETE SET NULL ON UPDATE CASCADE;
