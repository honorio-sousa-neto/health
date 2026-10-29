/*
  Warnings:

  - A unique constraint covering the columns `[productId,batch]` on the table `BatchProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BatchProduct_productId_batch_key" ON "BatchProduct"("productId", "batch");
