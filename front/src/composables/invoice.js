import { computed } from "vue";
import { useInvoiceStore } from "src/stores/invoice";
export const useInvoice = () => {
  const invoiceStore = useInvoiceStore();

  const totalInvoicePpFtFr = (items) => {
    let res = 0;
    items.forEach((item) => (res += item.unit_price * item.quantity));
    return res;
  };

  const totalInvoiceRc = (total, discount) => {
    return total + discount;
  };

  const total = computed(() => {
    if (["PP", "FR", "FT"].includes(invoiceStore.form.type))
      return totalInvoicePpFtFr(invoiceStore.form.invoiceItems);

    if (invoiceStore.form.type == "RC")
      return totalInvoiceRc(
        invoiceStore.currentInvoice.total,
        invoiceStore.currentInvoice.discount
      );
  });

  const discountInvoicePpFtFr = (items) => {
    let res = 0;
    items.forEach((item) => (res += item.discount * item.quantity));
    return res;
  };

  const discount = computed(() => {
    if (["PP", "FR", "FT"].includes(invoiceStore.form.type))
      return discountInvoicePpFtFr(invoiceStore.form.invoiceItems);
    if (invoiceStore.form.type == "RC")
      return invoiceStore.currentInvoice.discount;
  });

  const calculateQuantityNumber = (items) => {
    let itemsQuantity = items.reduce(
      (acc, current) => acc + current.quantity,
      0
    );
    items.forEach((item) => {
      if (item.category == "LAB") itemsQuantity += item.quantity;
    });
    return itemsQuantity;
  };

  const numberOfItems = computed(() => {
    if (!invoiceStore.form.customer.internId) return;
    return calculateQuantityNumber(invoiceStore.form.invoiceItems);
  });

  return {
    total,
    discount,
    numberOfItems,
  };
};
