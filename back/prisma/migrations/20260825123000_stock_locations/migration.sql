-- A migração de lotes por localização depende desta tabela.
-- IF NOT EXISTS conserva instalações onde foi criada anteriormente fora do histórico.
CREATE TABLE IF NOT EXISTS "StockLocation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "StockLocation_pkey" PRIMARY KEY ("id")
);
