import { Payment } from "@prisma/client";
import { PaymentRepository } from "../../repositories/payment";
import {
  TCreatePayment,
  TUpdatePayment,
  createPayment,
  updatePayment,
} from "../../validator/payment.validator";

export class PaymentController {
  constructor(private readonly repository: PaymentRepository) {}
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: Payment[];
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
        name: search
          ? { contains: search, mode: "insensitive" }
          : { contains: "", mode: "insensitive" },
      },
    });
    const total = await this.repository.count({
      OR: [
        {
          name: search
            ? { contains: search, mode: "insensitive" }
            : { contains: "", mode: "insensitive" },
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
    data: Payment | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      paymentWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreatePayment): Promise<{
    data: Payment | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createPayment.parse(createData);
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
    updateData: TUpdatePayment
  ): Promise<{
    data: Payment | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updatePayment.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
