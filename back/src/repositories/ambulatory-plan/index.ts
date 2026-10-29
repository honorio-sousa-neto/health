import { severityScore } from "../../security/severity";
import { prisma } from "../../database/prisma";

const freqToDaily = (freq: string): number => {
  if (!freq) return 1;
  const xMatch = freq.match(/^(\d+)x\/dia$/i);
  if (xMatch) return Number(xMatch[1]);
  const hMatch = freq.match(/^(\d+)\/(\d+)h$/i);
  if (hMatch) return Math.round(24 / Number(hMatch[2]));
  return 1;
};

const sessionInclude = {
  orderBy: [{ day: "asc" as const }, { serviceId: "asc" as const }, { timeOfDay: "asc" as const }],
  include: { service: { select: { id: true, name: true, classificacao: true } } },
};

export class AmbulatoryPlanRepository {
  async create(prescriptionId: string, customerId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId }, include: { items: true, consultation: { include: { screening: { include: { attendance: true } }, observation: { where: { deletedAt: null } } } } },
    });
    if (!prescription || prescription.deletedAt || prescription.type !== "AMBULATORY") throw new Error("Prescrição de ambulatório não encontrada");
    if (!prescription.consultation?.screening || prescription.consultation.screening.customerId !== customerId) throw new Error("A prescrição não pertence a este paciente");
    if (prescription.consultation.screening.attendance?.status === "CANCELED") throw new Error("Atendimento cancelado");
    if (severityScore(prescription.consultation.screening) > 5 && !prescription.consultation.observation.length && !prescription.consultation.internmentId) throw new Error("Registe o encaminhamento antes de criar o plano de ambulatório");
    if (!prescription.items.length || prescription.items.some(item => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 1000)) throw new Error("Quantidade de sessões inválida");
    const existing = await prisma.ambulatoryPlan.findUnique({ where: { prescriptionId } });
    if (existing) { await this._concludeConsultation(prescriptionId); return existing; }

    const sessions: { serviceId: string; number: number; day: number; timeOfDay: number }[] = [];
    for (const item of prescription.items) {
      const qty = Number(item.quantity) || 1;
      const fpd = freqToDaily(item.frequency);
      for (let n = 1; n <= qty; n++) {
        sessions.push({
          serviceId: item.serviceId,
          number: n,
          day: Math.ceil(n / fpd),
          timeOfDay: ((n - 1) % fpd) + 1,
        });
      }
    }

    const plan = await prisma.ambulatoryPlan.create({
      data: {
        prescriptionId,
        customerId,
        sessions: { create: sessions },
      },
      include: {
        sessions: sessionInclude,
        customer: true,
      },
    });

    await this._concludeConsultation(prescriptionId);
    return plan;
  }

  private async _concludeConsultation(prescriptionId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { consultationId: true },
    });
    if (!prescription?.consultationId) return;
    const consultation = await prisma.consultation.findUnique({
      where: { id: prescription.consultationId },
      select: { status: true, diagnosis: true, screening: { select: { attendanceId: true } } },
    });
    if (consultation && consultation.status !== "done") {
      await prisma.$transaction(async tx => {
        await tx.consultation.update({ where: { id: prescription.consultationId! }, data: { status: "done", stage: "CONCLUDE", diagnosis: consultation.diagnosis || "Ambulatório" } });
        if (consultation.screening?.attendanceId) await tx.attendance.update({ where: { id: consultation.screening.attendanceId }, data: { status: "COMPLETED" } });
      });
    }
  }

  async findAll() {
    return prisma.ambulatoryPlan.findMany({
      include: {
        customer: { select: { id: true, name: true } },
        sessions: sessionInclude,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(planId: string) {
    return prisma.ambulatoryPlan.findUnique({
      where: { id: planId },
      include: {
        customer: { select: { id: true, name: true } },
        prescription: {
          include: {
            items: {
              include: { service: { select: { id: true, name: true, classificacao: true } } },
            },
          },
        },
        sessions: sessionInclude,
      },
    });
  }

  async markDone(sessionId: string, doneById: string) {
    const session = await prisma.ambulatorySession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error("Session not found");
    if (session.doneAt) throw new Error("Session already done");
    const updated = await prisma.ambulatorySession.updateMany({ where: { id: sessionId, doneAt: null }, data: { doneAt: new Date(), doneById } });
    if (!updated.count) throw new Error("Session already done");
    return prisma.ambulatorySession.findUnique({ where: { id: sessionId } });
  }
}
