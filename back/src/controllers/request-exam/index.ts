import { hasExamResult } from "../../security/exam-result";
import { WorkflowError } from "../../security/workflow";
import { publicPayload } from "../../security/response";
import { clinicalRooms } from "../../security/auth";
import { Consultation, RequestExams, ResultTest } from "@prisma/client";
import { RequestExamsRepository } from "../../repositories/request-exam";
import { Socket } from "socket.io";
import { prisma } from "../../database/prisma";
import { notify } from "../../utils/notify";
import { StockError, stockExit, totalBalance, checkMinStockTransition } from "../../services/stock/stock-service";

export class RequestExamsController {
  constructor(
    private readonly repository: RequestExamsRepository,
    private readonly io: Socket
  ) {}
  async index(analystId?: string): Promise<{
    data: Consultation[];
    success: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.index({ analystId });
    return {
      data,
      success: true,
      statusCode: 200,
    };
  }

  async updateMany(consultationId: string, exams: string[]): Promise<{
    success: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.updateMany(consultationId, exams);
    if (data) {
      this.io.to(clinicalRooms).emit("exams:request", publicPayload(data));
      this.io.to(clinicalRooms).emit("exams:external-updated");
    }
    return {
      success: true,
      statusCode: 200,
    };
  }

  async setResult(
    payload: {
      id: string;
      result: any;
      resultText: string;
      resultColor: ResultTest;
      consultationId: string | null;
      materials?: { productId: string; quantity: number; name?: string; unit?: string }[];
    }[],
    userId?: string
  ): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
  }> {
    if (!Array.isArray(payload) || !payload.length) throw new WorkflowError("Indique os resultados dos exames.", 400);
    const balances = new Map<string, number>();
    try {
      await prisma.$transaction(async tx => {
        const location = await tx.stockLocation.findFirst({ where: { isDefault: true, deletedAt: null } });
        const consultations = new Set<string>();
        for (const element of [...payload].sort((a, b) => a.id.localeCompare(b.id))) {
          await tx.$queryRaw`SELECT id FROM "RequestExams" WHERE id = ${element.id}::uuid FOR UPDATE`;
          const exam = await tx.requestExams.findUnique({ where: { id: element.id }, include: { observation: { select: { consultationId: true } }, internment: { select: { consultation: { select: { id: true } } } } } });
          if (!exam || exam.deletedAt) throw new WorkflowError("Exame não encontrado.", 404);
          if (!exam.paid) throw new WorkflowError("O exame aguarda pagamento.");
          if (exam.concludedAt) throw new WorkflowError("Resultados já concluídos. Não é possível alterar.", 400);
          const linkedConsultationId = exam.consultationId ?? exam.observation?.consultationId ?? exam.internment?.consultation?.id ?? null;
          if ((element.consultationId ?? null) !== linkedConsultationId) throw new WorkflowError("O exame não pertence a esta consulta.", 400);
          const marca = `[lab:${element.id}]`;
          const previous = await tx.movimentationStock.findMany({ where: { reason: "lab_consumption", description: { contains: marca } } });
          for (const productId of new Set([...previous.map(m => m.productId), ...(element.materials ?? []).map(m => m.productId)])) if (!balances.has(productId)) balances.set(productId, await totalBalance(tx, productId));
          for (const movement of previous) if (movement.batchProductId) await tx.batchProduct.update({ where: { id: movement.batchProductId }, data: { quantity: { increment: movement.quantity } } });
          await tx.movimentationStock.deleteMany({ where: { reason: "lab_consumption", description: { contains: marca } } });
          for (const material of [...(element.materials ?? [])].sort((a,b) => a.productId.localeCompare(b.productId))) {
            if (!Number.isFinite(material.quantity) || material.quantity < 0) throw new WorkflowError("Quantidade de consumível inválida.", 400);
            if (material.quantity === 0) continue;
            if (!location) throw new WorkflowError("Configure uma localização de stock.", 400);
            await stockExit(tx, { productId: material.productId, locationId: location.id, quantity: material.quantity, reason: "lab_consumption", description: `Consumo laboratorial ${marca}`, userId });
          }
          await tx.requestExams.update({ where: { id: element.id }, data: { result: element.result, resultText: element.resultText, resultColor: element.resultColor, materialsUsed: element.materials ?? [] } });
          if (linkedConsultationId) consultations.add(linkedConsultationId);
        }
        for (const id of consultations) {
          const requests = await tx.requestExams.findMany({ where: { deletedAt: null, OR: [{ consultationId: id }, { observation: { consultationId: id } }, { internment: { consultation: { id } } }] }, select: { result: true, resultText: true } });
          const allReady = requests.length > 0 && requests.every(hasExamResult);
          await tx.consultation.updateMany({ where: { id, status: { not: "done" } }, data: { stage: allReady ? "EXAM_RESULT" : "CONSULTING_CLINIC" } });
        }
      });
    } catch (error) {
      if (error instanceof StockError) return { success: false, statusCode: 400, message: error.message };
      throw error;
    }
    for (const [productId, before] of balances) await checkMinStockTransition(prisma, productId, before);
    this.io.to(clinicalRooms).emit("exams:external-updated");
    return { success: true, statusCode: 200, message: "Resultados atualizados com sucesso" };
  }

  private async getCustomerIdFromExam(requestExamId: string): Promise<string | null> {
    const req = await prisma.requestExams.findUnique({ where: { id: requestExamId } });
    return req?.customerId ?? null;
  }

  async createExternal(customerId: string, examIds: string[], paid = false): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
    data: any[];
  }> {
    const data = await this.repository.createExternal(customerId, examIds, paid);
    this.io.to(clinicalRooms).emit("exams:external-updated");
    notify(this.io, "laboratorio", {
      title: "Novo pedido de exame",
      message: `${examIds.length} exame(s) solicitado(s)`,
      type: "alert",
    });
    return { success: true, statusCode: 201, message: "Exames externos criados", data };
  }

  async concludeExternal(customerId: string): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
  }> {
    await this.repository.concludeExternal(customerId);
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { name: true },
    });
    this.io.to(clinicalRooms).emit("exams:external-done", { customerId });
    notify(this.io, "recepcao", {
      title: "Resultados de exame prontos",
      message: customer?.name
        ? `Os resultados de ${customer.name} estão disponíveis`
        : "Resultados de exame externo disponíveis",
      type: "success",
      patientName: customer?.name ?? undefined,
    });
    return { success: true, statusCode: 200, message: "Exames concluídos com sucesso" };
  }

  async indexExternal(): Promise<{
    success: boolean;
    statusCode: number;
    data: any[];
  }> {
    const data = await this.repository.indexExternal();
    return { success: true, statusCode: 200, data };
  }

  async findByCustomer(customerId: string): Promise<{
    success: boolean;
    statusCode: number;
    data: any;
  }> {
    const data = await this.repository.findByCustomer(customerId);
    return { success: true, statusCode: 200, data };
  }

  async create(
    consultationId: string,
    exams: string[]
  ): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
    data: RequestExams[];
  }> {
    const examsRequested: RequestExams[] = [];

    for await (const exam of exams) {
      const data = await prisma.requestExams.upsert({
        where: {
          consultationId_examId: {
            consultationId,
            examId: exam,
          },
        },
        create: {
          consultationId,
          examId: exam,
          paid: false,
        },
        update: {},
      });

      examsRequested.push(data);
    }
    // Notify lab and reception about the new exam requests
    notify(this.io, "laboratorio", {
      title: "Novo pedido de exame",
      message: `${exams.length} exame(s) solicitado(s) pelo médico`,
      type: "alert",
    });
    notify(this.io, "recepcao", {
      title: "Pedido de exame",
      message: `Médico solicitou ${exams.length} exame(s)`,
      type: "info",
    });
    return {
      success: true,
      statusCode: 200,
      message: "Exames solicitados com sucesso",
      data: examsRequested,
    };
  }

  async claimConsultation(consultationId: string, analystId: string): Promise<{
    success: boolean;
    statusCode: number;
  }> {
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { labUserId: analystId },
    });
    return { success: true, statusCode: 200 };
  }

  async results(): Promise<{
    success: boolean;
    statusCode: number;
    data: Consultation[];
  }> {
    const data = await this.repository.results({});
    return {
      data,
      statusCode: 200,
      success: true,
    };
  }
}
