import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";

export const useExamsStore = defineStore("exams", () => {
  let data = reactive({
    data: [],
  });

  let form = reactive({
    name: null,
    reference: "N",
    isHeader: false,
    serviceId: null,
    sectionId: null,
    options: [],
    subItens: [
      {
        isHeader: false,
        name: null,
        input: "TEXT",
        options: [],
        subItens: [],
        reference: "N",
      },
    ],
    input: "TEXT",
  });

  let currentExam = reactive({
    name: null,
    reference: "N",
    isHeader: false,
    serviceId: null,
    sectionId: null,
    options: [],
    subItens: [
      {
        isHeader: false,
        name: null,
        input: "TEXT",
        options: [],
        subItens: [],
        reference: "N",
      },
    ],
    input: "TEXT",
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
  const onReset = () => {
    Object.assign(form, {
      name: null,
      reference: "N",
      isHeader: false,
      serviceId: null,
      sectionId: null,
      options: [],
      subItens: [
        {
          isHeader: false,
          name: null,
          input: "TEXT",
          options: [],
          subItens: [],
          reference: "N",
        },
      ],
      input: "TEXT",
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

  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const index = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("exams", {
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

  const create = async (payload) => {
    loadings.loadingCreate = true;
    console.log(form);
    const response = await useFetchApi().store("exams", payload);
    loadings.loadingCreate = false;
    if (response.success) {
      // index();
      onReset();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("exams", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("exams/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("exams/" + id, form);
    loadings.loadingCreate = false;
    if (response.success) {
      await show(id);
      // onReset();
      index();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("exams", id);
    const result = response.data;
    Object.assign(form, response.data);
    form.serviceId = result.service;
    form.sectionId = result.section;
    Object.assign(currentExam, response.data.data);
    loadings.loadingOne = false;
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
    currentExam,
    onReset,
  };
});
