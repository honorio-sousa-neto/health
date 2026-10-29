import { api } from "src/boot/axios";

/**
 * Leitura segura do erro do Axios.
 *
 * Antes, `store`, `update` e `softDelete` liam `error.response.data.message`
 * directamente. Quando não há resposta — rede caída, servidor em baixo,
 * timeout — `error.response` é `undefined` e a leitura rebentava DENTRO do
 * catch: a promessa era rejeitada, o `loadings.loadingCreate = false` da
 * linha seguinte nunca corria, e o botão de gravar ficava a girar para
 * sempre. Era precisamente o cenário que o PRODUCT.md dá como real.
 */
const lerErro = (error) => {
  const semResposta = !error?.response;
  return {
    success: false,
    data: null,
    // Sem resposta não há mensagem do servidor para mostrar; a do Axios é
    // inglês técnico ("Network Error"), que não serve a ninguém ao balcão.
    message: semResposta
      ? "Sem ligação ao servidor. A operação não foi concluída."
      : error?.response?.data?.message ?? error?.message ?? "Ocorreu um erro",
    erro: true,
    rede: semResposta,
  };
};

export function useFetchApi() {
  async function index(url, params) {
    try {
      const { data } = await api.get(url, params);
      return {
        success: data.success,
        data: data.body || data.data || data,
        message: data.message,
        meta: data.meta,
        erro: false,
        rede: false,
      };
    } catch (error) {
      return lerErro(error);
    }
  }

  async function store(url, payload) {
    try {
      const { data } = await api.post(url, payload);
      return {
        success: data.success,
        data: data.body || data.data,
        message: data.message,
        erro: false,
        rede: false,
      };
    } catch (error) {
      return lerErro(error);
    }
  }

  async function update(url, payload) {
    try {
      const { data } = await api.patch(url, payload);
      return {
        success: data.success,
        data: data.body,
        message: data.message,
        erro: false,
        rede: false,
      };
    } catch (error) {
      return lerErro(error);
    }
  }

  async function softDelete(url, id) {
    try {
      const { data } = await api.patch(url + "/" + id);
      return {
        success: data.success,
        data: data.body,
        message: data.message,
        erro: false,
        rede: false,
      };
    } catch (error) {
      return lerErro(error);
    }
  }

  async function destroy(url, id) {
    try {
      const { data } = await api.delete(`${url}/${id}`);
      return {
        success: data.success,
        data: data.body,
        message: data.message,
        erro: false,
        rede: false,
      };
    } catch (error) {
      // Era `success: true` no catch — uma eliminação que falhava era
      // comunicada como feita. Num sistema onde o que se apaga é um registo
      // clínico ou um movimento de stock, isso não é um detalhe.
      return lerErro(error);
    }
  }

  async function show(url, id) {
    try {
      const { data } = await api.get(`${url}/${id}`);
      return {
        success: data.success,
        data: data.body || data.data,
        message: data.message,
        erro: false,
        rede: false,
      };
    } catch (error) {
      return lerErro(error);
    }
  }

  return {
    index,
    store,
    update,
    destroy,
    show,
    softDelete,
  };
}
