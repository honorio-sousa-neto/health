import { MaterialOfService } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateMaterialOfService } from "../../validator/material-service.validator";

export class MaterialOfServiceRepository {
  async create(data: TCreateMaterialOfService): Promise<MaterialOfService | null> {
    return prisma.materialOfService.create({ data });
  }

  async createMany(items: TCreateMaterialOfService[]): Promise<MaterialOfService[]> {
    const result: MaterialOfService[] = [];
    for (const item of items) {
      const response = await prisma.materialOfService.upsert({
        where: {
          consumableId_serviceId: {
            consumableId: item.consumableId,
            serviceId: item.serviceId,
          },
        },
        update: { quantity: item.quantity },
        create: { ...item },
      });
      result.push(response);
    }
    return result;
  }

  /**
   * Substitui a receita de um serviço: a lista recebida passa a ser a verdade.
   * Remove os consumíveis que já não constam e faz upsert dos restantes,
   * tudo numa transação.
   */
  async replaceForService(
    serviceId: string,
    items: { consumableId: string; quantity: number }[]
  ): Promise<MaterialOfService[]> {
    const manter = items.map((i) => i.consumableId);
    return prisma.$transaction(async (tx) => {
      await tx.materialOfService.deleteMany({
        where: {
          serviceId,
          ...(manter.length ? { consumableId: { notIn: manter } } : {}),
        },
      });
      const result: MaterialOfService[] = [];
      for (const item of items) {
        result.push(
          await tx.materialOfService.upsert({
            where: {
              consumableId_serviceId: { consumableId: item.consumableId, serviceId },
            },
            update: { quantity: item.quantity },
            create: { serviceId, consumableId: item.consumableId, quantity: item.quantity },
          })
        );
      }
      return result;
    });
  }
}
