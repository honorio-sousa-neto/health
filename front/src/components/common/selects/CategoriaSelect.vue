<template>
  <q-select
    v-model="categoria"
    class="fi"
    borderless
    :label="obrigatorio ? 'Categoria *' : 'Categoria'"
    :options="opcoes"
    option-value="id"
    option-label="name"
    map-options
    emit-value
    use-input
    fill-input
    hide-selected
    input-debounce="200"
    placeholder="Procurar categoria…"
    :loading="acarregar"
    popup-content-class="fi-popup"
    :rules="obrigatorio ? [required] : []"
    lazy-rules
    @filter="filtrar"
  />
</template>

<script setup>
/**
 * A categoria de um artigo — o nível de topo, a que a aplicação chama "área"
 * nas listagens: Farmácia, Laboratório, Radiologia.
 *
 * `categories` é uma árvore auto-referenciada: as de topo não têm
 * `categoryId`, as filhas são subcategorias (Comprimidos, Xarope). O campo
 * que existia nas fichas escolhia a filha e mostrava a mãe como texto de
 * apoio, por isso dizia "Categoria" e guardava uma subcategoria. Este escolhe
 * a categoria, que é o que o rótulo sempre prometeu.
 */
import { onMounted, ref, watch } from "vue";
import { api } from "src/boot/axios";
import { required } from "src/utils/validation";

defineProps({ obrigatorio: { type: Boolean, default: false } });

const categoria = defineModel("categoria");

const todas = ref([]);
const opcoes = ref([]);
const acarregar = ref(false);

/**
 * Os registos anteriores guardam uma subcategoria neste campo, porque era isso
 * que o campo antigo escolhia. Sem resolver para a mãe, o valor não casa com
 * nenhuma opção e o campo mostra o UUID em bruto.
 *
 * Tem de ser num `watch` e não só no `onMounted`: a ficha carrega o registo de
 * forma assíncrona, e o valor chega depois de este componente já ter montado.
 */
const arvore = ref([]);
const resolver = () => {
  const guardada = categoria.value;
  if (!guardada || !arvore.value.length) return;
  if (todas.value.some((c) => c.id === guardada)) return;
  const filha = arvore.value.find((c) => c.id === guardada);
  if (filha?.categoryId) categoria.value = filha.categoryId;
};

watch(categoria, resolver);

const filtrar = (valor, update) => {
  update(() => {
    const q = (valor ?? "").trim().toLowerCase();
    opcoes.value = q
      ? todas.value.filter((c) => c.name.toLowerCase().includes(q))
      : todas.value;
  });
};

onMounted(async () => {
  acarregar.value = true;
  try {
    const { data: res } = await api.get("categories", { params: { perPage: 9999, page: 1 } });
    arvore.value = res.data ?? [];
    // Escolhe-se entre as de topo: as que não têm mãe.
    todas.value = arvore.value.filter((c) => !c.categoryId);
    opcoes.value = todas.value;

    resolver();
  } finally {
    acarregar.value = false;
  }
});
</script>
