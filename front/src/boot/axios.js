import axios from "axios";
import { Notify, SessionStorage } from "quasar";
import { defineBoot as boot } from "#q-app";
import { useLigacao } from "src/composables/ligacao";
import { showNetworkNotify, clearNetworkNotify } from "src/utils/notify";
// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: "https://backend-wo0k.onrender.com/api" });
// Sem timeout, um pedido contra um servidor inalcançável fica pendurado
// minutos a fio e o ecrã fica em "a carregar" para sempre. 45s é folgado o
// bastante para os relatórios pesados (ExcelJS/PDFMake) e curto o bastante
// para a queda de rede ser dita a tempo.
const api = axios.create({ baseURL: import.meta.env.APP_API_URL || "http://localhost:8020/api", timeout: 45000 });
// const api = axios.create({ baseURL: "http://162.35.160.238:3000/api" });

// const api = axios.create({
//   baseURL: "https://alfavidabackend.up.railway.app/api",
// });
// const api = axios.create({
//   baseURL: "https://backend-x4ox.onrender.com/api",
// });

// const api = axios.create({
//   baseURL: "https://alfavida-backend.onrender.com/api",
// });

// const api = axios.create({
//   baseURL: "https://backend-wo0k.onrender.com/api",
// });

api.interceptors.request.use((config) => {
  if (config.method === "post" && /^\/?invoices\/?$/.test(config.url)) {
    const key = config.data?.__idempotencyKey;
    if (key) config.headers["Idempotency-Key"] = key;
  }
  const token = SessionStorage.getItem("alfavida_user")?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default boot(({ app, router }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  try {
    const { marcarSucesso, marcarFalha } = useLigacao();

    api.interceptors.response.use(
      (response) => {
        // Uma resposta que chega é a única prova de que o servidor responde.
        marcarSucesso();
        clearNetworkNotify();
        return response;
      },
      (error) => {
        // ── Sem resposta: o pedido não chegou ao servidor ──────────────
        // Rede caída, servidor em baixo ou timeout. Não é um erro da
        // operação — é a condição de rede que o PRODUCT.md dá como real.
        if (!error.response) {
          marcarFalha();
          const expirou = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
          showNetworkNotify(
            expirou
              ? "O servidor demorou demasiado a responder. A tentar novamente…"
              : "Sem ligação ao servidor. Os dados no ecrã podem estar desactualizados.",
          );
          return Promise.reject(error);
        }

        // ── Houve resposta: o servidor está vivo ───────────────────────
        marcarSucesso();
        clearNetworkNotify();

        // Antes era `error.toJSON().message.includes("401")`, que depende da
        // frase que o Axios monta. O estado da resposta é o próprio facto.
        if (error.response.status === 401) {
          SessionStorage.remove("alfavida_user");
          delete api.defaults.headers["Authorization"];
          router.push({ name: "login" });
          Notify.create({
            position: "top-right",
            color: "red",
            message: "Sessão expirada. Por favor, faça o login novamente",
          });
        }

        return Promise.reject(error);
      },
    );
  } catch (error) {}
});

export { api };
