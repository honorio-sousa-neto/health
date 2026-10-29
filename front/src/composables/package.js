import { onMounted, ref, watch } from "vue";
import { useServiceStore } from "src/stores/service";
import { useRoute } from "vue-router";
import { useInternStore } from "src/stores/intern";
export const usePackage = (area) => {
  const store = useServiceStore();
  const route = useRoute();
  const storeIntern = useInternStore();
  const options = ref([]);
  const selectAll = ref(false);
  const selected = ref([]);

  const fetchData = async (category) => {
    options.value = await store.indexAll(category);
    selected.value = route.params.id
      ? storeIntern.form.services.filter((item) =>
          options.value.find((element) => element.id == item.id)
        )
      : [];
  };

  // const selectAllFunction = async (newest, event) => {
  //   if (newest) options.value = await fetchData(area);
  // };

  // onMounted(async () => {
  //   options.value = await fetchData(area);
  // });

  return {
    fetchData,
    selectAll,
    options,
    // selectAllFunction,
    selected,
  };
};
