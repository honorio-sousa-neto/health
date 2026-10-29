import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";

export const useFlowStore = defineStore("flow", () => {
  let data = reactive({
    data: [],
    invoices: [],
  });

  let form = reactive({
    name: "",
    nif: "",
    phone: "",
    source: "",
    email: "",
    insuranceId: null,
    protocolId: null,
    partnerId: null,
    insurance_number: null,
  });

  const onReset = () => {
    Object.assign(form, {
      name: "",
      nif: "",
      address: "",
      phone: "",
      source: "",
      email: "",
      insuranceId: null,
      protocolId: null,
      partnerId: null,
      insurance_number: null,
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

  const index = async (flow) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index(`flows/index/${flow}`, {
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
    return response.data;
  };

  const myInvoices = async (insuranceId, status) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("invoices/flow/myInvoices", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
        flowId: insuranceId,
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
    const response = await useFetchApi().store("flows", payload);
    loadings.loadingCreate = false;
    if (response.success) {
      onReset();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("flows", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("flows/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("flows/" + id, form);
    loadings.loadingCreate = false;
    if (response.success) {
      await show(id);
      onReset();
      index();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("flows", id);
    Object.assign(form, response.data.data);
    loadings.loadingOne = false;
    return response;
  };
  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("flows/filter/search", {
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
    update,
    show,
    data,
    pagination,
    loadings,
    softDelete,
    filter,
    form,
    onReset,
    myInvoices,
  };
});
