-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
    "name"         TEXT         NOT NULL,
    "abbreviation" TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- Add unitId to Service
ALTER TABLE "Service" ADD COLUMN "unitId" UUID;

-- Add unitId to PurchaseItem (replace old measure String)
ALTER TABLE "PurchaseItem" ADD COLUMN "unitId" UUID;
ALTER TABLE "PurchaseItem" DROP COLUMN IF EXISTS "measure";
ALTER TABLE "PurchaseItem" DROP COLUMN IF EXISTS "materialId";

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasure"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasure"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed common units
INSERT INTO "UnitOfMeasure" ("id", "name", "abbreviation", "updatedAt") VALUES
    (gen_random_uuid(), 'Mililitro',    'ml',        NOW()),
    (gen_random_uuid(), 'Litro',        'L',         NOW()),
    (gen_random_uuid(), 'Microlitro',   'µL',        NOW()),
    (gen_random_uuid(), 'Miligrama',    'mg',        NOW()),
    (gen_random_uuid(), 'Grama',        'g',         NOW()),
    (gen_random_uuid(), 'Quilograma',   'kg',        NOW()),
    (gen_random_uuid(), 'Unidade',      'un',        NOW()),
    (gen_random_uuid(), 'Caixa',        'cx',        NOW()),
    (gen_random_uuid(), 'Frasco',       'fr',        NOW()),
    (gen_random_uuid(), 'Ampola',       'amp',       NOW()),
    (gen_random_uuid(), 'Comprimido',   'comp',      NOW()),
    (gen_random_uuid(), 'Cápsula',      'cáps',      NOW()),
    (gen_random_uuid(), 'Tubo',         'tubo',      NOW()),
    (gen_random_uuid(), 'Placa',        'placa',     NOW()),
    (gen_random_uuid(), 'Kit',          'kit',       NOW()),
    (gen_random_uuid(), 'Teste',        'teste',     NOW()),
    (gen_random_uuid(), 'Par',          'par',       NOW()),
    (gen_random_uuid(), 'Rolo',         'rolo',      NOW());
