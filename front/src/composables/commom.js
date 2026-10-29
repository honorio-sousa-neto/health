import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
export const useCommom = (basePath, filters = {}) => {
  const loading = ref(false);
  const route = useRoute();
  const pagination = reactive({
    page: route?.query?.page || 1,
    perPage: route?.query?.perPage || 15,
    search: route?.query?.search || "",
    category: route?.query?.category,
    month:
      route?.query?.month ||
      `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    totalPages: 1,
    total: 10,
    type: null,
  });

  let data = reactive([]);
  const fetchAll = async () => {
    loading.value = true;
    const { total, totalPages, ...rest } = pagination;
    const {
      data: { message, success, data: response, meta },
    } = await api.get(basePath, { params: { ...rest, ...filters } });
    loading.value = false;
    data.length = 0;
    Object.assign(data, response);
    Object.assign(pagination, { ...meta });
    return response;
  };

  const fetchOne = async (id) => {
    loading.value = true;
    const {
      data: { message, success, data: response },
    } = await api.get(`${basePath}/${id}`);
    showNotify(message, success);
    loading.value = false;
    return response;
  };

  const create = async (form) => {
    loading.value = true;
    const {
      data: { message, success, data: response },
    } = await api.post(`${basePath}`, form);
    showNotify(message, success);
    loading.value = false;
    return response;
  };

  const update = async (form, id) => {
    loading.value = true;
    const {
      data: { message, success, data: response },
    } = await api.patch(`${basePath}/${id}`, form);
    showNotify(message, success);
    loading.value = false;
    return response;
  };

  onMounted(() => {
    fetchAll();
  });

  return {
    fetchAll,
    fetchOne,
    create,
    update,
    data,
    loading,
    pagination,
  };
};
