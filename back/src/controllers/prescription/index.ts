import { Prescription } from "@prisma/client";
import { PrescriptionRepository } from "../../repositories/prescription";
import {
  TCreatePrescription,
  TUpdatePrescription,
  createPrescription,
  updatePrescription,
} from "../../validator/prescription.validator";
import { Socket } from "socket.io";
import { prisma } from "../../database/prisma";
import { stockExit, StockError, totalBalance, checkMinStockTransition } from "../../services/stock/stock-service";
import { AmbulatoryRepository } from "../../repositories/ambulatory";

// Doses por embalagem: factor da unidade de contagem (ex.: "Cartela de 10" = 10)
// ou, em recurso, o unitsPerPackage do produto; senão 1 (sem conversão).
function packSizeOf(service: any): number {
  const u = service?.unit;
  if (u && u.kind === "count" && Number(u.factor) > 1) return Number(u.factor);
  const upp = Number(service?.unitsPerPackage);
  return upp > 1 ? upp : 1;
}

export class PrescriptionController {
  constructor(private readonly repository: PrescriptionRepository) {}
  private readonly ambulatoryRepository = new AmbulatoryRepository();

  /**
   * Dá saída de um item de farmácia por FEFO/lote (stockExit) quando há
   * localização padrão; sem ela, mantém o registo antigo sem lote. Alerta de
   * mínimo só ao cruzar.
   */
  private async dispenseStock(
    serviceId: string,
    qty: number,
    locationId: string | undefined,
    description: string,
    userId?: string
  ) {
    if (!(qty > 0)) return;
    const before = await totalBalance(prisma, serviceId);
    if (locationId) {
      await prisma.$transaction((tx) =>
        stockExit(tx, {
          productId: serviceId,
          locationId,
          quantity: qty,
          reason: "pharmacy_dispensing",
          description,
          userId,
        })
      );
    } else {
      throw new Error("Configure uma localização de stock antes de dispensar medicamentos.");
    }
    await checkMinStockTransition(prisma, serviceId, before);
  }
  async index(): Promise<{
    data: Prescription[];
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
      where: {
        paid: false,
        type: "PHARMACY",
      },
      include: {
        consultation: {
          include: {
            screening: {
              include: {
                customer: true,
              },
            },
          },
        },
        doctor: true,
        items: {
          include: {
            prescription: true,
            service: true,
          },
        },
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
    data: Prescription | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      prescriptionWhereUniqueInput: { id },
      include: {
        items: {
          include: {
            service: {
              include: { unit: true },
            },
          },
        },
        consultation: {
          include: {
            screening: {
              include: {
                customer: true,
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

  async create(createData: TCreatePrescription): Promise<{
    data: Prescription | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createPrescription.parse(createData);
    const { items, userId, consultationId, ...rest } = payload;
    const exists = await prisma.prescription.findFirst({
      where: {
        consultationId,
        type: rest.type,
      },
    });
    if (exists && exists.paid) {
      return {
        data: null,
        message: "Já foi pago",
        success: true,
        statusCode: 200,
      };
    }
    if (exists) {
      await prisma.prescription.delete({ where: { id: exists.id } });
    }
    const data = await this.repository.create({
      doctor: {
        connect: { id: userId },
      },
      consultation: {
        connect: { id: consultationId },
      },
      ...rest,
      items: {
        createMany: {
          data: items.map((item) => item),
        },
      },
    });
    if (rest.type == "AMBULATORY") {
      await prisma.ambulatory.create({
        data: {
          consultationId,
        },
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
    updateData: TUpdatePrescription,
    userId?: string
  ): Promise<{
    data: Prescription | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.update({ id }, { paid: true });

    if (data) {
      await prisma.ambulatory.updateMany({
        where: { consultationId: data.consultationId as string },
        data: { consultationId: data.consultationId as string, paid: true },
      });
    }

    // NOTA: não se desconta stock aqui. Esta rota é chamada ao FATURAR a receita
    // (logo após criar a fatura), e a fatura já dá a saída do stock em invoice.ts
    // (reason "sale"). Descontar também aqui duplicava a saída. A dispensa direta
    // pela farmácia (sem fatura) está no método dispense().

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async historico(params: { page?: string; perPage?: string; from?: string; to?: string }): Promise<{ data: Prescription[]; meta?: any; message?: string; success?: boolean; statusCode: number }> {
    const take = Number(params.perPage) || 20;
    const skip = Math.max(((Number(params.page) || 1) - 1) * take, 0);
    const where: any = { paid: true, type: "PHARMACY" };
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to)   where.createdAt.lte = new Date(params.to + "T23:59:59");
    }
    const [data, total] = await Promise.all([
      this.repository.index({
        where, take, skip,
        orderBy: { createdAt: "desc" },
        include: {
          doctor: true,
          items: { include: { service: true } },
          consultation: { include: { screening: { include: { customer: true } } } },
        },
      }),
      this.repository.count(where),
    ]);
    return {
      data,
      meta: { total, totalPages: Math.ceil(total / take), page: Number(params.page) || 1, perPage: take },
      statusCode: 200, message: "OK", success: true,
    };
  }

  async dispense(id: string, userId: string): Promise<{ data: Prescription | null; message?: string; success?: boolean; statusCode: number }> {
    try {
      const data = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT "id" FROM "Prescription" WHERE "id" = ${id}::uuid FOR UPDATE`;
        const prescription = await tx.prescription.findUnique({ where: { id }, include: { items: { include: { service: { include: { unit: true } } } } } });
        if (!prescription) throw new StockError("Prescrição não encontrada");
        if (prescription.paid) throw new StockError("Prescrição já dispensada");
        if (prescription.type !== "PHARMACY") throw new StockError("Apenas prescrições do tipo Farmácia podem ser dispensadas");
        const location = await tx.stockLocation.findFirst({ where: { isDefault: true, deletedAt: null } });
        if (!location) throw new StockError("Configure uma localização de stock antes de dispensar medicamentos.");
        for (const item of [...prescription.items].sort((a, b) => a.serviceId.localeCompare(b.serviceId))) {
          const requested = Number(item.quantity);
          if (!Number.isFinite(requested) || requested <= 0) throw new StockError("Quantidade prescrita inválida");
          await stockExit(tx, { productId: item.serviceId, locationId: location.id, quantity: Math.ceil(requested / packSizeOf(item.service)), reason: "pharmacy_dispensing", description: `Dispensado para prescrição ${id}`, userId });
        }
        return tx.prescription.update({ where: { id }, data: { paid: true } });
      });
      return { data, message: "Prescrição dispensada com sucesso", success: true, statusCode: 200 };
    } catch (error) {
      if (error instanceof StockError) return { data: null, message: error.message, success: false, statusCode: 400 };
      throw error;
    }
  }
}
