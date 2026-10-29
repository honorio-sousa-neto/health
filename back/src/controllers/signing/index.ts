import { Customer, CustomerIntern } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { CustomerInternRepository } from "../../repositories/signing";
import {
  TCreateSigning,
  TUpdateSigning,
  createSigning,
  updateSigning,
} from "../../validator/signing.validator";

export class CustomerInternController {
  constructor(private readonly repository: CustomerInternRepository) {}
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: CustomerIntern[];
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
    const { page, perPage, search } = params;
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      where: {
        OR: [
          {
            customer: {
              name: search
                ? { contains: search, mode: "insensitive" }
                : { contains: "", mode: "insensitive" },
            },
          },
          {
            intern: {
              name: search
                ? { contains: search, mode: "insensitive" }
                : { contains: "", mode: "insensitive" },
            },
          },
        ],
      },
      include: {
        customer: true,
        intern: true,
      },
    });
    const total = await this.repository.count({
      OR: [
        {
          customer: {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
        },
        {
          intern: {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
        },
      ],
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

  async show(id: string): Promise<{
    data: CustomerIntern | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      CustomerInternWhereUniqueInput: { id },
      include: {
        customer: true,
        intern: { include: { services: true } },
        members: true,
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateSigning): Promise<{
    data: CustomerIntern | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createSigning.parse(createData);
    const { members, endDate, startDate, ...rest } = payload;

    const data = await this.repository.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...rest,
        members: {
          connect: members?.map((item) => ({ id: item })),
        },
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateSigning
  ): Promise<{
    data: CustomerIntern | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    try {
      const payload = updateSigning.parse(updateData);
      const { members, endDate, startDate, ...rest } = payload;
      let data: CustomerIntern | null = null;
      const response = await this.repository.update({
        where: { id },
        data: {
          ...rest,
          endDate: new Date(endDate),
          startDate: new Date(startDate),
          // members: {
          //   set: [],
          // },
        },
        include: {
          members: true,
        },
      });
      const children = (response as any).members as Customer[];
      console.log(children);
      for await (const element of children) {
        if (!members?.includes(element.id)) {
          await prisma.customerIntern.update({
            where: {
              id,
            },
            data: {
              members: {
                disconnect: { id: element.id },
              },
            },
          });
        }
      }

      if (members?.length) {
        for await (const element of members) {
          const exists = children.find((item) => item.id == element)?.id;
          if (!exists) {
            await prisma.customerIntern.update({
              where: { id },
              data: {
                members: {
                  connect: { id: element },
                },
              },
            });
          }
        }
      }
      return {
        data,
        message: "Sucesso",
        statusCode: 201,
        success: true,
      };
    } catch (error: any) {
      return {
        data: null,
        message: error.message,
        statusCode: 400,
        success: false,
      };
    }
  }
}
