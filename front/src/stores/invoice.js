import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { SessionStorage } from "quasar";
import { showNotify } from "src/utils/notify";
export const useInvoiceStore = defineStore("invoice", () => {
  const user = SessionStorage.getItem("alfavida_user");
  let data = reactive({
    data: [],
  });

  let products = reactive([]);

  let form = reactive({
    customerId: "",
    customer: {
      name: "",
      nif: "",
      phone: "",
      source: "",
      address: "",
      email: "",
      insuranceId: null,
      protocolId: null,
      partnerId: null,
      internId: null,
      intern: null,
      parentId: null,
      parent: null,
      children: [],
      insurance_number: null,
    },
    attendanceId: null,
    presetAttendanceId: null,
    asNormal: true,
    type: "FR",
    paymentId: "",
    reasonInssuance: "",
    co_payment: null,
    invoiceId: null,
    emission_date: "",
    invoiceItems: [],
    userId: user?.id,
    amount_received: 0,
    total: 0,
    discount: 0,
    beneficial: null,
    bank: "",
    ambulatoryConsultationId: null,
  });

  const items = reactive({
    data: [],
  });

  let currentInvoice = reactive({
    customerId: "",
    asNormal: true,
    customer: {
      name: "",
      nif: "",
      phone: "",
      source: "",
      address: "",
      email: "",
      insuranceId: null,
      protocolId: null,
      partnerId: null,
      internId: null,
      intern: null,
      parentId: null,
      parent: null,
      children: [],
      insurance_number: null,
    },
    type: "FT",
    paymentId: "",
    reasonInssuance: "",
    co_payment: null,
    invoiceId: null,
    emission_date: "",
    invoiceItems: [],
    userId: user.id,
    amount_received: 0,
    total: 0,
    discount: 0,
    beneficial: null,
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
      attendanceId: null,
      presetAttendanceId: null,
      asNormal: true,
      customer: {
        name: "",
        nif: "",
        phone: "",
        source: "",
        address: "",
        email: "",
        insuranceId: null,
        protocolId: null,
        partnerId: null,
        internId: null,
        intern: null,
        parentId: null,
        parent: null,
        children: [],
        insurance_number: null,
      },
      type: "FT",
      paymentId: "",
      reasonInssuance: "",
      co_payment: null,
      invoiceId: null,
      emission_date: "",
      invoiceItems: [],
      userId: user.id,
      amount_received: 0,
      total: 0,
      discount: 0,
      beneficial: null,
    });
    Object.assign(currentInvoice, {
      customerId: "",
      asNormal: true,
      customer: {
        name: "",
        nif: "",
        phone: "",
        source: "",
        address: "",
        email: "",
        insuranceId: null,
        protocolId: null,
        partnerId: null,
        internId: null,
        intern: null,
        parentId: null,
        parent: null,
        children: [],
        insurance_number: null,
      },
      type: "FT",
      paymentId: "",
      reasonInssuance: "",
      co_payment: null,
      invoiceId: null,
      emission_date: "",
      invoiceItems: [],
      userId: user.id,
      amount_received: 0,
      total: 0,
      discount: 0,
      beneficial: null,
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
  const index = async () => {
    loadings.loadingAll = true;
    if (pagination.meta.search) {
      pagination.meta.page = 1;
      pagination.meta.perPage = 15;
    }
    const response = await useFetchApi().index(
      "invoices/index/" + pagination.category,
      {
        params: {
          perPage: pagination.meta.perPage,
          page: pagination.meta.page,
          search: pagination.meta.search,
          orderBy: pagination.meta.orderBy,
        },
      }
    );

    data.data.length = 0;
    Object.assign(data.data, response.data.data);

    Object.assign(pagination.meta, response.data.meta);
    loadings.loadingAll = false;
  };
  const indexByStatus = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index(
      "invoices/index-by-status/" + pagination.status,
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

  const pendingSubmission = SessionStorage.getItem("invoice_pending_submission");
  let submissionKey = pendingSubmission?.userId === user?.id ? pendingSubmission.key : null;
  let submissionPayload = pendingSubmission?.userId === user?.id ? pendingSubmission.payload : null;
  const create = async (form) => {
    const { __idempotencyKey, ...payloadData } = form;
    const payload = JSON.stringify(payloadData);
    if (submissionPayload !== payload) { submissionKey = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join(""); submissionPayload = payload; }
    SessionStorage.set("invoice_pending_submission", { userId: user.id, key: submissionKey, payload });
    form.__idempotencyKey = submissionKey;
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("invoices", form);
    loadings.loadingCreate = false;
    if (response.success) {
      submissionKey = null; submissionPayload = null;
      SessionStorage.remove("invoice_pending_submission");
      showNotify(response.message, true);
      onReset();
      erase.value += 1;
    } else {
      showNotify(response.message || "Erro ao criar documento", false);
    }
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("invoices", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("invoices/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("invoices/" + id, form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("invoices", id);
    loadings.loadingOne = false;
    return response;
  };
  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("invoices/filter/search", {
      params: {
        search,
      },
    });
    loadings.loadingAll = false;
    return response.data.data;
  };

  // Fechada por omissão: acima do breakpoint o show-if-above do q-drawer
  // abre-a sozinho, e abaixo dele (telemóvel) a aplicação passa a abrir
  // no conteúdo em vez de abrir no menu a cobrir o ecrã.
  const leftDrawerOpen = ref(false);
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
    items,
    products,
  };
});
