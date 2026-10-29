/*
  Warnings:

  - Added the required column `nurseId` to the `Observation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Observation" ADD COLUMN     "nurseId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
