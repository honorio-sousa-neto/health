import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");
import { showNotify } from "src/utils/notify";
import { useRoute } from "vue-router";
export const useVitalStore = defineStore("vital", () => {
  const route = useRoute();

  let data = reactive({
    data: [],
  });

  let form = reactive({
    id: null,
    temperature: null,
    heartRate: null,
    bloodPressure: null,
    breathingRate: null,
    oxygenSaturation: null,
    attendingId: route.params.id,
  });

  let currentDemographic = reactive({
    id: null,
    temperature: null,
    heartRate: null,
    bloodPressure: null,
    breathingRate: null,
    oxygenSaturation: null,
    attendingId: route.params.id,
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

  const erase = ref(0);
  const onReset = () => {
    Object.assign(form, {
      id: form.id,
      temperature: null,
      heartRate: null,
      bloodPressure: null,
      breathingRate: null,
      oxygenSaturation: null,
      attendingId: route.params.id,
    });
    Object.assign(currentDemographic, {
      id: form.id,
      temperature: null,
      heartRate: null,
      bloodPressure: null,
      breathingRate: null,
      oxygenSaturation: null,
      attendingId: route.params.id,
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
    const response = await useFetchApi().index("vitals", {
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
      "vitals/index-by-status/" + pagination.status,
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
    const { id, ...rest } = form;
    const response = id
      ? await useFetchApi().update("vitals/" + id, rest)
      : await useFetchApi().store("vitals", rest);
    loadings.loadingCreate = false;
    if (response.success) {
      showNotify(response.message, response.success);
      onReset();
      Object.assign(form, response.data.data);
    }
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("vitals", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete("vitals/soft-delete", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("vitals/" + id, form);
    loadings.loadingCreate = false;
    if (response) index();
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("vitals", id);
    Object.assign(form, response.data.data);
    loadings.loadingOne = false;
    return response;
  };
  const filter = async (search) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("vitals/filter/search", {
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
    currentDemographic,
    erase,
    leftDrawerOpen,
    onReset,
  };
});
