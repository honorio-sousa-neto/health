/*
  Warnings:

  - A unique constraint covering the columns `[observationId,examId]` on the table `RequestExams` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internmentId,examId]` on the table `RequestExams` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RequestExams" DROP CONSTRAINT "RequestExams_consultationId_fkey";

-- AlterTable
ALTER TABLE "RequestExams" ALTER COLUMN "consultationId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RequestExams_observationId_examId_key" ON "RequestExams"("observationId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestExams_internmentId_examId_key" ON "RequestExams"("internmentId", "examId");

-- AddForeignKey
ALTER TABLE "RequestExams" ADD CONSTRAINT "RequestExams_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
