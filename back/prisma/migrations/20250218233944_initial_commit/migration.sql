/*
  Warnings:

  - A unique constraint covering the columns `[screeningId]` on the table `Consultation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "userId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_screeningId_key" ON "Consultation"("screeningId");

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
