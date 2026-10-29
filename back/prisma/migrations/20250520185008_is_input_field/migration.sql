-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isInput" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "typeInput" TEXT;
