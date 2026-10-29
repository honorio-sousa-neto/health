-- Lotes por localização: o mesmo lote pode existir em vários locais.
ALTER TABLE "BatchProduct" ADD COLUMN "locationId" UUID;

-- Backfill: lotes existentes vão para a localização padrão (se houver).
UPDATE "BatchProduct"
SET "locationId" = (
  SELECT id FROM "StockLocation"
  WHERE "isDefault" = true AND "deletedAt" IS NULL
  ORDER BY "createdAt" ASC LIMIT 1
)
WHERE "locationId" IS NULL;

-- Unicidade passa de (produto, lote) para (produto, lote, localização).
DROP INDEX IF EXISTS "BatchProduct_productId_batch_key";
CREATE UNIQUE INDEX "BatchProduct_productId_batch_locationId_key"
  ON "BatchProduct"("productId", "batch", "locationId");

-- FK para a localização.
ALTER TABLE "BatchProduct"
  ADD CONSTRAINT "BatchProduct_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "StockLocation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
