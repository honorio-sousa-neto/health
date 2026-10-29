<template>
  <ListaPagina
    titulo="Histórico da farmácia"
    :contexto="contexto"
    apoio="Prescrições já dispensadas e pagas."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :erro="erro"
    :paginacao="pagination"
    :filtrado="!!(filtros.de || filtros.ate)"
    texto-vazio="Ainda não foi dispensada nenhuma prescrição."
    @recarregar="buscar()"
  >
    <template #accoes>
      <label class="lp-filtro">
        <span>De</span>
        <input v-model="filtros.de" type="date" @change="buscar(1)" />
      </label>
      <label class="lp-filtro">
        <span>Até</span>
        <input v-model="filtros.ate" type="date" @change="buscar(1)" />
      </label>
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * Primeira das tabelas construídas à mão a passar ao shell. Saem ~50 linhas
 * de CSS próprio — cabeçalho, grelha, estados e paginação eram todos locais,
 * e cada um divergia um pouco do equivalente das outras listas.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "src/boot/axios";
import ListaPagina from "src/components/common/table/ListaPagina.vue";

const loading = ref(false);
const erro = ref(false);
const data = reactive([]);
const filtros = reactive({ de: "", ate: "" });
const pagination = reactive({ page: 1, perPage: 20, total: 0, totalPages: 1 });

const fmtData = (d) =>
  d
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(
        new Date(d),
      )
    : "—";

const colunas = [
  {
    name: "doente",
    label: "Doente",
    field: (l) => l.consultation?.screening?.customer?.name,
    align: "left",
  },
  { name: "medico", label: "Médico", field: (l) => l.doctor?.name, align: "left" },
  { name: "itens", label: "Itens", field: (l) => l.items?.length ?? 0, numerico: true },
  { name: "data", label: "Dispensada", field: "createdAt", format: fmtData, align: "left" },
];

const buscar = async (page = pagination.page) => {
  loading.value = true;
  erro.value = false;
  pagination.page = page;
  try {
    const { data: res } = await api.get("prescriptions/historico", {
      params: {
        page,
        perPage: pagination.perPage,
        from: filtros.de || undefined,
        to: filtros.ate || undefined,
        paid: true,
      },
    });
    data.splice(0, data.length, ...(res.data ?? []));
    Object.assign(pagination, {
      total: res.meta?.total ?? 0,
      totalPages: res.meta?.totalPages ?? 1,
    });
  } catch (e) {
    // Antes o `catch` estava vazio e a falha chegava ao ecrã como lista vazia:
    // a página afirmava que não havia registos quando não sabia.
    erro.value = true;
    data.splice(0, data.length);
  } finally {
    loading.value = false;
  }
};

const contexto = computed(() => {
  if (filtros.de && filtros.ate) return `de ${fmtData(filtros.de)} a ${fmtData(filtros.ate)}`;
  if (filtros.de) return `desde ${fmtData(filtros.de)}`;
  if (filtros.ate) return `até ${fmtData(filtros.ate)}`;
  return "";
});

onMounted(() => buscar());
</script>
