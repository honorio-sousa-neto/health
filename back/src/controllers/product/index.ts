import { Service, TypeItem } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { MaterialOfServiceRepository } from "../../repositories/material-service";
import { ProductRepository } from "../../repositories/product";
import {
  TAddProductStock,
  TAttachProductMaterial,
  TCreateProduct,
  TUpdateProduct,
  addProductStock,
  attachProductMaterial,
  createProduct,
  updateProduct,
} from "../../validator/product.validator";

export class ProductController {
  constructor(private readonly repository: ProductRepository) {}
  private readonly repositoryMaterialOfService =
    new MaterialOfServiceRepository();

  async index(params: {
    search?: string;
    perPage?: string;
    page?: string;
    categoryId?: string;
  }): Promise<{
    data: any;
    meta?: any;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { categoryId, search, page, perPage } = params;

    const take = Number(perPage) || 15;
    const skip = (Number(page) - 1) * take || 0;

    /* Resolve category filter: top-level area → expand to subcategory IDs */
    let categoryFilter: any = undefined;
    if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { subCategories: { select: { id: true } } },
      });
      if (cat && (cat as any).subCategories?.length > 0) {
        categoryFilter = { in: (cat as any).subCategories.map((s: any) => s.id) };
      } else {
        categoryFilter = categoryId;
      }
    }

    const where: any = {
      deletedAt: null,
      type: TypeItem.PRODUCT,
      ...(categoryFilter ? { categoryId: categoryFilter } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: { category: { include: { category: true } } },
        take,
        skip,
        orderBy: { name: "asc" },
      }),
      prisma.service.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        totalPages: Math.ceil(total / take),
        page: Number(page) || 1,
        perPage: take,
        search,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async pharmacyArticles(params: { search?: string }): Promise<{
    data: Service[];
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const { search } = params;
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
        name: { contains: "farm", mode: "insensitive" },
      },
      include: {
        subCategories: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    });

    const categoryIds = new Set<string>();
    categories.forEach((category) => {
      categoryIds.add(category.id);
      category.subCategories.forEach((subCategory) => categoryIds.add(subCategory.id));
    });

    if (!categoryIds.size) {
      return {
        data: [],
        message: "Categoria Farmácia não encontrada",
        statusCode: 200,
        success: true,
      };
    }

    const data = await prisma.service.findMany({
      where: {
        deletedAt: null,
        type: TypeItem.PRODUCT,
        categoryId: { in: Array.from(categoryIds) },
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      include: { category: { include: { category: true } } },
      orderBy: { name: "asc" },
    });

    return {
      data,
      message: "Sucesso",
      statusCode: 200,
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
    const { search } = params;

    const data = await this.repository.list({
      where: {
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

  async listPrices(params: { category: string }): Promise<{
    data: Service[];
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const { category } = params;
    const data = await this.repository.list({
      where: {
        category: {
          categoryId: category,
        },
        deletedAt: null,
      },
    });

    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: (Service & { real_price?: number | null }) | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = (await this.repository.show({
      productWhereUniqueInput: { id },
      include: {
        exam: true,
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
      },
    })) as (Service & { real_price?: number | null }) | null;

    if (data && (data as any).consumables) {
      let total = 0;
      (data as any).consumables?.forEach((material: any) => {
        total = total + material?.material?.price * Number(material?.quantity);
      });
      data.real_price = total;
    }

    return {
      data,
      message: data ? "Sucesso" : "Produto nao encontrado",
      statusCode: data ? 200 : 404,
      success: Boolean(data),
    };
  }

  async create(createData: TCreateProduct): Promise<{
    data: Service | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createProduct.parse(createData);
    const type = createData.type ?? TypeItem.PRODUCT;

    // A unidade é obrigatória para produtos — define a embalagem de venda
    // (ex.: "Cartela de 10") usada na conversão da receita para a fatura.
    if (type === TypeItem.PRODUCT && !payload.unitId) {
      return {
        data: null,
        message: "A unidade é obrigatória para produtos.",
        statusCode: 400,
        success: false,
      };
    }

    const data = await this.repository.create({ ...payload, type });

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateProduct
  ): Promise<{
    data: Service | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateProduct.parse(updateData);
    const product = await this.repository.show({
      productWhereUniqueInput: { id },
    });

    if (!product) {
      return {
        data: null,
        message: "Produto nao encontrado",
        statusCode: 404,
        success: false,
      };
    }

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
    const product = await this.repository.show({
      productWhereUniqueInput: { id },
    });

    if (!product) {
      return {
        data: null,
        message: "Produto nao encontrado",
        statusCode: 404,
        success: false,
      };
    }

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

  async destroy(id: string): Promise<{
    data: Service | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const product = await this.repository.show({
      productWhereUniqueInput: { id },
    });

    if (!product) {
      return {
        data: null,
        message: "Produto nao encontrado",
        statusCode: 404,
        success: false,
      };
    }

    const data = await this.repository.destroy({ id });

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 200 : 400,
      success: true,
    };
  }

  async attachMaterials(attachMaterialDto: TAttachProductMaterial): Promise<{
    success: boolean;
    message: string;
    data: Service | null;
    statusCode: number;
  }> {
    const payload = attachProductMaterial.parse(attachMaterialDto);
    await this.repositoryMaterialOfService.replaceForService(
      payload.productId,
      payload.materials.map((item) => ({
        quantity: item.quantity,
        consumableId: item.consumableId,
      }))
    );
    const data = await this.repository.show({
      productWhereUniqueInput: { id: payload.productId },
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

  async changeStock(payload: TAddProductStock): Promise<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    const payloadParsed = addProductStock.parse(payload);
    const data = await this.repository.storeLogsStock(payloadParsed);

    if (data) {
      const product = await this.repository.show({
        productWhereUniqueInput: { id: payloadParsed.productId },
      });

      if (data.transactionType == "ENTRY") {
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
