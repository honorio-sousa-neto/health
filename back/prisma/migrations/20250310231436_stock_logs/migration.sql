-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "quantity" DECIMAL(65,30),
ADD COLUMN     "stockId" UUID;

-- CreateTable
CREATE TABLE "StockProducts" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "transactionType" "EntryOrOut" NOT NULL DEFAULT 'ENTRY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockProducts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockProducts_productId_key" ON "StockProducts"("productId");

-- AddForeignKey
ALTER TABLE "StockProducts" ADD CONSTRAINT "StockProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
