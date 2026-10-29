-- Doses por embalagem vendável (ex.: comprimidos por cartela).
-- Receita em doses -> fatura/stock em embalagens, por arredondamento para cima.
ALTER TABLE "Service" ADD COLUMN "unitsPerPackage" DOUBLE PRECISION;
