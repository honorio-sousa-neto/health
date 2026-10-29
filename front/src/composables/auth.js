import { api } from "src/boot/axios";
import { reactive, ref } from "vue";
import { showNotify } from "src/utils/notify";
import { useRouter } from "vue-router";
import { SessionStorage } from "quasar";
export const useAuth = () => {
  const router = useRouter();
  let form = reactive({
    username: null,
    password: null,
  });
  const loading = ref(false);
  const login = async () => {
    try {
      loading.value = true;
      const {
        data: { message, success, data: response },
      } = await api.post("auth/login", form);

      showNotify(message, success);
      if (success) {
        SessionStorage.set("alfavida_user", response);
        api.defaults.headers["Authorization"] = "Bearer " + response.token;
        showNotify(`\nOlá, ${response.name}. Seja bem-vindo.`, success);
        router.push({ name: "welcome" });
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
    }
  };
  return { form, login, loading };
};
