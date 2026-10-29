import { onMounted, reactive, ref } from "vue";
import { api } from "src/boot/axios";
import { useRoute } from "vue-router";
export const useFlow = (basePath) => {
  const loading = ref(false);
  const loadingTable = ref(false);
  const rows = ref([]);
  const metrics = reactive({
    entry: null,
    out: null,
    balance: null,
  });
  const route = useRoute();
  const query = reactive({
    destination: "Caixa",
    page: route.query.page || 1,
    perPage: route.query.perPage || 15,
    totalPages: 1,
    total: 20,
  });

  const totalData = async (destination) => {
    loading.value = true;
    const {
      data: { data: response },
    } = await api.get(
      `${basePath}/metrics/${destination ?? query.destination}`
    );
    loading.value = false;
    Object.assign(metrics, response);
    return response;
  };

  const tableData = async (dest) => {
    loadingTable.value = true;
    const { destination, ...rest } = query;
    const { data } = await api.get(basePath, {
      params: { destination: dest ?? destination, ...rest },
    });
    loadingTable.value = false;
    rows.value = data.data;
    Object.assign(query, data.meta);
    return data.data;
  };

  const loadAll = async (destination) => {
    await totalData(destination);
    await tableData(destination);
  };

  onMounted(() => {
    loadAll();
  });

  return {
    query,
    rows,
    totalData,
    tableData,
    metrics,
    loadAll,
  };
};
