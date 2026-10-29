<template>
  <ListaPagina
    titulo="Lotes em stock"
    :contexto="contexto"
    :apoio="apoio"
    :colunas="colunas"
    :linhas="linhas"
    :carregando="carregando"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search || !!estado"
    texto-vazio="Nenhum lote em stock. Os lotes são criados ao registar compras."
    @recarregar="fetchAll"
  >
    <template #accoes>
      <select v-model="estado" class="lp-filtro" aria-label="Filtrar por validade" @change="aoFiltrar">
        <option v-for="o in ESTADOS" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * Os lotes em stock, com a validade como estado da linha.
 *
 * As duas pastilhas do topo — "N expirados", "N a expirar" — eram cápsulas
 * vermelha e laranja, sempre presentes mesmo a zero. A contagem passa à
 * linha de apoio, e a cor fica onde diz alguma coisa: no estado de cada
 * lote, em ponto e rótulo.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "src/boot/axios";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { quantidade } from "src/utils/format";

const ESTADOS = [
  { label: "Todas as validades", value: "" },
  { label: "Válidos", value: "ok" },
  { label: "A expirar", value: "expiring" },
  { label: "Expirados", value: "expired" },
];

const carregando = ref(false);
const linhas = ref([]);
const estado = ref("");
const contagens = reactive({ expired: 0, expiring: 0 });

const paginacao = reactive({ page: 1, perPage: 15, total: 0, totalPages: 1, search: "" });

const contexto = computed(() =>
  paginacao.search ? `a filtrar por \u201c${paginacao.search}\u201d` : "",
);

const apoio = computed(() => {
  const partes = ["Criados ao registar compras."];
  if (contagens.expired) partes.push(`${contagens.expired} expirados.`);
  if (contagens.expiring) partes.push(`${contagens.expiring} a expirar nos próximos 30 dias.`);
  return partes.join(" ");
});

/** Válido, a expirar dentro de 30 dias, ou expirado. */
const situacao = (validade) => {
  if (!validade) return "nenhuma";
  const d = new Date(validade);
  const agora = new Date();
  const em30 = new Date();
  em30.setDate(em30.getDate() + 30);
  if (d < agora) return "expirado";
  if (d <= em30) return "a-expirar";
  return "valido";
};

const ROTULO = {
  nenhuma: "Sem validade",
  expirado: "Expirado",
  "a-expirar": "A expirar",
  valido: "Válido",
};

const TOM = {
  nenhuma: "neutro",
  expirado: "erro",
  "a-expirar": "aviso",
  valido: "ok",
};

const colunas = [
  {
    name: "product", label: "Produto",
    field: (linha) => linha.product?.name ?? null, align: "left", ordenavel: true,
  },
  { name: "batch", label: "Lote", field: "batch", align: "left" },
  {
    name: "quantity", label: "Quantidade", field: "quantity",
    numerico: true, ordenavel: true,
    format: (v, linha) => `${quantidade(v)} ${linha.product?.unit?.abbreviation ?? "un"}`,
  },
  {
    name: "expiration", label: "Validade", field: "expiration", align: "left", ordenavel: true,
    format: (v) =>
      v
        ? new Date(v).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "\u2014",
  },
  {
    name: "estado", label: "Estado", field: "expiration", align: "left",
    estado: true,
    format: (v) => ROTULO[situacao(v)],
    tom: (v) => TOM[situacao(v)],
  },
];

const fetchAll = async () => {
  carregando.value = true;
  try {
    const { data } = await api.get("inventories", {
      params: {
        search: paginacao.search || undefined,
        status: estado.value || undefined,
        page: paginacao.page,
        perPage: paginacao.perPage,
      },
    });
    linhas.value = data.data ?? [];
    Object.assign(paginacao, {
      total: data.meta?.total ?? 0,
      totalPages: data.meta?.totalPages ?? 1,
    });
  } finally {
    carregando.value = false;
  }
};

const carregarContagens = async () => {
  const [expirados, aExpirar] = await Promise.all([
    api.get("inventories", { params: { status: "expired", perPage: 1 } }),
    api.get("inventories", { params: { status: "expiring", perPage: 1 } }),
  ]);
  contagens.expired = expirados.data.meta?.total ?? 0;
  contagens.expiring = aExpirar.data.meta?.total ?? 0;
};

const aoFiltrar = () => {
  paginacao.page = 1;
  fetchAll();
};

onMounted(() => {
  fetchAll();
  carregarContagens();
});
</script>
