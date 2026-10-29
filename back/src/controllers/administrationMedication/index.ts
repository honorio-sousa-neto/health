import { AdministrationMedicament } from "@prisma/client";
import { AdministrationMedicamentRepository } from "../../repositories/administrationMedication";
import {
  TCreateAdministrationMedication,
  TUpdateAdministrationMedication,
  createAdministrationMedication,
  updateAdministrationMedication,
} from "../../validator/administrationMedicament.validator";
import { notify } from "../../utils/notify";
import { Socket } from "socket.io";

export class AdministrationMedicationController {
  constructor(
    private readonly repository: AdministrationMedicamentRepository,
    private readonly io?: Socket
  ) {}
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: AdministrationMedicament[];
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

    const where = {
      service: {
        NOT: { name: { contains: "Vacin", mode: "insensitive" as const } },
      },
    };

    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      where,
      include: { service: true, customer: true },
    });
    const total = await this.repository.count(where);

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

  async vaccines(): Promise<{
    data: AdministrationMedicament[];
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.index({
      where: {
        service: { name: { contains: "Vacin", mode: "insensitive" } },
      },
      include: { service: true, customer: true },
      orderBy: { createdAt: "desc" } as any,
    });
    return { data, statusCode: 200, message: "OK", success: true };
  }

  async show(id: string): Promise<{
    data: AdministrationMedicament | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      administrationMedicamentWhereUniqueInput: { id },
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

  async create(createData: TCreateAdministrationMedication): Promise<{
    data: AdministrationMedicament | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createAdministrationMedication.parse(createData);
    const data = await this.repository.create(payload);

    if (data && this.io) {
      const record = await this.repository.show({
        administrationMedicamentWhereUniqueInput: { id: data.id },
        include: { customer: true, service: true },
      });
      const patientName = (record as any)?.customer?.name ?? "Paciente";
      const serviceName = (record as any)?.service?.name ?? "administração";
      const isVaccine = serviceName.toLowerCase().includes("vacin");
      notify(this.io, "recepcao", {
        title: isVaccine ? "Nova ordem de vacinação" : "Nova administração de fármacos",
        message: `${patientName} — ${serviceName}`,
        type: "info",
      });
    }

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateAdministrationMedication
  ): Promise<{
    data: AdministrationMedicament | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateAdministrationMedication.parse(updateData);
    const data = await this.repository.update({ id }, payload);

    if (payload.paid && this.io) {
      const record = await this.repository.show({
        administrationMedicamentWhereUniqueInput: { id },
        include: { customer: true, service: true },
      });
      const patientName = (record as any)?.customer?.name ?? "Paciente";
      const serviceName = (record as any)?.service?.name ?? "";
      const isVaccine = serviceName.toLowerCase().includes("vacin");
      notify(this.io, "enfermaria", {
        title: isVaccine ? "Vacinação paga — pode iniciar" : "Administração paga — pode iniciar",
        message: patientName,
        type: "success",
      });
    }

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
