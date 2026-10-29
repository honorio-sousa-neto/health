import { Purchase } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { MaterialRepository } from "../../repositories/material";
import { PurchaseRepository } from "../../repositories/purchase/purchase";
import {
  TCreatePurchase,
  TUpdatePurchase,
  createPurchase,
  primeiraMensagem,
} from "../../validator/purchase.validator";
import { MaterialController } from "../material";
import { resolveDefaultLocationId, stockEntry, stockReverseEntry, updateMovingAverageCost } from "../../services/stock/stock-service";

/** Duas casas: é dinheiro, e o total tem de bater com a factura. */
const arredondar = (valor: number) => Math.round(valor * 100) / 100;

export class PurchaseController {
  constructor(private readonly repository: PurchaseRepository) {}
  private readonly materialRepository = new MaterialRepository();
  private readonly materialController = new MaterialController(
    this.materialRepository
  );
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: Purchase[];
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
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      where: {
        deletedAt: null,
      },
      include: {
        Supplier: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
    const total = await this.repository.count({
      OR: [
        {
          Supplier: {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
        },
      ],
    });
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

  async show(id: string): Promise<{
    data: Purchase | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    // A vista de uma compra gravada mostra-a por extenso — artigo, unidade
    // comprada e unidade em que o stock a conta. Sem estas relações a vista
    // teria de adivinhar, ou pedir os artigos um a um.
    const data = await this.repository.show({
      PurchaseWhereUniqueInput: { id },
      include: {
        items: {
          include: {
            unit: { select: { id: true, name: true, abbreviation: true } },
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                unit: { select: { id: true, name: true, abbreviation: true } },
              },
            },
          },
        },
        Supplier: true,
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }
  async softDelete(id: string): Promise<{
    data: Purchase | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    try {
      const purchase: any = await this.repository.show({
        PurchaseWhereUniqueInput: { id },
        include: { items: true },
      });
      // statusCode 200 mesmo nas recusas: o composable do frontend
      // (useCreateUpdate) lê a flag `success` e não trata erros HTTP.
      if (!purchase) {
        return { data: null, message: "Compra não encontrada", statusCode: 200, success: false };
      }
      if (purchase.deletedAt) {
        return { data: null, message: "Esta compra já foi anulada", statusCode: 200, success: false };
      }

      const items = purchase.items ?? [];
      const description = `Anulação da compra ${purchase.code ?? id}`;

      // Estorna stock + fluxo financeiro + marca anulada, atomicamente.
      const data = await prisma.$transaction(async (tx) => {
        if (items.length) {
          const locationId = await resolveDefaultLocationId(tx);
          if (!locationId) {
            throw new Error(
              "Nenhum departamento está marcado para receber as entradas, por isso não há de onde estornar o stock."
            );
          }
          for (const item of items) {
            const qty = item.quantity * (item.conversionFactor ?? 1);
            await stockReverseEntry(tx, {
              productId: item.productId,
              locationId,
              quantity: qty,
              batch: item.batch ?? null,
              reason: "purchase_reversal",
              description,
            });
          }
        }

        // Devolve o valor ao caixa/banco (contrapartida do OUT da compra)
        await tx.flow.create({
          data: {
            amount: purchase.amount,
            description,
            type: "ENTRY",
            destination: purchase.bankAccountId || "Caixa",
          },
        });

        return tx.purchase.update({ where: { id }, data: { deletedAt: new Date() } });
      });

      return { data, message: "Compra anulada e stock revertido", statusCode: 200, success: true };
    } catch (error: any) {
      return { data: null, message: error?.message ?? "Erro ao anular compra", statusCode: 200, success: false };
    }
  }
  definePrice(lastPrices: number[], currentPrice: number): number {
    const n = lastPrices.length;

    // Caso o array esteja vazio, o preço atual prevalece
    if (n === 0) {
      return currentPrice;
    }

    // Regra 1: Se o preço atual for maior que todos os preços em `lastPrices`
    if (currentPrice > Math.max(...lastPrices)) {
      return currentPrice;
    }

    // Regra 2: Se houver pelo menos 2 preços, verificar se são decrescentes
    if (n >= 2) {
      const areDescending = lastPrices
        .slice(1)
        .every((price, index) => lastPrices[index] > price);
      if (areDescending && currentPrice < lastPrices[n - 1]) {
        return currentPrice;
      }
    }

    // Regra 3: Caso contrário, prevalece o maior preço entre os últimos preços e o atual
    return Math.max(...lastPrices, currentPrice);
  }
  async create(createData: TCreatePurchase): Promise<{
    data?: Purchase | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    try {
      const payload = createPurchase.parse(createData);
      const { items, ...rest } = payload;

      // O total é somado aqui, não recebido. O que o cliente enviasse viraria
      // o movimento de caixa: bastava um arredondamento ou uma linha alterada
      // depois da soma para o dinheiro deixar de bater com a factura.
      const amount = arredondar(
        items.reduce((soma, item) => soma + item.quantity * item.price, 0)
      );

      const total = await this.total(payload.bankAccountId || "Caixa");
      if (total < amount)
        throw new Error(
          "Valor indicado superior ao disponivel no Caixa. Por favor, verifique a quantia"
        );

      // Compra + fluxo financeiro + entradas de stock, atomicamente.
      const data = await prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.create({
          data: {
            ...rest,
            amount,
            items: {
              createMany: {
                data: items?.map((item) => item) ?? [],
              },
            },
          },
          include: {
            Supplier: {
              select: { name: true },
            },
          },
        });

        const description =
          purchase.other || `Compras ao fornecedor ${(purchase as any).Supplier?.name}`;

        // Registra o fluxo financeiro
        await tx.flow.create({
          data: {
            amount: purchase.amount,
            description,
            type: "OUT",
            destination: purchase.bankAccountId || "Caixa",
          },
        });

        // Entradas de stock na localização padrão (aparecem no /inventario)
        if (items?.length) {
          const locationId = await resolveDefaultLocationId(tx);
          if (!locationId) {
            throw new Error(
              "Nenhum departamento está marcado para receber as entradas. Vá a Inventário › Departamentos, abra um e ligue \"Recebe as entradas das compras\"."
            );
          }
          for (const item of items) {
            const factor = item.conversionFactor ?? 1;
            const stockQty = item.quantity * factor;
            await stockEntry(tx, {
              productId: item.productId,
              locationId,
              quantity: stockQty,
              batch: item.batch,
              expiration: item.expiration ?? null,
              reason: "purchase",
              description,
            });
            // Custo médio ponderado em unidade-base (não toca no preço de venda).
            const unitCostBase = factor > 0 ? (item.price ?? 0) / factor : (item.price ?? 0);
            await updateMovingAverageCost(tx, item.productId, stockQty, unitCostBase);
          }
        }

        return purchase;
      });

      return {
        data,
        message: data ? "Sucesso" : "Sem sucesso",
        statusCode: data ? 201 : 400,
        success: true,
      };
    } catch (error: any) {
      // Um ZodError tem `message` em JSON. Mostrado cru ao operador, é ruído.
      return {
        message: primeiraMensagem(error) ?? error?.message ?? "Erro ao registar a compra",
        statusCode: 400,
        success: false,
      };
    }
  }

  /**
   * O que tem de estar em pé para uma compra poder ser registada.
   *
   * As duas condições existiam antes e só se davam a conhecer ao gravar, com
   * a factura toda preenchida: sem armazém padrão a entrada de stock não tem
   * onde aterrar, e sem saldo em caixa o movimento financeiro é recusado. O
   * formulário passa a poder dizê-lo ao abrir.
   */
  async preFlight(destination = "Caixa") {
    const [location, cashBalance] = await Promise.all([
      prisma.stockLocation.findFirst({
        where: { isDefault: true, deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true },
      }),
      this.total(destination),
    ]);
    return {
      data: { defaultLocation: location, cashBalance, destination },
      statusCode: 200,
      success: true,
      message: "OK",
    };
  }

  /**
   * A última linha de compra de um artigo — unidade, conteúdo por embalagem e
   * custo. Serve para o formulário propor a embalagem habitual em vez de a
   * pedir outra vez a cada factura.
   */
  async lastItem(productId: string) {
    const item = await prisma.purchaseItem.findFirst({
      where: { productId, Purchase: { deletedAt: null } },
      orderBy: { createdAt: "desc" },
      select: {
        unitId: true,
        conversionFactor: true,
        price: true,
        createdAt: true,
        unit: { select: { id: true, abbreviation: true, name: true } },
      },
    });
    return { data: item, statusCode: 200, success: true, message: "OK" };
  }

  async update(
    id: string,
    updateData: TUpdatePurchase
  ): Promise<{
    data: Purchase | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    // Editar uma compra implicaria estornar e reaplicar stock + fluxo financeiro.
    // Enquanto isso não estiver implementado, recusamos explicitamente em vez de
    // fingir sucesso (o stub anterior devolvia success:true sem fazer nada).
    return {
      data: null,
      message:
        "Edição de compras não é suportada. Para corrigir, anule a compra e registe uma nova.",
      statusCode: 400,
      success: false,
    };
  }
  async total(flow: string): Promise<number> {
    const entry = await prisma.flow.aggregate({
      where: {
        destination: flow,
        type: "ENTRY",
      },
      _sum: {
        amount: true,
      },
    });
    const out = await prisma.flow.aggregate({
      where: {
        destination: flow,
        type: "OUT",
      },
      _sum: {
        amount: true,
      },
    });

    return Number(entry._sum.amount) - Number(out._sum.amount);
  }
}
