/*
  Warnings:

  - You are about to drop the column `internId` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_internId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "internId";

-- CreateTable
CREATE TABLE "ServiceIntern" (
    "id" UUID NOT NULL,
    "internId" UUID,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceIntern_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceIntern" ADD CONSTRAINT "ServiceIntern_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceIntern" ADD CONSTRAINT "ServiceIntern_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE SET NULL ON UPDATE CASCADE;
