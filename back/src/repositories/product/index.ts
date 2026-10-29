import { Category, Prisma, Service, TypeItem } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TAddProductStock,
  TCreateProduct,
  TUpdateProduct,
} from "../../validator/product.validator";

export class ProductRepository {
  async create(product: TCreateProduct): Promise<Service | null> {
    const data = Object.fromEntries(
      Object.entries(product).filter(([, v]) => v !== undefined)
    ) as unknown as Prisma.ServiceUncheckedCreateInput;
    return prisma.service.create({ data });
  }

  async update(
    serviceWhereUniqueInput: Prisma.ServiceWhereUniqueInput,
    product: TUpdateProduct
  ): Promise<Service | null> {
    const data = Object.fromEntries(
      Object.entries(product).filter(([, v]) => v !== undefined)
    ) as unknown as Prisma.ServiceUncheckedUpdateInput;
    return prisma.service.update({
      where: serviceWhereUniqueInput,
      data,
    });
  }

  async index(params: {
    where: Prisma.CategoryWhereInput;
    include?: Prisma.CategoryInclude;
  }): Promise<Category | null> {
    const { where, include } = params;

    return prisma.category.findFirst({
      where,
      include,
    });
  }

  async list(params: {
    where: Prisma.ServiceWhereInput;
    include?: Prisma.ServiceInclude;
  }): Promise<Service[]> {
    return prisma.service.findMany({
      ...params,
      where: {
        ...params.where,
        type: TypeItem.PRODUCT,
      },
    });
  }

  async show(params: {
    productWhereUniqueInput: Prisma.ServiceWhereUniqueInput;
    include?: Prisma.ServiceInclude;
  }): Promise<Service | null> {
    const { productWhereUniqueInput, include } = params;
    // Sem filtro de type: abrir um registo por ID deve funcionar seja qual for
    // o tipo. O filtro fica só na listagem, para Produtos mostrar só PRODUCT.
    // Sem isto, reclassificar um exame para SERVICE tornava inacessível a
    // página onde se configura o seu formulário de resultados.
    return prisma.service.findFirst({
      where: { ...productWhereUniqueInput },
      include,
    });
  }

  async destroy(
    productWhereUniqueInput: Prisma.ServiceWhereUniqueInput
  ): Promise<Service | null> {
    return prisma.service.delete({ where: productWhereUniqueInput });
  }

  async storeLogsStock(payload: TAddProductStock): Promise<any> {
    return (prisma as any).stockProducts.create({ data: payload });
  }
}
