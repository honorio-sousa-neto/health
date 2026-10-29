import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");
import { showNotify } from "src/utils/notify";
export const useSymptomStore = defineStore("symptom", () => {
  let data = reactive({
    data: [],
  });

  let form = reactive({
    customerId: "",
    type: "FT",
    paymentId: "",
    reasonInssuance: "",
    invoiceId: null,
    emission_date: "",
    invoiceItems: [],
    userId: user.id,
    amount_received: 0,
    total: 0,
    discount: 0,
  });

  let currentInvoice = reactive({
    customerId: "",
    type: "FT",
    paymentId: "",
    reasonInssuance: "",
    invoiceId: null,
    emission_date: "",
    invoiceItems: [],
    userId: user.id,
    amount_received: 0,
    total: 0,
    discount: 0,
    customer: {},
  });

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
    category: "FT",
    status: "POR_PAGAR",
  });
  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const erase = ref(0);
  const onReset = () => {
    Object.assign(form, {
      customerId: "",
      type: "FT",
      paymentId: "",
      reasonInssuance: "",
      invoiceId: null,
      emission_date: "",
      invoiceItems: [],
      userId: user.id,
      amount_received: 0,
      total: 0,
      discount: 0,
    });
    Object.assign(currentInvoice, {
      customerId: "",
      type: "FT",
      paymentId: "",
      reasonInssuance: "",
      invoiceId: null,
      emission_date: "",
      invoiceItems: [],
      userId: user.id,
      amount_received: 0,
      total: 0,
      discount: 0,
      customer: {},
    });
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
  const index = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("symptoms", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: search || pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    data.data.length = 0;
    Object.assign(data.data, response.data.data);

    Object.assign(pagination.meta, response.data.meta);
    loadings.loadingAll = false;
    return response.data.data;
  };
  const indexByStatus = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index(
      "symptoms/index-by-status/" + pagination.status,
      {
        params: {
          perPage: pagination.meta.perPage,
          page: pagination.meta.page,
          search: pagination.meta.search,
          orderBy: pagination.meta.orderBy,
        },
      }
    );

    Object.assign(pagination.meta, response.data.meta);
    data.data.length = 0;
    Object.assign(data.data, response.data.data);
    loadings.loadingAll = false;
  };

  const create = async (form) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("symptoms", form);
    loadings.loadingCreate = false;
    if (response.success) {
      showNotify(response.message, response.success);
      onReset();
      erase.value += 1;
      await index();
    }
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("symptoms", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("symptoms/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("symptoms/" + id, form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("symptoms", id);
    loadings.loadingOne = false;
    return response;
  };
  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("symptoms/filter/search", {
      params: {
        search,
      },
    });
    loadings.loadingAll = false;
    return response.data.data;
  };

  const leftDrawerOpen = ref(true);
  return {
    index,
    create,
    destroy,
    update,
    show,
    data,
    pagination,
    loadings,
    softDelete,
    filter,
    form,
    indexByStatus,
    currentInvoice,
    erase,
    leftDrawerOpen,
    onReset,
  };
});
