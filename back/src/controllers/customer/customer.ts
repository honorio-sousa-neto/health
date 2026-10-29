import {
  Customer,
  CustomerInsurance,
  CustomerIntern,
  Invoice,
  InvoiceItem,
  Protocol,
} from "@prisma/client";
import { prisma } from "../../database/prisma";
import { CustomerRepository } from "../../repositories/customer/customer";
import { InvoiceRepository } from "../../repositories/invoice/invoice";
import {
  TAggregateCustomer,
  TCreateCustomer,
  TUpdateCustomer,
  createCustomer,
  updateCustomer,
} from "../../validator/customer.validator";

export class CustomerController {
  constructor(private readonly repository: CustomerRepository) {}
  private readonly repositoryInvoice = new InvoiceRepository();
  async index(params: {
    search?: string;
    perPage?: string;
    page?: string;
    type?: string;
  }): Promise<{
    data: Customer[];
    meta: {
      totalPages: number;
      total: number;
      search?: string;
      perPage: number;
      page: number;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, type } = params;
    let whereCondition;

    switch (type) {
      case "internInsurance": // Clientes com seguro interno
        whereCondition = { intern_insurance: { some: {} } }; // Clientes com registros em intern_insurance
        break;

      case "externalInsurance": // Clientes com seguro externo
        whereCondition = {
          customersInsurance: { some: {} }, // Clientes com registros em customersInsurance
        };
        break;

      case "protocol": // Clientes com protocolo
        whereCondition = {
          protocolId: { not: null }, // Clientes com um protocolo associado
        };
        break;

      case "normal": // Clientes normais (sem seguro ou protocolo)
        whereCondition = {
          AND: [
            { intern_insurance: { none: {} } }, // Sem seguros internos
            { internInsuranceAggregate: { is: null } }, // Sem relação agregada de seguro interno
            { customersInsurance: { none: {} } }, // Sem seguros externos
            { protocolId: null }, // Sem protocolo
          ],
        };
        break;

      default: // Retorna todos os clientes
        whereCondition = {};
    }

    console.log(JSON.stringify(whereCondition, null, 2));
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        OR: [
          {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
          // ...(whereCondition.OR || []),
        ],
        ...Object.fromEntries(
          Object.entries(whereCondition).filter(([key]) => key !== "OR")
        ),
        deletedAt: null,
      },
      include: {
        protocol: true,
        customersInsurance: {
          include: {
            insurance: true,
          },
        },
        Partner: true,
        intern_insurance: {
          include: {
            intern: true,
          },
        },
        internInsuranceAggregate: {
          include: {
            intern: true,
          },
        },
      },
    });
    const total = await this.repository.count({
      name: search
        ? { contains: search, mode: "insensitive" }
        : { contains: "", mode: "insensitive" },
      ...whereCondition,
    });

    return {
      data,
      meta: {
        total,
        totalPages: Math.ceil(total / Number(perPage)),
        search,
        page: Number(page),
        perPage: Number(perPage),
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async calculateRealCost(invoiceItems: InvoiceItem[]): Promise<number> {
    let realCost = 0;
    let items = invoiceItems;
    console.log(JSON.stringify(items, null, 2));
    items.forEach((item) => {
      let materialsOfService = (item as any).service
        .consumables as any[];
      materialsOfService.forEach((materialOfService) => {
        let price = (materialOfService as any).material.price;
        console.log(materialOfService);
        realCost = realCost + price * Number(materialOfService.quantity);
      });
    });

    return realCost;
  }
  async indexAccounts(params: {
    search?: string;
    perPage?: string;
    page?: string;
    customerId: string;
    internId: string;
    startDate: string;
    endDate: string;
  }): Promise<{
    data: {
      items: Invoice[];
      realCosts: {
        reference: string;
        amount: number;
      }[];
      totalRealCost: number;
      customer: Customer | null;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, endDate, startDate, customerId, internId } =
      params;
    const data = await this.repositoryInvoice.index({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        customerId,
        internId,
      },
      include: {},
    });
    let realCost = [];
    let total = 0;
    for await (const invoice of data) {
      const invoiceItems = await prisma.invoiceItem.findMany({
        where: {
          AND: [{ invoiceId: invoice.id }],
        },
        include: {
          service: {
            include: {
              consumables: {
                include: {
                  consumable: true,
                },
              },
            },
          },
        },
      });
      const cost = await this.calculateRealCost(invoiceItems);
      total += cost;
      realCost.push({ reference: invoice.reference, amount: cost });
      // console.log("PRICES", JSON.stringify(invoiceItems, null, 2));
    }
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        intern_insurance: {
          select: {
            intern: {
              select: {
                amount: true,
              },
            },
          },
        },
        internInsuranceAggregate: {
          include: {
            intern: {
              select: {
                aggregations: true,
                amount: true,
              },
            },
          },
        },
      },
    });
    return {
      data: {
        items: data,
        realCosts: realCost,
        totalRealCost: total,
        customer,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async indexOtherAccounts(params: {
    customerId: string;
    type: "normal" | "insurance" | "protocol";
    source: string;
  }): Promise<{
    data: {
      items: Invoice[];
      realCosts: {
        reference: string;
        amount: number;
      }[];
      totalRealCost: number;
      customer: Customer | null;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { customerId, type, source } = params;
    let query = {};
    if (type == "normal") {
      query = {
        asNormal: true,
      };
    } else if (type == "insurance") {
      query = {
        insuranceId: source,
      };
    } else if (type == "protocol") {
      query = {
        protocolId: source,
      };
    }

    const data = await this.repositoryInvoice.index({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        customerId,
        ...query,
      },
      include: {
        invoiceItems: true,
      },
    });
    let realCost = [];
    let total = 0;
    for await (const invoice of data) {
      const invoiceItems = await prisma.invoiceItem.findMany({
        where: {
          AND: [{ invoiceId: invoice.id }],
        },
        include: {
          service: {
            include: {
              consumables: {
                include: {
                  consumable: true,
                },
              },
            },
          },
        },
      });
      const cost = await this.calculateRealCost(invoiceItems);
      total += cost;
      realCost.push({ reference: invoice.reference, amount: cost });
    }
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    return {
      data: {
        items: data,
        realCosts: realCost,
        totalRealCost: total,
        customer,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async myBenefits(params: { customerId: string }): Promise<{
    data: {
      insurance: CustomerInsurance[];
      intern: CustomerIntern[];
      protocol: Protocol | null;
    };

    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { customerId } = params;
    const insurance = await prisma.customerInsurance.findMany({
      where: {
        customerId,
      },
      include: {
        insurance: true,
      },
    });
    const intern = await prisma.customerIntern.findMany({
      where: {
        customerId,
      },
      include: {
        intern: {
          select: {
            name: true,
          },
        },
        members: true,
      },
    });
    const protocol = await prisma.protocol.findFirst({
      where: {
        customers: {
          some: { id: customerId },
        },
      },
    });
    return {
      data: {
        insurance,
        intern,
        protocol,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async indexChildren(id: string): Promise<{
    data: Customer[];
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      customerWhereUniqueInput: {
        id,
      },
    });

    return {
      data: (data as any).children as Customer[],
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async filter(params: { search?: string }): Promise<{
    data: Customer[];
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { search } = params;
    const data = await this.repository.index({
      where: {
        OR: [
          {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
        ],
      },
      include: {
        protocol: true,
        customersInsurance: {
          include: {
            insurance: true,
          },
        },
        Partner: true,
        intern_insurance: true,
        internInsuranceAggregate: true,
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: Customer | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      customerWhereUniqueInput: { id },
      include: {
        customersInsurance: { include: { insurance: true } },
        protocol: true,
        intern_insurance: { include: { intern: true } },
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateCustomer): Promise<{
    data: Customer | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createCustomer.parse(createData);
    const { insurances, ...rest } = payload as any;
    const data = await this.repository.create(rest);

    if (data && insurances?.length) {
      await prisma.customerInsurance.createMany({
        data: insurances.map((ins: any) => ({
          customerId: data.id,
          insuranceId: ins.insuranceId,
          insuranceNumber: ins.insuranceNumber ?? null,
        })),
      });
    }

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async createAggregate(
    createData: TAggregateCustomer,
    parentId: string
  ): Promise<{
    data: Customer[] | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    let customers: Customer[] = [];
    await prisma.customer.update({
      where: { id: parentId },
      data: {},
    });
    // for await (const customer of createData) {
    //   const response = await this.repository.update(
    //     { id: customer },
    //     { parentId }
    //   );
    //   if (response) customers.push(response);
    // }
    return {
      data: customers,
      message: customers ? "Sucesso" : "Sem sucesso",
      statusCode: customers ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateCustomer
  ): Promise<{
    data: Customer | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateCustomer.parse(updateData);
    const { insurances, ...rest } = payload as any;

    const data = await this.repository.update({ id }, rest);

    if (insurances !== undefined) {
      await prisma.customerInsurance.deleteMany({ where: { customerId: id } });
      if (insurances.length) {
        await prisma.customerInsurance.createMany({
          data: insurances.map((ins: any) => ({
            customerId: id,
            insuranceId: ins.insuranceId,
            insuranceNumber: ins.insuranceNumber ?? null,
          })),
        });
      }
    }

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async softDelete(id: string): Promise<{
    data: Customer | null;
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
}
