import { Consultation, RequestExams } from "@prisma/client";
import { prisma } from "../../database/prisma";

const examInclude = { include: { exam: true } };

const examIncludeWithConsumables = {
  include: {
    exam: true,
    consumables: {
      include: {
        consumable: { select: { id: true, name: true } },
      },
    },
  },
};

export class RequestExamsRepository {
  async index(params: { analystId?: string }): Promise<Consultation[]> {
    const { analystId } = params;
    const labFilter = analystId
      ? { OR: [{ labUserId: null }, { labUserId: analystId }] }
      : {};
    return prisma.consultation.findMany({
      where: {
        OR: [
          { exams: { some: {} } },
          { observation: { some: { exams: { some: {} } } } },
        ],
        stage: { not: "EXAM_RESULT" },
        ...labFilter,
      },
      include: {
        doctor: true,
        screening: { include: { customer: true } },
        exams: {
          include: {
            exam: examInclude,
          },
        },
        observation: {
          include: {
            exams: {
              include: {
                exam: examInclude,
              },
            },
          },
        },
        internment: {
          include: {
            exams: {
              include: {
                exam: examInclude,
              },
            },
          },
        },
      },
    });
  }

  async updateMany(consultationId: string, exams: string[]): Promise<any> {
    return prisma.requestExams.updateMany({
      where: {
        consultationId,
        deletedAt: null,
        examId: {
          in: exams,
        },
      },
      data: {
        paid: true,
      },
    });
  }

  async update(id: string, payload: any): Promise<RequestExams> {
    return prisma.requestExams.update({
      where: { id },
      data: { ...payload },
    });
  }

  async results(params: {}): Promise<Consultation[]> {
    return prisma.consultation.findMany({
      include: {
        exams: {
          include: {
            exam: examInclude,
          },
        },
        screening: { include: { customer: true } },
        doctor: true,
      },
      where: {
        OR: [
          { stage: "CONSULTING_CLINIC" },
          { stage: "EXAM_RESULT" },
        ],
      },
    });
  }

  async concludeExternal(customerId: string): Promise<void> {
    await prisma.requestExams.updateMany({
      where: {
        customerId,
        consultationId: null,
        observationId:  null,
        internmentId:   null,
        deletedAt:      null,
        concludedAt:    null,
      },
      data: { concludedAt: new Date() },
    });
  }

  async createExternal(customerId: string, examIds: string[], paid = false): Promise<RequestExams[]> {
    const created: RequestExams[] = [];
    for (const examId of examIds) {
      const req = await prisma.requestExams.create({
        data: { customerId, examId, paid },
      });
      created.push(req);
    }
    return created;
  }

  async indexExternal(): Promise<any[]> {
    const rows = await prisma.requestExams.findMany({
      where: {
        customerId: { not: null },
        consultationId: null,
        observationId: null,
        internmentId: null,
        deletedAt: null,
      },
      include: {
        customer: true,
        exam: examInclude,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by customerId
    const map = new Map<string, any>();
    for (const row of rows) {
      if (!map.has(row.customerId!)) {
        map.set(row.customerId!, {
          customerId: row.customerId,
          customer: row.customer,
          exams: [],
        });
      }
      map.get(row.customerId!)!.exams.push(row);
    }
    return Array.from(map.values());
  }

  async findByCustomer(customerId: string): Promise<any> {
    const exams = await prisma.requestExams.findMany({
      where: {
        customerId,
        consultationId: null,
        observationId: null,
        internmentId: null,
        deletedAt: null,
      },
      include: { exam: examIncludeWithConsumables },
      orderBy: { createdAt: "asc" },
    });
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    return { customerId, customer, exams };
  }
}
