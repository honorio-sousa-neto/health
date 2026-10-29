/*
  Warnings:

  - A unique constraint covering the columns `[consultationId,examId]` on the table `RequestExams` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RequestExams_consultationId_examId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "RequestExams_consultationId_examId_key" ON "RequestExams"("consultationId", "examId");
