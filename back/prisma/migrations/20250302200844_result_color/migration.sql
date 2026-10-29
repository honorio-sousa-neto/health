-- CreateEnum
CREATE TYPE "ResultTest" AS ENUM ('GREEN', 'RED');

-- AlterTable
ALTER TABLE "RequestExams" ADD COLUMN     "resultColor" "ResultTest";
