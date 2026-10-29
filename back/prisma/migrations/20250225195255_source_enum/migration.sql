-- CreateEnum
CREATE TYPE "Source" AS ENUM ('PRIMARY', 'SECONDARY');

-- AlterTable
ALTER TABLE "RequestExams" ADD COLUMN     "source" "Source" NOT NULL DEFAULT 'PRIMARY';
