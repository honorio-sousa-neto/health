import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { useRoute } from "vue-router";

export const useProductStore = defineStore("product", () => {
  const route = useRoute();
  let state = reactive({
    data: {
      name: null,
      subCategories: [],
    },
    prices: [],
  });

  let pagination = reactive({
    meta: {
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
      category: route.query.category,
    },
  });

  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const form = reactive({
    name: "",
    description: "",
    category: "",
    unit_price: "",
    discount: 0,
    type: "PRODUCT",
    materials: [],
    exemptionId: null,
  });

  const currentProduct = reactive({
    name: "",
    description: "",
    category: "",
    unit_price: "",
    discount: 0,
    type: "PRODUCT",
    materials: [],
    exemptionId: null,
  });

  const onReset = () => {
    Object.assign(form, {
      name: "",
      description: "",
      category: "",
      unit_price: "",
      discount: 0,
      type: "PRODUCT",
      materials: [],
      exemptionId: null,
    });

    Object.assign(pagination.meta, {
      page: 1,
      perPage: 15,
      total: 15,
      totalPages: 1,
      search: "",
    });
  };
  const index = async () => {
    loadings.loadingAll = true;

    const response = await useFetchApi().index("products", {
      params: {
        perPage: pagination.meta.perPage,
        page: pagination.meta.page,
        search: pagination.meta.search,
        category: pagination.meta.category,
        type: "PRODUCT",
      },
    });
    Object.assign(state.data, response.data);
    loadings.loadingAll = false;
  };
  const indexAll = async (category) => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("products/list-prices/index", {
      params: {
        perPage: 0,
        page: pagination.meta.page,
        search: pagination.meta.search,
        orderBy: pagination.meta.orderBy,
        category,
      },
    });

    loadings.loadingAll = false;
    state.prices.splice(0, state.prices.length, ...response.data);
    return response.data;
  };

  const create = async (form) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("products", form);
    loadings.loadingCreate = false;
    if (response.success) {
      showNotify(response.message, response.message);
      index();
      onReset();
    }
    return response;
  };

  const destroy = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().destroy("products", id);
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };
  const softDelete = async (id) => {
    loadings.loadingDelete = true;
    const response = await useFetchApi().softDelete(
      "products/soft-delete",
      id
    );
    loadings.loadingDelete = false;
    if (response) index();
    return response;
  };

  const update = async (form, id) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().update("products/" + id, form);
    loadings.loadingCreate = false;
    if (response.success) {
      showNotify(response.message, response.message);
      index();
      Object.assign(currentProduct, response.data);
    }
    return response;
  };

  const show = async (id) => {
    loadings.loadingOne = true;
    const response = await useFetchApi().show("products", id);
    Object.assign(form, response.data);
    form.discount = response.data.discount || 0;
    Object.assign(currentProduct, response.data);
    loadings.loadingOne = false;
    return response;
  };

  const filter = async (category, search) => {
    const response = await useFetchApi().index("products/filter/find", {
      params: {
        perPage: 50,
        page: 1,
        search: search,
        orderBy: pagination.meta.orderBy,
      },
    });

    return response.data;
  };
  const exemptions = reactive({
    data: [],
  });
  const indexExemptions = async () => {
    loadings.loadingAll = true;
    const response = await useFetchApi().index("exemptions");
    Object.assign(exemptions.data, response.data.data);
    loadings.loadingAll = false;
  };
  return {
    index,
    create,
    destroy,
    update,
    show,
    state,
    pagination,
    loadings,
    softDelete,
    filter,
    form,
    currentProduct,
    indexExemptions,
    exemptions,
    onReset,
    indexAll,
  };
});
