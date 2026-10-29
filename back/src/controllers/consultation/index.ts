import { hasExamResult } from "../../security/exam-result";
import { severityScore } from "../../security/severity";
import { WorkflowError } from "../../security/workflow";
import { Consultation, Internment, Observation } from "@prisma/client";
import { ConsultationRepository } from "../../repositories/consultation";
import { notify } from "../../utils/notify";
import {
  TCreateConsultation,
  TUpdateConsultation,
  createConsultation,
  updateConsultation,
} from "../../validator/consultation.validator";
import { prisma } from "../../database/prisma";
import { Socket } from "socket.io";

export class ConsultationController {
  constructor(
    private readonly repository: ConsultationRepository,
    private readonly io: Socket
  ) {}
  async index(params: {
    search?: string;
    perPage?: string;
    page?: string;
    doctorId?: string;
  }): Promise<{
    data: Consultation[];
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
    const { page, perPage, search, doctorId } = params;

    const baseWhere: any = { deletedAt: null, status: { in: ["pending", "running"] } };
    if (doctorId) {
      baseWhere.AND = [{ OR: [{ userId: null }, { userId: doctorId }] }];
    }

    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) > 0 ? (Math.max(1, Number(page) || 1) - 1) * Number(perPage) : undefined,
      include: {
        screening: {
          include: {
            customer: true,
          },
        },
      },
      where: baseWhere,
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async indexLogs(params: {
    search?: string;
    perPage?: string;
    page?: string;
  }): Promise<{
    data: Consultation[];
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
    const { page, perPage, search } = params;
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) > 0 ? (Math.max(1, Number(page) || 1) - 1) * Number(perPage) : undefined,
      include: {
        screening: {
          include: {
            customer: true,
          },
        },
      },
      where: { deletedAt: null, status: "done" },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: Consultation | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      consultationWhereUniqueInput: { id },
      include: {
        screening: {
          include: {
            customer: {
              include: {
                customersInsurance: true,
                protocol: true,
                Partner: true,
                intern_insurance: true,
              },
            },
          },
        },
        exams: {
          where: {
            internmentId: null,
            observation: null,
          },
          include: {
            exam: {
              include: {
                exam: true,
                // Receita do serviço: alimenta o consumo padrão mostrado no
                // formulário de resultados e descontado ao guardar. Sem isto
                // materials chegava sempre vazio e nada era abatido ao stock.
                consumables: {
                  include: {
                    consumable: {
                      select: { id: true, name: true, unit: { select: { abbreviation: true } } },
                    },
                  },
                },
              },
            },
          },
        },
        internment: {
          include: {
            exams: {
              include: {
                exam: {
              include: {
                exam: true,
                // Receita do serviço: alimenta o consumo padrão mostrado no
                // formulário de resultados e descontado ao guardar. Sem isto
                // materials chegava sempre vazio e nada era abatido ao stock.
                consumables: {
                  include: {
                    consumable: {
                      select: { id: true, name: true, unit: { select: { abbreviation: true } } },
                    },
                  },
                },
              },
            },
              },
            },
            service: true,
          },
        },
        observation: {
          include: {
            exams: {
              include: {
                exam: {
              include: {
                exam: true,
                // Receita do serviço: alimenta o consumo padrão mostrado no
                // formulário de resultados e descontado ao guardar. Sem isto
                // materials chegava sempre vazio e nada era abatido ao stock.
                consumables: {
                  include: {
                    consumable: {
                      select: { id: true, name: true, unit: { select: { abbreviation: true } } },
                    },
                  },
                },
              },
            },
              },
            },
            service: true,
          },
        },
        prescriptions: {
          include: {
            items: {
              include: {
                service: true,
              },
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

  async create(createData: TCreateConsultation): Promise<{
    data: Consultation | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createConsultation.parse(createData);
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
    updateData: TUpdateConsultation
  ): Promise<{
    data: Consultation | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateConsultation.parse(updateData);
    const { doctorId, description, diagnosis, status, stage } = payload;

    const data = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Consultation" WHERE id = ${id}::uuid FOR UPDATE`;
      const current = await tx.consultation.findUnique({ where: { id }, include: { screening: { include: { attendance: true } }, observation: { where: { deletedAt: null } } } });
      if (!current) throw new WorkflowError("Consulta não encontrada.", 404);
      if (current.screening?.attendance?.status === "CANCELED") throw new WorkflowError("Atendimento cancelado.");
      if (current.status === "done" && status && status !== "done") throw new WorkflowError("Consulta já concluída.");
      if (status === "done" && severityScore(current.screening) > 5 && !current.observation.length && !current.internmentId) throw new WorkflowError("Registe o encaminhamento para observação ou internamento antes de concluir.");
      if (stage === "EXAM_RESULT") {
        const requests = await tx.requestExams.findMany({ where: { deletedAt: null, OR: [{ consultationId: id }, { observation: { consultationId: id } }, { internment: { consultation: { id } } }] }, select: { result: true, resultText: true } });
        if (!requests.length || !requests.every(hasExamResult)) throw new WorkflowError("Existem exames sem resultado.");
      }
      const data = await tx.consultation.update({
        where: { id },
        data: { description, diagnosis, userId: doctorId, status, stage, ...(status === "done" ? { stage: "CONCLUDE" as const } : {}) },
        include: { screening: { include: { customer: { select: { name: true } } } } },
      });
      if (data.screening?.attendanceId) {
        await tx.medicalConsultation.updateMany({ where: { screeningId: data.screeningId! }, data: { doctorId } });
        await tx.attendance.update({ where: { id: data.screening.attendanceId }, data: { status: status === "done" ? "COMPLETED" : "IN_CONSULTATION" } });
      }
      return data;
    });

    // Notify reception when consultation is concluded (diagnosis filled in)
    if (diagnosis && this.io) {
      const customerName = (data as any)?.screening?.customer?.name;
      notify(this.io, "recepcao", {
        title: "Consulta concluída",
        message: "Paciente aguarda na recepção",
        type: "success",
        patientName: customerName,
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
