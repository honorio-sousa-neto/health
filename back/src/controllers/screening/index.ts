import { WorkflowError } from "../../security/workflow";
import { publicPayload } from "../../security/response";
import { clinicalRooms } from "../../security/auth";
import { Screening } from "@prisma/client";
import { ScreeningRepository } from "../../repositories/screening";
import {
  TCreateScreening,
  TUpdateScreening,
  createScreening,
  updateScreening,
} from "../../validator/screening.validator";
import { prisma } from "../../database/prisma";
import { Socket } from "socket.io";
import { notify } from "../../utils/notify";

const critScore = (v: string | null) => ({ GREEN: 1, ORANGE: 2, RED: 3 }[v as string] ?? 0);
const bpmScore  = (v: string | null) => { const n = Number(v); if (!v || isNaN(n)) return 0; if (n >= 60 && n <= 100) return 1; if (n >= 40 && n <= 120) return 2; return 3; };
const bpScore   = (v: string | null) => { if (!v) return 0; const [s, d] = v.split("/").map(Number); if (isNaN(s)) return 0; if (s < 120 && (!d || d < 80)) return 1; if (s < 130) return 2; return 3; };
const severityScore = (s: any) => critScore(s.oxygen) + critScore(s.fever) + critScore(s.breathingRate) + bpmScore(s.heartbeatRate) + bpScore(s.bloodPressure);

export class ScreeningController {
  constructor(
    private readonly repository: ScreeningRepository,
    private readonly io: Socket
  ) {}

  async index(params: {
    queue?: string;
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: Screening[];
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
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const porPagina = Number(perPage) || 15;
    const pagina = Number(page) || 1;
    // Era `Number(page) - 1`: a segunda página saltava um registo, não uma
    // página inteira, e repetia catorze dos quinze anteriores.
    const saltar = (pagina - 1) * porPagina;

    // O mesmo filtro tem de servir a lista e a contagem. Estava só na lista.
    const where: any = params.queue === "true"
      ? { deletedAt: null, status: { in: ["PENDING", "RUNNING"] } }
      : { deletedAt: null, updatedAt: { gte: twentyFourHoursAgo } };
    if (search?.trim()) where.customer = { OR: [{ name: { contains: search.trim(), mode: "insensitive" } }, { phone: { contains: search.trim() } }] };

    const data = await this.repository.index({
      take: porPagina,
      skip: saltar,
      where,
      orderBy: params.queue === "true" ? { createdAt: "asc" } : { updatedAt: "desc" },
      include: {
        customer: {
          include: {
            invoices: {
              where: {
                emission_date: { gte: startOfToday },
                deletedAt: null,
              },
              select: { id: true },
            },
          },
        },
        nurse: { select: { id: true, name: true } },
      },
    });
    const total = await this.repository.count(where);

    return {
      data,
      meta: {
        total,
        totalPages: Math.max(1, Math.ceil(total / porPagina)),
        search,
        page: pagina,
        perPage: porPagina,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async indexLogs(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: Screening[];
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
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const porPagina = Number(perPage) || 15;
    const pagina = Number(page) || 1;
    const saltar = (pagina - 1) * porPagina;

    const where = { updatedAt: { lt: twentyFourHoursAgo } };

    const data = await this.repository.index({
      take: porPagina,
      skip: saltar,
      where,
      include: {
        customer: true,
        nurse: true,
      },
    });
    const total = await this.repository.count(where);

    return {
      data,
      meta: {
        total,
        totalPages: Math.max(1, Math.ceil(total / porPagina)),
        search,
        page: pagina,
        perPage: porPagina,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: Screening | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      screeningWhereUniqueInput: { id },
      include: { customer: true },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateScreening): Promise<{
    data: Screening | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createScreening.parse(createData);
    const data = await this.repository.create({
      data: payload,
      include: {
        customer: true,
      },
    });
    if (data) {
      this.io.to(clinicalRooms).emit("screening:create", publicPayload(data));
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
    updateData: TUpdateScreening
  ): Promise<{
    data: Screening | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateScreening.parse(updateData);
    const { data, consultation } = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Screening" WHERE id = ${id}::uuid FOR UPDATE`;
      const previous = await tx.screening.findUnique({ where: { id }, include: { attendance: true } });
      if (!previous) throw new WorkflowError("Triagem não encontrada", 404);
      if (["FINISHED", "CANCELED"].includes(previous.status) || previous.attendance?.status === "CANCELED") throw new WorkflowError("Esta triagem está encerrada ou o atendimento foi cancelado.");
      const data = await tx.screening.update({
        where: { id }, data: payload, include: { Consultation: true, customer: true },
      });
      let consultation = null;
      if (payload.status === "FINISHED") {
        consultation = await tx.consultation.upsert({
          where: { screeningId: id },
          create: { screeningId: id, stage: "CONSULTING_CLINIC" }, update: {},
          include: { screening: { include: { customer: true } } },
        });
        if (data.attendanceId) await tx.medicalConsultation.upsert({
          where: { screeningId: id },
          create: { screeningId: id, customerId: data.customerId, attendanceId: data.attendanceId }, update: {},
        });
      }
      if (data.attendanceId) await tx.attendance.update({
        where: { id: data.attendanceId },
        data: { status: payload.status === "FINISHED" ? "WAITING_DOCTOR" : payload.status === "RUNNING" ? "IN_SCREENING" : payload.status === "CANCELED" ? "CANCELED" : "WAITING" },
      });
      return { data, consultation };
    });
    const consultationCreated = !!consultation;
    if (consultation) {
      this.io.to(clinicalRooms).emit("consultation:create", publicPayload(consultation));
      notify(this.io, "consultorio", { title: "Paciente pronto para consulta", message: "Triagem concluída", type: "alert", patientName: data.customer?.name });
    }

    if (data) {
      this.io.to(clinicalRooms).emit("screening:update", publicPayload(data));
    }

    return {
      data,
      message: consultationCreated
        ? "Triagem concluída. Consulta criada e médico notificado."
        : "Triagem concluída.",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
