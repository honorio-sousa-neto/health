-- Add category, factor and self-reference to UnitOfMeasure

ALTER TABLE "UnitOfMeasure" ADD COLUMN "category"   TEXT;
ALTER TABLE "UnitOfMeasure" ADD COLUMN "factor"      DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "UnitOfMeasure" ADD COLUMN "baseUnitId"  UUID;

-- Remove duplicates before adding unique constraint (keeps first by ctid)
DELETE FROM "UnitOfMeasure" a
USING "UnitOfMeasure" b
WHERE a.ctid > b.ctid AND a.abbreviation = b.abbreviation;

ALTER TABLE "UnitOfMeasure" ADD CONSTRAINT "UnitOfMeasure_abbreviation_key" UNIQUE ("abbreviation");

ALTER TABLE "UnitOfMeasure" ADD CONSTRAINT "UnitOfMeasure_baseUnitId_fkey"
    FOREIGN KEY ("baseUnitId") REFERENCES "UnitOfMeasure"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
