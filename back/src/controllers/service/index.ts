import { Category, MovimentationStock, Service, TypeItem } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { MaterialOfServiceRepository } from "../../repositories/material-service";
import { ServiceRepository } from "../../repositories/service";
import {
  TAddStock,
  TAttachMaterial,
  TCreateService,
  TUpdateService,
  attachMaterial,
  createService,
  updateService,
  addStock,
} from "../../validator/service.validator";

export class ServiceController {
  constructor(private readonly repository: ServiceRepository) {}
  private readonly repositoryMaterialOfService =
    new MaterialOfServiceRepository();
  async listPrices(params: { category: string }): Promise<{
    data: Service[];
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const { category } = params;
    const data = await this.repository.findAll({
      where: {
        category: {
          categoryId: category,
        },
      },
    });
    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
  async internment(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: Service[] | null;

    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, categoryId } = params;

    const data = await this.repository.internmment({
      where: {
        name: { contains: "Internamento", mode: "insensitive" },
        deletedAt: null,
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async list(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: Service[] | null;

    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, categoryId } = params;

    const data = await this.repository.indexAll({
      where: {
        // type: "PRODUCT",
        name: { contains: search, mode: "insensitive" },
        deletedAt: null,
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async observation(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: Service[] | null;

    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, categoryId } = params;

    const data = await this.repository.internmment({
      where: {
        name: { contains: "Observação", mode: "insensitive" },
        deletedAt: null,
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async surgeries(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: Service[] | null;

    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, categoryId } = params;

    const data = await this.repository.indexAll({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: "Cirurgia", mode: "insensitive" } },
          { name: { contains: "Nebuliz",  mode: "insensitive" } },
        ],
      },
      include: { category: { include: { category: true } } },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async administrationMedicaments(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: Service[] | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.internmment({
      where: {
        name: { contains: "Administração", mode: "insensitive" },
        deletedAt: null,
      },
    });
    return { data, statusCode: 200, message: "OK", success: true };
  }

  async pharmacyList(params: { search?: string }): Promise<{
    data: Service[] | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { search } = params;
    const data = await this.repository.findAll({
      where: {
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
        OR: [
          { category: { name: { startsWith: "Farm", mode: "insensitive" } } },
          { category: { category: { name: { startsWith: "Farm", mode: "insensitive" } } } },
        ],
      },
    });
    return { data, statusCode: 200, message: "OK", success: true };
  }

  async vaccines(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: Service[] | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.indexAll({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: "Vacin", mode: "insensitive" } },
          { category: { name: { contains: "Vacin", mode: "insensitive" } } },
          { category: { category: { name: { contains: "Vacin", mode: "insensitive" } } } },
        ],
      },
      include: { category: { include: { category: true } } },
    });
    return { data, statusCode: 200, message: "OK", success: true };
  }

  async consultations(params: {
    search?: string;
  }): Promise<{
    data: Service[] | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.indexAll({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: "Consul", mode: "insensitive" } },
          { category: { name: { contains: "Consul", mode: "insensitive" } } },
          { category: { category: { name: { contains: "Consul", mode: "insensitive" } } } },
        ],
      },
      include: { category: { include: { category: true } } },
    });
    return { data, statusCode: 200, message: "OK", success: true };
  }
  async laboratory(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: Category | null;

    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, categoryId } = params;

