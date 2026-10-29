-- AlterTable
ALTER TABLE "RequestExams" ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "result" JSONB;
