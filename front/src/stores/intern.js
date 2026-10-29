import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { useRoute } from "vue-router";

export const useInternStore = defineStore("intern", () => {
  const route = useRoute();

  let data = reactive([]);
  let form = reactive({
    name: null,
    amount: null,
    type: "single",
    lab: false,
    rx: false,
    enf: false,
    far: false,
    esp: false,
    internTax: null,
    aggregations: {
      first: null,
      second: null,
      third: null,
      afterThird: null,
    },
    services: [],
  });

  let currentExam = reactive({
    name: null,
    amount: null,
    type: "single",
    lab: false,
    rx: false,
    enf: false,
    far: false,
    esp: false,
    internTax: null,
    aggregations: {
      first: null,
      second: null,
      third: null,
      afterThird: null,
    },
    services: [],
  });

  let pagination = reactive({
    meta: {
      page: route.query.page || 1,
      perPage: route.query.perPage || 15,
      total: 15,
      totalPages: 1,
      search: route.query.search || "",
      orderBy: {
        createdAt: "desc",
      },
    },
  });
  const onReset = () => {
    Object.assign(form, {
      name: null,
      amount: null,
      type: "single",
      lab: false,
      rx: false,
      enf: false,
      far: false,
      esp: false,
      internTax: null,
      aggregations: {
        first: null,
        second: null,
        third: null,
        afterThird: null,
      },
      services: [],
    });
  };

  let loading = ref(false);

  const index = async () => {
    loading.value = true;
    const response = await useFetchApi().index("intern-insurances", {
      params: {
        perPage: pagination.meta.perPage,
        page: route.query.search ? 1 : pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
      },
    });

    Object.assign(pagination.meta, response.data.meta);
    data.length = 0;
    Object.assign(data, response.data.data);
    loading.value = false;
  };

  const create = async (payload) => {
    loading.value = true;
    const response = await useFetchApi().store("intern-insurances", payload);
    loading.value = false;
    if (response.success) {
      await index();
      onReset();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const destroy = async (id) => {
    loading.value = true;
    const response = await useFetchApi().destroy("intern-insurances", id);
    loading.value = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loading.value = true;
    const response = await useFetchApi().softDelete(
      "intern-insurances/soft-delete",
      id
    );
    loading.value = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    const response = await useFetchApi().update(
      "intern-insurances/" + id,
      form
    );
    loading.value = false;
    if (response.success) {
      await show(id);
      onReset();
      index();
    }
    showNotify(response.message, response.success);
    return response;
  };

  const show = async (id) => {
    loading.value = true;
    const response = await useFetchApi().show("intern-insurances", id);
    Object.assign(form, response.data.data);
    Object.assign(currentExam, response.data.data);
    loading.value = false;
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
    loading,
    softDelete,
    form,
    currentExam,
    onReset,
  };
});
