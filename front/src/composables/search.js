import { ref } from "vue";
import { api } from "src/boot/axios";
export const useSearch = (basePath) => {
  const loading = ref(false);

  const filter = async (search) => {
    loading.value = true;
    const {
      data: { data: response },
    } = await api.get(basePath, { params: { search } });
    loading.value = false;
    return response;
  };

  return {
    filter,
  };
};
