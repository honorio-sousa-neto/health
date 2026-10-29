import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "src/boot/axios";
import { Notify } from "quasar";

export const useUnitOfMeasureStore = defineStore("unit-of-measure", () => {
  const units = ref([]);
  const loading = ref(false);

  const index = async (search = "") => {
    loading.value = true;
    try {
      const { data } = await api.get("units-of-measure", { params: { search } });
      units.value = data.data ?? [];
    } finally {
      loading.value = false;
    }
  };

  const create = async (payload) => {
    const { data } = await api.post("units-of-measure", payload);
    if (data.success) {
      Notify.create({ message: "Unidade criada", color: "green-8" });
      await index();
    }
    return data;
  };

  const update = async (id, payload) => {
    const { data } = await api.patch(`units-of-measure/${id}`, payload);
    if (data.success) {
      Notify.create({ message: "Unidade actualizada", color: "green-8" });
      await index();
    }
    return data;
  };

  const destroy = async (id) => {
    const { data } = await api.delete(`units-of-measure/${id}`);
    if (data.success) {
      Notify.create({ message: "Unidade removida", color: "green-8" });
      await index();
    }
    return data;
  };

  return { units, loading, index, create, update, destroy };
});
