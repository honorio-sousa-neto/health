import { reactive, ref } from "vue";
import { api } from "src/boot/axios";
import { useRoute } from "vue-router";
export const useFetchData = () => {
  const loading = ref(false);
  const route = useRoute();
  const query = reactive({
    status: route?.query?.status ?? "POR_PAGAR",
    perPage: route?.query?.perPage ?? 10,
    total: 1,
    totalPages: 1,
    search: route?.query?.search ?? null,
    page: route?.query?.page ?? 1,
  });
  const fetchData = async (search) => {
    loading.value = true;
    const { data } = await api.get(search, { params: { ...query } });
    loading.value = false;
    if (data.meta) {
      query.page = data.meta.page;
      query.perPage = data.meta.perPage;
      query.search = data.meta.search;
      query.totalPages = data.meta.totalPages;
    }
    return data.data;
  };

  return {
    fetchData,
    query,
    loading,
  };
};
