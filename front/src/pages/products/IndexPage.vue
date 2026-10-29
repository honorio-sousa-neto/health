<template>
  <ListaPagina
    v-model:seleccionados="seleccionados"
    titulo="Produtos"
    :contexto="contexto"
    apoio="Fármacos e artigos vendáveis. O PVP é o preço de venda; o custo vem das compras."
    :colunas="colunas"
    :linhas="data"
    :carregando="loading"
    :paginacao="pagination"
    :filtrado="filtrado"
    texto-vazio="Ainda não há produtos registados."
    seleccionavel
    @recarregar="fetchAll"
  >
    <template #accoes-seleccao="{ linhas }">
      <DeleteMany :ids="linhas.map((l) => l.id)" path="products" @success="fetchAll" />
    </template>

    <template #accoes>
      <select v-model="area" class="lp-filtro" aria-label="Filtrar por área" @change="aoMudarArea">
        <option value="">Todas as áreas</option>
        <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>

      <select
        v-if="subcategorias.length"
        v-model="pagination.category"
        class="lp-filtro"
        aria-label="Filtrar por subcategoria"
        @change="fetchAll"
      >
        <option :value="area">Todas as subcategorias</option>
        <option v-for="s in subcategorias" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>

      <NewRegist to="adicionar-produto" rotulo="Novo produto" />
    </template>

    <template #linha-accoes="{ linha }">
      <EditButton modo="item" @click="$router.push({ name: 'editar-produto', params: { id: linha.id } })" />
      <DeleteButton modo="item" :id="linha.id" path="products" @success="fetchAll" />
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * Os produtos, com os filtros de área e subcategoria que a página já tinha.
 *
 * A paginação era feita à mão — dois botões e um contador "1–15 de 42" — e
 * ficava por baixo da tabela, longe da pesquisa que estava em cima. Passa ao
 * rodapé da `ListaPagina`, com o resto.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "src/boot/axios";
import DeleteButton from "src/components/common/buttons/DeleteButton.vue";
import DeleteMany from "src/components/common/buttons/DeleteMany.vue";
import EditButton from "src/components/common/buttons/EditButton.vue";
import NewRegist from "src/components/common/buttons/NewRegist.vue";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { kwanza } from "src/utils/format";

const loading = ref(false);
const data = reactive([]);
const seleccionados = ref([]);

const pagination = reactive({
  page: 1, perPage: 15, total: 0, totalPages: 1, search: "", category: "",
});

const areas = ref([]);
const subcategorias = ref([]);
const area = ref("");

const filtrado = computed(() => !!pagination.search || !!pagination.category);

const contexto = computed(() => {
  const partes = [];
  if (pagination.search) partes.push(`a filtrar por \u201c${pagination.search}\u201d`);
  const nome = areas.value.find((a) => a.id === area.value)?.name;
  if (nome) partes.push(`em ${nome}`);
  return partes.join(" \u00b7 ");
});

const colunas = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  {
    name: "area", label: "Área",
    field: (linha) => linha.category?.category?.name ?? null, align: "left",
  },
  {
    name: "categoria", label: "Subcategoria",
    field: (linha) => linha.category?.name ?? null, align: "left",
  },
  {
    name: "unit_price", label: "PVP", field: "unit_price",
    numerico: true, ordenavel: true,
    format: (v) => (v == null ? "\u2014" : kwanza(v)),
  },
  { name: "actions", label: "Acções", align: "right" },
];

const fetchAll = async () => {
  loading.value = true;
  try {
    const { data: res } = await api.get("products", {
      params: {
        page: pagination.page,
        perPage: pagination.perPage,
        search: pagination.search || undefined,
        category: pagination.category || undefined,
      },
    });
    data.splice(0, data.length, ...(res.data ?? []));
    Object.assign(pagination, {
      total: res.meta?.total ?? 0,
      totalPages: res.meta?.totalPages ?? 1,
    });
  } finally {
    loading.value = false;
  }
};

const carregarAreas = async () => {
  const { data: res } = await api.get("categories", { params: { perPage: 100, page: 1 } });
  areas.value = (res.data ?? []).filter((c) => !c.categoryId);
};

const aoMudarArea = async () => {
  subcategorias.value = [];
  pagination.category = area.value;
  pagination.page = 1;
  if (area.value) {
    const { data: res } = await api.get(`categories/${area.value}`);
    subcategorias.value = res.data?.subCategories ?? [];
  }
  fetchAll();
};

onMounted(() => {
  carregarAreas();
  fetchAll();
});
</script>
