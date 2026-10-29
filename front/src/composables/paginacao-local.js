import { computed, reactive, watch } from "vue";

/**
 * Paginação e pesquisa no cliente, para listas que já vêm inteiras.
 *
 * Algumas listagens não são paginadas no servidor — os exames de uma secção,
 * os clientes de uma seguradora, os saldos do inventário. Sem isto, migrá-las
 * para a `ListaPagina` obrigava a escolher entre não ter rodapé nem campo de
 * pesquisa, ou inventar um objecto de paginação em cada página.
 *
 * Devolve um objecto com a mesma forma que o `meta` do servidor, para a
 * `ListaPagina` não ter de saber a diferença.
 *
 * @param fonte    ref/computed com o array completo
 * @param campos   campos onde a pesquisa procura; por omissão, `name`
 */
export const usePaginacaoLocal = (fonte, campos = ["name"]) => {
  const paginacao = reactive({
    page: 1,
    perPage: 15,
    total: 0,
    totalPages: 1,
    search: "",
  });

  const semAcentos = (v) =>
    String(v ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();

  const valorDe = (linha, campo) =>
    typeof campo === "function" ? campo(linha) : linha?.[campo];

  const filtradas = computed(() => {
    const todas = fonte.value ?? [];
    const q = semAcentos(paginacao.search).trim();
    if (!q) return todas;
    return todas.filter((linha) =>
      campos.some((campo) => semAcentos(valorDe(linha, campo)).includes(q)),
    );
  });

  const linhas = computed(() => {
    const inicio = (paginacao.page - 1) * paginacao.perPage;
    return filtradas.value.slice(inicio, inicio + paginacao.perPage);
  });

  // O total e o número de páginas seguem o que está filtrado, não o que foi
  // carregado — senão o rodapé anunciaria registos que a lista não mostra.
  watch(
    filtradas,
    (linhas) => {
      paginacao.total = linhas.length;
      paginacao.totalPages = Math.max(1, Math.ceil(linhas.length / paginacao.perPage));
      if (paginacao.page > paginacao.totalPages) paginacao.page = paginacao.totalPages;
    },
    { immediate: true },
  );

  watch(
    () => paginacao.perPage,
    () => {
      paginacao.totalPages = Math.max(
        1,
        Math.ceil(filtradas.value.length / paginacao.perPage),
      );
      paginacao.page = 1;
    },
  );

  return { paginacao, linhas, filtradas };
};
