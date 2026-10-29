-- Data da factura do fornecedor.
-- `createdAt` continua a marcar o momento do registo; esta marca o documento.
-- São coisas diferentes: registar hoje uma factura de há três dias data-a de
-- hoje, e a ordem do custo médio ponderado passa a ser a errada.
ALTER TABLE "Purchase" ADD COLUMN "date" TIMESTAMP(3);

-- As compras já existentes ficam com a data de registo, que é a melhor
-- aproximação disponível.
UPDATE "Purchase" SET "date" = "createdAt" WHERE "date" IS NULL;
