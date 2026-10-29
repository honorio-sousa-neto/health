import { Service, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class MaterialRepository {
  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return prisma.service.create({ data });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({ where: { id }, data });
  }

  async index(params: {
    take?: number;
    skip?: number;
    where?: Prisma.ServiceWhereInput;
    orderBy?: Prisma.ServiceOrderByWithRelationInput;
    include?: Prisma.ServiceInclude;
  }): Promise<Service[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.service.findMany({
      skip,
      take,
      where: { ...where, type: "CONSUMABLE", deletedAt: null },
      orderBy,
      include,
    });
  }

  async show(id: string, include?: Prisma.ServiceInclude): Promise<Service | null> {
    return prisma.service.findUnique({ where: { id }, include });
  }

  async destroy(id: string): Promise<Service> {
    return prisma.service.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async count(where?: Prisma.ServiceWhereInput): Promise<number> {
    return prisma.service.count({ where: { ...where, type: "CONSUMABLE", deletedAt: null } });
  }
}
