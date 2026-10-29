import { AttendanceRepository } from "../../repositories/attendance";
import {
  TCreateAttendance,
  TUpdateAttendance,
  createAttendance,
  updateAttendance,
} from "../../validator/attendance.validator";
import { prisma } from "../../database/prisma";
import { notify } from "../../utils/notify";

// Status → destination room
const STATUS_ROOM: Record<string, string | null> = {
  IN_SCREENING:    "enfermaria",
  WAITING_DOCTOR:  "consultorio",
  IN_CONSULTATION: "consultorio",
  COMPLETED:       "recepcao",
  CANCELED:        "recepcao",
};

export class AttendanceController {
  constructor(
    private readonly repository: AttendanceRepository,
    private readonly io?: any,
  ) {}

  async index(params: { page: string; perPage: string; search?: string }) {
    const page = Number(params.page) || 1;
    const perPage = Number(params.perPage) || 15;
    const { data, total } = await this.repository.index({ page, perPage, search: params.search });
    return {
      data,
      meta: {
        total,
        totalPages: Math.ceil(total / perPage),
        page,
        perPage,
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async byCustomer(customerId: string) {
    const data = await this.repository.byCustomer(customerId);
    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string) {
    const data = await this.repository.show(id);
    return {
      data,
      statusCode: data ? 200 : 404,
      message: data ? "OK" : "Não encontrado",
      success: !!data,
    };
  }

  async create(body: TCreateAttendance) {
    const payload = createAttendance.parse(body);
    const data = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('attendance-reference'))::text`;
      const prefix = `AT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-`;
      let next = await tx.attendance.count({ where: { reference: { startsWith: prefix } } }) + 1;
      let reference = `${prefix}${String(next).padStart(4, "0")}`;
      while (await tx.attendance.findUnique({ where: { reference }, select: { id: true } })) reference = `${prefix}${String(++next).padStart(4, "0")}`;
      const attendance = await tx.attendance.create({ data: { ...payload, reference } });
      if (payload.serviceId) {
        const service = await tx.service.findUnique({ where: { id: payload.serviceId }, include: { category: { include: { category: { select: { name: true } } } } } });
        const names = [service?.category?.name, service?.category?.category?.name].map(n => (n ?? "").toLowerCase());
        if (names.some(n => n.includes("consulta") || n.includes("clínica") || n.includes("clinica"))) await tx.screening.create({ data: { customerId: payload.customerId, attendanceId: attendance.id } });
      }
      return attendance;
    });

    // Notify nursing area about the new patient
    if (this.io) {
      const customer = await prisma.customer.findUnique({
        where: { id: payload.customerId },
        select: { name: true },
      });
      notify(this.io, "enfermaria", {
        title: "Novo atendimento",
        message: `Paciente registado na recepção`,
        type: "alert",
        patientName: customer?.name,
        reference: (data as any).reference,
      });
    }

    return {
      data,
      statusCode: 201,
      message: "Atendimento registado",
      success: true,
    };
  }

  async update(id: string, body: TUpdateAttendance) {
    const payload = updateAttendance.parse(body);
    const data = await this.repository.update(id, payload);

    // Notify target area when status changes
    if (this.io && payload.status) {
      const room = STATUS_ROOM[payload.status];
      if (room) {
        const customer = (data as any)?.customer;
        const statusMessages: Record<string, string> = {
          IN_SCREENING:    "Paciente enviado para triagem",
          WAITING_DOCTOR:  "Paciente aguarda consulta médica",
          IN_CONSULTATION: "Consulta iniciada",
          COMPLETED:       "Atendimento concluído",
          CANCELED:        "Atendimento cancelado",
        };
        notify(this.io, room, {
          title: statusMessages[payload.status] ?? "Atendimento actualizado",
          message: customer?.name ?? "Paciente",
          type: payload.status === "CANCELED" ? "info" : "alert",
          patientName: customer?.name,
          reference: (data as any)?.reference,
        });
      }
    }

    return {
      data,
      statusCode: 200,
      message: "Atendimento actualizado",
      success: true,
    };
  }
}
