import { publicPayload } from "../../security/response";
import { clinicalRooms } from "../../security/auth";
import { Surgery } from "@prisma/client";
import { SurgeryRepository } from "../../repositories/surgery";
import {
  TCreateSurgery,
  TUpdateSurgery,
  createSurgery,
  updateSurgery,
} from "../../validator/surgery.validator";
import { Socket } from "socket.io";

export class SurgeryController {
  constructor(
    private readonly repository: SurgeryRepository,
    private readonly io: Socket
  ) {}
  async index(): Promise<{
    data: Surgery[];
    meta?: {
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
    const data = await this.repository.index({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
        service: true,
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async indexSurgeriesToPay(): Promise<{
    data: Surgery[];
    meta?: {
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
    const data = await this.repository.index({
      where: {
        paid: false,
      },
      include: {
        customer: true,
        service: true,
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
    data: Surgery | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      surgeryWhereUniqueInput: { id },
      include: {
        service: true,
        customer: true,
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async byCustomer(customerId: string) {
    const data = await this.repository.byCustomer(customerId);
    return { data, statusCode: 200, message: "OK", success: true };
  }

  async create(createData: TCreateSurgery): Promise<{
    data: Surgery | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createSurgery.parse(createData);
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
    updateData: TUpdateSurgery
  ): Promise<{
    data: Surgery | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateSurgery.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    if (data) {
      this.io.to(clinicalRooms).emit("surgery:updated");
    }
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
