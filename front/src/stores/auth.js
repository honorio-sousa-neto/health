import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";
import { SessionStorage } from "quasar";

export const useAuthStore = defineStore("auth", () => {
  let user = reactive({
    data: {},
  });

  let loading = ref(false);

  const create = async (payload) => {
    loading.value = true;
    const response = await useFetchApi().store("auth/login", payload);
    loading.value = false;
    SessionStorage.set("alfavida_user", response.data.data);
    Object.assign(user.data, response.data.data);
    showNotify(response.message, response.success);
    return response;
  };

  return {
    create,
    user,
    loadings,
  };
});
