import { ref } from "vue";
import { showNotify } from "src/utils/notify";
import { api } from "src/boot/axios";
import { useRoute } from "vue-router";
export const useCreateUpdate = (basePath) => {
  const loading = ref(false);
  const route = useRoute();
  const create = async (form) => {
    try {
      loading.value = true;
      const {
        data: { message, success, data: response },
      } = await api.post(`${basePath}`, form);
      showNotify(message, success);
      loading.value = false;
      return response;
    } catch (error) {
      loading.value = false;
    }
  };

  const update = async (form, id) => {
    try {
      loading.value = true;
      const {
        data: { message, success, data: response },
      } = await api.patch(`${basePath}/${id}`, form);
      showNotify(message, success);
      loading.value = false;
      return response;
    } catch (error) {
      loading.value = false;
    }
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

  const fetch = async () => {
    loading.value = true;
    const { data } = await api.get(basePath);
    loading.value = false;
    return data.data[0];
  };

  const softDelete = async (id) => {
    loading.value = true;
    const {
      data: { message, success, data: response },
    } = await api.patch(`${basePath}/soft-delete/${id}`);
    showNotify(message, success);
    loading.value = false;
    return success;
  };

  const destroy = async (id) => {
    loading.value = true;
    const {
      data: { message, success },
    } = await api.delete(`${basePath}/${id}`);
    showNotify(message, success);
    loading.value = false;
    return success;
  };

  return { fetch, create, update, fetchOne, softDelete, destroy, loading };
};
