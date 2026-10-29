import { WorkflowError } from "../../security/workflow";
import { Prisma } from "@prisma/client";
import { ObservationRepository } from "../../repositories/observation";
import {
  TCreateObservation,
  TUpdateObservation,
  createObservation,
  updateObservation,
} from "../../validator/observation.validator";
import { prisma } from "../../database/prisma";
import { notify } from "../../utils/notify";
import { Socket } from "socket.io";

export class ObservationController {
  constructor(
    private readonly repository: ObservationRepository,
    private readonly io?: Socket
  ) {}

  async index(params: { search: string; perPage: string; page: string }) {
    const { page, perPage, search } = params;

    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      where: {},
      include: {
        service: true,
        consultation: {
          include: {
            screening: {
              include: { customer: true },
            },
          },
        },
      },
    });
    const total = await this.repository.count({});

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

  async show(id: string) {
    const data = await this.repository.show({
      protocolWhereUniqueInput: { id },
      include: {
        service: true,
        exams: { include: { exam: true } },
        consultation: {
          include: {
            screening: {
              include: { customer: true },
            },
          },
        },
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

  async create(createData: TCreateObservation) {
    const payload = createObservation.parse(createData);
    const data = await prisma.$transaction(async tx => {
      const consultation = await tx.consultation.findUnique({ where: { id: payload.consultationId }, include: { screening: true } });
      if (!consultation) throw new WorkflowError("Consulta não encontrada.", 404);
      if (consultation.status === "done") throw new WorkflowError("Consulta concluída.");
      const { exams, serum, ...rest } = payload;
      const observation = await tx.observation.create({ data: { ...rest, ...(serum !== undefined ? { serum: serum as Prisma.InputJsonValue } : {}) } });
      if (exams.length) await tx.requestExams.createMany({ data: exams.map(examId => ({ observationId: observation.id, examId, customerId: consultation.screening?.customerId })) });
      return observation;
    });
    if (payload.exams.length && this.io) notify(this.io, "laboratorio", { title: "Novo pedido de exame", message: `${payload.exams.length} exame(s) solicitado(s) via observação`, type: "alert" });
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(id: string, updateData: TUpdateObservation) {
    const payload = updateObservation.parse(updateData);

    const { serum, ...fields } = payload;
    const data = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Observation" WHERE id = ${id}::uuid FOR UPDATE`;
      const current = await tx.observation.findUnique({ where: { id }, include: { service: true } });
      if (!current) throw new WorkflowError("Observação não encontrada.", 404);
      if (current.status === "done" && (payload.status && payload.status !== "done" || payload.serum !== undefined || payload.description !== undefined)) throw new WorkflowError("Observação já concluída.");
      let endTime = current.endTime;
      if (payload.status === "running" && !endTime) {
        const match = current.service.name.match(/(\d+)\s*h/i);
        if (match) endTime = new Date(Date.now() + Number(match[1]) * 3600000);
      }
      const updated = await tx.observation.update({ where: { id }, data: { ...fields, ...(serum !== undefined ? { serum: serum as Prisma.InputJsonValue } : {}), endTime, ...(payload.status === "done" ? { isCompleted: true } : {}) } });
      if (payload.paid) await tx.requestExams.updateMany({ where: { observationId: id, deletedAt: null }, data: { paid: true } });
      return updated;
    });

    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
}
