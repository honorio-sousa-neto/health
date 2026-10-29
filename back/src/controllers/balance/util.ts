interface IService {
  service: {
    category: {
      id: string;
      name: string;
      categoryId: string; // ID da categoria principal
      category: {
        name: string;
      };
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
  };
  total: number;
  price: number;
  quantity: number;
  discount: number;
  invoiceId: string;
  serviceId: string;
}

interface Invoice {
  invoiceItems: IService[];
}

interface GroupedByCategory {
  [categoryId: string]: {
    categoryName: string; // Nome da categoria principal (se disponível)
    total: number; // Soma dos totais dos serviços dessa categoria
    id: string;
  };
}

// ── Payment aggregation ────────────────────────────────────────────────────────

type InvoiceItem = { price: number; quantity: number; discount: number };

interface InvoiceWithPayment {
  // FR: payment directo; FT FINAL: payment via invoiceCurrent (RC)
  payment?: { name: string; code: string } | null;
  invoiceCurrent?: { payment?: { name: string; code: string } | null } | null;
  invoiceItems: InvoiceItem[];
}

export interface PaymentGroup {
  name: string;
  code?: string;
  total: number;
}

function sumItems(items: InvoiceItem[]): number {
  return items.reduce((s, i) => s + (i.price - i.discount) * i.quantity, 0);
}

export function groupByPaymentAndSum(invoices: InvoiceWithPayment[]): PaymentGroup[] {
  const map: Record<string, PaymentGroup> = {};

  for (const invoice of invoices) {
    const total = sumItems(invoice.invoiceItems);
    if (total === 0) continue;

    // Determina o método de pagamento:
    // FR → invoice.payment; FT FINAL → invoiceCurrent.payment; FT POR_PAGAR → "Sem pagamento"
    const pmt = invoice.payment ?? invoice.invoiceCurrent?.payment ?? null;
    const name = pmt?.name ?? "Sem pagamento";
    const code = pmt?.code;

    if (!map[name]) map[name] = { name, code, total: 0 };
    map[name].total += total;
  }

  // Paid methods first, "Sem pagamento" last
  return Object.values(map).sort((a, b) => {
    if (a.name === "Sem pagamento") return 1;
    if (b.name === "Sem pagamento") return -1;
    return b.total - a.total;
  });
}

// ── Category aggregation ───────────────────────────────────────────────────────

export function groupByCategoryAndSum(invoices: Invoice[]): GroupedByCategory {
  const grouped: GroupedByCategory = {};

  invoices.forEach((invoice) => {
    invoice.invoiceItems.forEach((item) => {
      const svcCat = item.service.category;
      if (!svcCat) return;

      // Se a categoria do serviço já é de topo (sem pai), agrupamos por ela mesma.
      // Se tem pai (sub-categoria), agrupamos pela categoria-pai.
      const isTopLevel = !svcCat.categoryId;
      const groupId   = isTopLevel ? svcCat.id         : svcCat.categoryId;
      const groupName = isTopLevel ? svcCat.name        : (svcCat.category?.name ?? svcCat.name);

      if (!grouped[groupId]) {
        grouped[groupId] = { categoryName: groupName, total: 0, id: groupId };
      }
      // item.total (guardado) está por vezes corrompido/inflado. Calculamos a
      // partir de preço × quantidade − desconto, igual ao invoice.total e ao
      // groupByPaymentAndSum (sumItems), para o balanço bater com a facturação.
      grouped[groupId].total += (item.price - (item.discount ?? 0)) * item.quantity;
    });
  });

  return grouped;
}
