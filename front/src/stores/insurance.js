import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
export const useInsuranceStore = defineStore("insurance", () => {
  let data = reactive({
    data: [],
    invoices: [],
    insurance: {
      id: null,
      name: null,
      address: null,
      phone: null,
      nif: null,
      customersInsurance: [],
    },
  });

  let form = reactive({
    name: null,
    address: null,
    phone: null,
    nif: null,
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
  });

  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });
  const onReset = () => {
    Object.assign(form, {
      name: null,
      address: null,
      phone: null,
      nif: null,
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
  const index = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("insurance-new", {
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
    const response = await useFetchApi().index(
      "invoices/insurance/myInvoices",
      {
        params: {
          perPage: pagination.meta.perPage,
          page: pagination.meta.page,
          search: pagination.meta.search,
          orderBy: pagination.meta.orderBy,
          insuranceId: insuranceId,
          status,
        },
      }
    );

    Object.assign(pagination.meta, response.data.meta);
    data.invoices.length = 0;
    Object.assign(data.invoices, response.data.data);
    loadings.loadingAll = false;
  };

  const myInvoicesTotal = async (insuranceId, status) => {
    const response = await useFetchApi().index(
      "invoices/insurance/myInvoices/total",
      {
        params: {
          insuranceId: insuranceId,
          status,
        },
      }
    );

    return response.data.data;
  };

  const indexCustomers = async (id) => {
    const response = await useFetchApi().index(
      "insurances/index-customers/list",
      {
        params: {
          id,
        },
      }
    );
    Object.assign(data.insurance, response.data);
    return response.data.data;
  };

  const create = async (form) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("insurance-new", form);
    loadings.loadingCreate = false;
    if (response.success) {
      onReset();
      index();
    }
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("insurance-new", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete(
      "insurance-new/soft-delete",
      id
    );
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("insurance-new/" + id, form);
    loadings.loadingCreate = false;
    if (response.message) {
      onReset();
      index();
    }
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("insurance-new", id);
    Object.assign(form, response.data.data);
    loadings.loadingOne = false;
    return response;
  };

  const attachCustomer = async (id, payload) => {
    const response = await useFetchApi().store(
      "insurances/attach-customer/" + id,
      payload
    );
    if (response.success) {
      indexCustomers(id);
    }
    return response;
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
    form,
    myInvoices,
    myInvoicesTotal,
    onReset,
    indexCustomers,
    attachCustomer,
  };
});
