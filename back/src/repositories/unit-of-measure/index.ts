import { prisma } from "../../database/prisma";

type UnitPayload = {
  name: string;
  abbreviation: string;
  category?: string | null;
  factor?: number;
  baseUnitId?: string | null;
};

export class UnitOfMeasureRepository {
  async index(search?: string) {
    return prisma.unitOfMeasure.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { abbreviation: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { baseUnit: { select: { id: true, name: true, abbreviation: true } } },
      orderBy: [{ category: "asc" }, { factor: "asc" }],
    });
  }

  async show(id: string) {
    return prisma.unitOfMeasure.findUnique({
      where: { id },
      include: { baseUnit: { select: { id: true, name: true, abbreviation: true } } },
    });
  }

  async create(data: UnitPayload) {
    return prisma.unitOfMeasure.create({ data });
  }

  async update(id: string, data: Partial<UnitPayload>) {
    return prisma.unitOfMeasure.update({ where: { id }, data });
  }

  async destroy(id: string) {
    return prisma.unitOfMeasure.delete({ where: { id } });
  }
}