    const data = await this.repository.indexAlternate({
      where: { name: { contains: "laboratório", mode: "insensitive" } },
      include: {
        subCategories: {
          include: {
            Service: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async labServicesList(): Promise<{
    data: any[];
    statusCode: number;
    success: boolean;
  }> {
    const data = await prisma.service.findMany({
      where: {
        deletedAt: null,
        OR: [
          { category: { name: { contains: "laboratório", mode: "insensitive" } } },
          { category: { category: { name: { contains: "laboratório", mode: "insensitive" } } } },
        ],
      },
      select: { id: true, name: true, unit_price: true },
      orderBy: { name: "asc" },
    });
    return { data, statusCode: 200, success: true };
  }

  async injetaveisList(): Promise<{
    data: any[];
    statusCode: number;
    success: boolean;
  }> {
    const data = await prisma.service.findMany({
      where: {
        deletedAt: null,
        OR: [
          { category: { name: { contains: "Injetáv", mode: "insensitive" } } },
          { category: { category: { name: { contains: "Injetáv", mode: "insensitive" } } } },
        ],
      },
      select: { id: true, name: true, unit_price: true, classificacao: true },
      orderBy: { classificacao: "asc" },
    });
    return { data, statusCode: 200, success: true };
  }

  async catalog(): Promise<{
    data: any[];
    statusCode: number;
    success: boolean;
    message: string;
  }> {
    const services = await prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        category: {
          include: { category: true },
        },
      },
    });

    // Group by master category → subcategory → services
    const masterMap = new Map<string, { id: string; name: string; subCategories: Map<string, { id: string; name: string; Service: any[] }> }>();

    for (const svc of services) {
      if (!svc.category) continue;
      const cat = svc.category as any;
      const parent = cat.category;

      const masterId = parent?.id ?? cat.id;
      const masterName = parent?.name ?? cat.name;
      const subId = cat.id;
      const subName = cat.name;

      if (!masterMap.has(masterId)) {
        masterMap.set(masterId, { id: masterId, name: masterName, subCategories: new Map() });
      }
      const masterEntry = masterMap.get(masterId)!;

      if (!masterEntry.subCategories.has(subId)) {
        masterEntry.subCategories.set(subId, { id: subId, name: subName, Service: [] });
      }
      const { category: _cat, ...svcData } = svc as any;
      masterEntry.subCategories.get(subId)!.Service.push(svcData);
    }

    const data = Array.from(masterMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => ({
        id: m.id,
        name: m.name,
        subCategories: Array.from(m.subCategories.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }));

    return { data, statusCode: 200, success: true, message: "OK" };
  }

  async index(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
    type?: TypeItem;
  }): Promise<{
    data: any;
    meta?: any;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, categoryId, type } = params;

    /* ── When a category is specified: return that category tree ── */
    if (categoryId) {
      const data = await this.repository.index({
        where: { id: categoryId, deletedAt: null },
        include: {
          subCategories: {
            include: {
              Service: {
                where: { type, deletedAt: null },
              },
            },
          },
        },
      });
      return { data, statusCode: 200, message: "OK", success: true };
    }

    /* ── No category: paginated flat list of all services ── */
    const take   = Number(perPage) || 15;
    const skip   = take * ((Number(page) || 1) - 1);
    const where: any = {
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(type   ? { type } : {}),
    };

    const [services, total] = await Promise.all([
      this.repository.indexAll({
        where,
        include: { category: { include: { category: true } } },
      }),
      this.repository.count(where),
    ]);

    /* apply manual pagination since indexAll ignores take/skip */
    const paginated = services.slice(skip, skip + take);

    return {
      data: paginated,
      meta: {
        total,
        totalPages: Math.ceil(total / take),
        page: Number(page) || 1,
        perPage: take,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: (Service & { real_price: number | null }) | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    let data: any;
    data = await this.repository.show({
      serviceWhereUniqueInput: { id },
      include: {
        consumables: {
          include: {
            consumable: {
              include: { unit: { select: { abbreviation: true } } },
            },
          },
        },
        category: {
          include: {
            category: true,
          },
        },
        // `subItens` é onde vivem os parâmetros do exame. Com
        // `select: { id: true }` a ficha reabria sem eles, e guardar outra vez
        // por cima apagava o que lá estava. O produto sempre trouxe `exam: true`.
        exam: true,
      },
    });
    if (data && (data as any).consumables) {
      let total = 0;
      (data as any).consumables?.forEach((material: any) => {
        total = total + material?.material?.price * Number(material?.quantity);
      });
      data["real_price"] = total;
    }
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateService): Promise<{
    data: Service | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createService.parse(createData);
    const data = await this.repository.create(payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateService
  ): Promise<{
    data: Service | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateService.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
  async softDelete(id: string): Promise<{
    data: Service | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.update(
      { id },
      { deletedAt: new Date() }
    );
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async attachMaterials(attachMaterialDto: TAttachMaterial): Promise<{
    success: boolean;
    message: string;
    data: Service | null;
    statusCode: number;
  }> {
    const payload = attachMaterial.parse(attachMaterialDto);
    await this.repositoryMaterialOfService.replaceForService(
      payload.serviceId,
      payload.materials.map((item) => ({
        quantity: item.quantity,
        consumableId: item.consumableId,
      }))
    );
    const data = await this.repository.show({
      serviceWhereUniqueInput: { id: payload.serviceId },
      include: {
        consumables: true,
      },
    });
    return {
      success: true,
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: 201,
    };
  }
  async changeStock(payload: TAddStock): Promise<{
    success: boolean;
    message: string;
    data: MovimentationStock | null;
    statusCode: number;
  }> {
    const payloadParsed = addStock.parse(payload);
    const data = await this.repository.storeLogsStock(payloadParsed);
    if (data) {
      const product = await this.repository.show({
        serviceWhereUniqueInput: { id: payloadParsed.productId },
      });

      if (data.type == "ENTRY") {
        const total = Number(product?.quantity) + Number(data.quantity);
        await this.repository.update(
          { id: payloadParsed.productId },
          { quantity: total }
        );
      }
    }
    return {
      success: true,
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: 201,
    };
  }
}
