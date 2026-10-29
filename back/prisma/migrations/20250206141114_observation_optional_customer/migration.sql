-- DropForeignKey
ALTER TABLE "Screening" DROP CONSTRAINT "Screening_nurseId_fkey";

-- AlterTable
ALTER TABLE "Screening" ALTER COLUMN "nurseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Screening" ADD CONSTRAINT "Screening_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
