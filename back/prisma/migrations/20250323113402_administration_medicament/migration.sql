-- CreateTable
CREATE TABLE "AdministrationMedicament" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdministrationMedicament_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdministrationMedicament" ADD CONSTRAINT "AdministrationMedicament_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrationMedicament" ADD CONSTRAINT "AdministrationMedicament_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrationMedicament" ADD CONSTRAINT "AdministrationMedicament_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
