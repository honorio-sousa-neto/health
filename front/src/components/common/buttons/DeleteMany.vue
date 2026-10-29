<template>
  <q-btn
    unelevated
    no-caps
    icon="las la-trash"
    :label="`Eliminar ${ids.length} ${ids.length === 1 ? 'registo' : 'registos'}`"
    class="btn-destrutiva"
    :disable="!ids.length || !path"
    @click="aberto = true"
  >
    <q-tooltip v-if="!path">
      Esta lista ainda não declara sobre que recurso a eliminação actua.
    </q-tooltip>
  </q-btn>

  <q-dialog v-model="aberto" persistent>
    <q-card class="dm-cartao">
      <q-card-section class="q-pb-none">
        <div class="dm-titulo">
          Eliminar {{ ids.length }} {{ ids.length === 1 ? "registo" : "registos" }}?
        </div>
        <p class="dm-sub">
          Os registos deixam de aparecer nas listas e nas pesquisas. O histórico
          que já os referencia não é apagado.
        </p>
      </q-card-section>

      <q-card-section v-if="falhados.length" class="q-pt-none">
        <div class="aviso">
          <q-icon class="aviso__icone" name="las la-exclamation-circle" size="18px" />
          <div class="aviso__corpo">
            <div class="aviso__titulo">
              {{ falhados.length }} não {{ falhados.length === 1 ? "foi eliminado" : "foram eliminados" }}
            </div>
            <div>Os restantes foram. Feche e tente de novo se quiser repetir.</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="dm-accoes">
        <q-btn flat no-caps label="Cancelar" class="btn-icone" v-close-popup />
        <q-btn
          unelevated no-caps
          :label="`Sim, eliminar ${ids.length}`"
          class="btn-destrutiva"
          :loading="aEliminar"
          @click="onEliminar"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
/**
 * Eliminação em massa.
 *
 * Até aqui abria um `alert` com os identificadores e não eliminava nada — e
 * a prop `path`, declarada obrigatória, não era passada por nenhuma página.
 * Com a padronização das listas este botão passou a estar em quase todas,
 * por isso o defeito deixou de ser local.
 *
 * Elimina um a um pelo mesmo endpoint do botão de linha. Não é uma operação
 * em lote no servidor: se falhar a meio, o que já foi eliminado fica
 * eliminado — e é isso que o diálogo diz, em vez de um "erro" que não
 * distingue nada ter acontecido de metade ter acontecido.
 */
import { ref, watch } from "vue";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";

const props = defineProps({
  ids: { type: Array, default: () => [] },
  path: { type: String, default: "" },
  /** `true` elimina mesmo; por omissão marca como eliminado. */
  hard: { type: Boolean, default: false },
});

const emits = defineEmits(["success"]);

const aberto = ref(false);
const aEliminar = ref(false);
const falhados = ref([]);

watch(aberto, (v) => { if (v) falhados.value = []; });

const eliminarUm = async (id) => {
  const { data } = props.hard
    ? await api.delete(`${props.path}/${id}`)
    : await api.patch(`${props.path}/soft-delete/${id}`);
  return data?.success !== false;
};

const onEliminar = async () => {
  if (!props.path) return;
  aEliminar.value = true;
  const falhas = [];
  let feitos = 0;

  for (const id of props.ids) {
    try {
      if (await eliminarUm(id)) feitos += 1;
      else falhas.push(id);
    } catch {
      falhas.push(id);
    }
  }

  aEliminar.value = false;
  falhados.value = falhas;

  // Uma notificação para a operação toda, e não uma por registo: numa
  // selecção de trinta, trinta avisos empilhados escondem o que interessa.
  if (feitos) {
    showNotify(`${feitos} ${feitos === 1 ? "registo eliminado" : "registos eliminados"}`, true);
    emits("success");
  }
  if (!falhas.length) aberto.value = false;
  else if (!feitos) showNotify("Não foi possível eliminar os registos", false);
};
</script>

<style scoped lang="scss">
.dm-cartao {
  width: 420px;
  max-width: 92vw;
  border-radius: var(--r-panel);
  background: var(--camada-flutuante);
}

.dm-titulo {
  font-size: var(--fs-title);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  color: var(--text);
}

.dm-sub {
  margin: var(--sp-2) 0 0;
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--text-2);
}

.dm-accoes {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-2);
  padding-top: var(--sp-4);
}
</style>
