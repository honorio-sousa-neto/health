import { onMounted, reactive, ref } from "vue";
import { api } from "src/boot/axios";
export const useAccount = ({ id, internId, startDate, endDate }) => {
  const loading = ref(false);
  const state = reactive({
    data: [],
    realCosts: [],
    totalRealCost: 0,
  });

  const fetchAll = async () => {
    loading.value = true;

    const {
      data: { message, success, data: response, meta },
    } = await api.get(`customers/accounts/${id}`, {
      params: {
        startDate,
        endDate,
        customerId: id,
        internId: internId,
      },
    });
    loading.value = false;
    state.data.splice(0, state.data.length, ...response.items);
    state.realCosts.splice(0, state.realCosts.length, ...response.realCosts);
    state.totalRealCost = response.totalRealCost;
  };

  onMounted(() => {
    fetchAll();
  });

  return {
    state,
  };
};
