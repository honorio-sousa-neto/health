<template>
  <q-item v-if="modo === 'item'" v-close-popup clickable class="item-destrutivo" @click="abrir">
    <q-item-section avatar><q-icon name="las la-undo" size="18px" /></q-item-section>
    <q-item-section>Anular compra</q-item-section>
  </q-item>

  <q-btn
    v-else-if="modo === 'texto'"
    flat no-caps
    icon="las la-undo"
    label="Anular compra"
    class="btn-icone"
    @click="abrir"
  />

  <q-btn
    v-else
    flat round dense
    icon="las la-undo"
    class="btn-icone"
    aria-label="Anular compra"
    @click="abrir"
  >
    <q-tooltip>Anular compra</q-tooltip>
  </q-btn>

  <q-dialog v-model="aberto" persistent>
    <q-card class="anular-cartao">
      <q-card-section class="q-pb-none">
        <div class="anular-titulo">Anular esta compra?</div>
        <p class="anular-sub">
          Anular não é eliminar um registo. A compra fica marcada como anulada
          e as duas coisas que ela fez são desfeitas:
        </p>
      </q-card-section>

      <q-card-section v-if="carregando" class="anular-vazio">A carregar…</q-card-section>

      <q-card-section v-else-if="compra" class="q-pt-sm">
        <div class="anular-bloco">
          <div class="anular-bloco__rotulo">Volta ao caixa</div>
          <div class="anular-bloco__valor">{{ moeda(compra.amount) }}</div>
        </div>

        <div class="anular-bloco">
          <div class="anular-bloco__rotulo">Sai do stock</div>
          <ul class="anular-lista">
            <li v-for="(it, i) in compra.items ?? []" :key="i">
              <span class="anular-lista__qtd">{{ numero(baixa(it)) }}</span>
              {{ it.product?.unit?.abbreviation ?? "un" }}
              de {{ it.product?.name ?? "artigo removido" }}
            </li>
          </ul>
          <p v-if="!(compra.items ?? []).length" class="anular-vazio">
            Esta compra não tem linhas — não há stock a devolver.
          </p>
        </div>
      </q-card-section>

      <q-card-section v-else class="anular-vazio">
        Não foi possível ler a compra.
      </q-card-section>

      <q-card-section class="anular-accoes">
        <q-btn flat no-caps label="Voltar atrás" class="btn-icone" v-close-popup />
        <q-space />
        <q-btn
          flat no-caps
          label="Anular e registar de novo"
          class="btn-icone"
          :disable="!compra || loading"
          @click="onAnular(true)"
        />
        <q-btn
          unelevated no-caps
          label="Anular"
          class="btn-destrutiva"
          :loading
          :disable="!compra"
          @click="onAnular(false)"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
/**
 * Anular uma compra.
 *
 * Era o `DeleteButton` genérico: dizia "Eliminar registo — esta acção é
 * irreversível", e o que chamava do lado do servidor estornava o stock,
 * devolvia o dinheiro ao caixa e marcava a compra anulada. Quem clicava
 * julgava estar a arrumar uma lista.
 *
 * O diálogo passa a mostrar as duas consequências pelos números — quanto
 * volta ao caixa e que quantidades saem do stock, artigo a artigo — antes de
 * as fazer acontecer.
 */
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";
import { kwanza, quantidade } from "src/utils/format";
import { usePurchaseStore } from "src/stores/purchase";

const props = defineProps({
  id: { type: String, required: true },
  /** "botao" (ícone numa linha), "texto" (com rótulo) ou "item" (menu). */
  modo: { type: String, default: "botao" },
});
const emits = defineEmits(["anulada"]);

const store = usePurchaseStore();
const router = useRouter();

const aberto = ref(false);
const carregando = ref(false);
const loading = ref(false);
const compra = ref(null);

const moeda = kwanza;
const numero = quantidade;

/** O que sai do stock é o que entrou: quantidade × conteúdo da embalagem. */
const baixa = (it) => Number(it.quantity ?? 0) * Number(it.conversionFactor ?? 1);

const abrir = async () => {
  aberto.value = true;
  if (compra.value) return;
  carregando.value = true;
  try {
    const { data } = await api.get(`purchases/${props.id}`);
    compra.value = data?.data ?? null;
  } catch {
    compra.value = null;
  } finally {
    carregando.value = false;
  }
};

const onAnular = async (registarDeNovo) => {
  loading.value = true;
  const resposta = await store.anular(props.id);
  loading.value = false;
  if (!resposta?.success) return;
  aberto.value = false;
  emits("anulada");
  if (registarDeNovo) {
    router.push({ name: "nova-compra", query: { copiar: props.id } });
  }
};
</script>

<style scoped lang="scss">
.anular-cartao {
  width: 460px;
  max-width: 92vw;
  border-radius: var(--r-panel);
  background: var(--camada-flutuante);
}

.anular-titulo {
  font-size: var(--fs-title);
  font-weight: var(--fw-semi);
  line-height: var(--lh-tight);
  color: var(--text);
}

.anular-sub {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--text-2);
}

.anular-bloco + .anular-bloco { margin-top: var(--sp-4); }

.anular-bloco__rotulo {
  font-size: var(--fs-label);
  font-weight: var(--fw-forte);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 3px;
}

.anular-bloco__valor {
  font-size: var(--fs-title);
  font-weight: var(--fw-semi);
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.anular-lista {
  margin: 0;
  padding-left: var(--sp-5);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--text-2);
}

.anular-lista__qtd {
  font-weight: var(--fw-semi);
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.anular-vazio {
  font-size: var(--fs-body);
  color: var(--text-muted);
}

.anular-accoes {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding-top: var(--sp-4);
}
</style>
