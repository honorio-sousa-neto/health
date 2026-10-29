import { defineStore } from "pinia";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { reactive } from "vue";

/** Uma linha de factura, vazia. */
export const linhaVazia = () => ({
  productId: null,
  produto: null,
  quantity: 1,
  unitId: null,
  conversionFactor: 1,
  batch: null,
  expiration: null,
  price: null,
});

/** Hoje em ISO curto, que é o que o `type="date"` aceita. */
const hoje = () => new Date().toISOString().slice(0, 10);

const formVazio = () => ({
  supplierId: null,
  code: null,
  date: hoje(),
  items: [linhaVazia()],
});

export const usePurchaseStore = defineStore("purchase", () => {
  let data = reactive({
    data: [],
    invoices: [],
  });

  // `amount` não vive aqui: o total é somado no servidor a partir das linhas.
  let form = reactive(formVazio());

  const onReset = () => {
    Object.assign(form, formVazio());
    form.items = [linhaVazia()];

    Object.assign(pagination.meta, {
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  let pagination = reactive({
    meta: {
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
      orderBy: {
        createdAt: "desc",
      },
    },
  });
  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const index = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("purchases", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    Object.assign(pagination.meta, response.data.meta);
    data.data.length = 0;
    Object.assign(data.data, response.data.data);
    loadings.loadingAll = false;
  };

  const myInvoices = async (insuranceId, status) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("invoices/purchase/myInvoices", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
        purchaseId: insuranceId,
        status,
      },
    });

    Object.assign(pagination.meta, response.data.meta);
    data.invoices.length = 0;
    Object.assign(data.data, response.data.data);
    loadings.loadingAll = false;
  };

  const create = async (payload) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("purchases", payload);
    loadings.loadingCreate = false;
    if (response.success) {
      index();
      onReset();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("purchases", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  /** Anular: estorna o stock e devolve o valor ao caixa. Não é eliminar. */
  const anular = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("purchases/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("purchases", id);
    loadings.loadingOne = false;
    return response;
  };

  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("purchases/filter/search", {
      params: {
        search,
      },
    });
    loadings.loadingAll = false;
    return response.data.data;
  };

  return {
    index,
    create,
    destroy,
    show,
    data,
    pagination,
    loadings,
    anular,
    filter,
    form,
    onReset,
    myInvoices,
  };
});
