<template>
  <!-- Dois modos: botão solto, como sempre foi, ou item de menu de linha, que
       é onde as acções por registo passam a viver nas listas migradas. -->
  <q-item v-if="modo === 'item'" v-close-popup clickable class="item-destrutivo" @click="open = true">
    <q-item-section avatar><q-icon name="las la-trash" size="18px" /></q-item-section>
    <q-item-section>Eliminar</q-item-section>
  </q-item>

  <q-btn v-else flat round dense icon="las la-trash" class="btn-icone-destrutivo" @click="open = true">
    <q-tooltip>Eliminar</q-tooltip>
  </q-btn>

  <q-dialog v-model="open" persistent>
    <q-card style="width: 360px; border-radius: var(--r-panel); overflow: hidden; max-width: 92vw">
      <div class="dialog-header">
        <div class="dialog-icon-wrap">
          <q-icon name="las la-exclamation-triangle" size="28px" class="icone-destrutivo" />
        </div>
      </div>

      <q-card-section class="q-pt-md q-pb-sm text-center">
        <div class="text-weight-bold" style="font-size: var(--fs-body); color: var(--text)">
          Eliminar registo
        </div>
        <div class="text-grey-6 q-mt-xs" style="font-size: var(--fs-body); line-height: 1.5">
          Esta acção é irreversível.<br>Tem a certeza que quer continuar?
        </div>
      </q-card-section>

      <q-card-section class="row q-gutter-sm justify-center q-pb-lg q-pt-sm">
        <q-btn
          unelevated no-caps
          class="btn-destrutiva" label="Sim, eliminar"
          style="min-width: 130px; border-radius: var(--r-sm)"
          :loading
          @click="onDelete"
        />
        <q-btn
          flat no-caps
          label="Cancelar"
          style="min-width: 100px; border-radius: var(--r-sm)"
          v-close-popup
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useCreateUpdate } from "src/composables/create-update";

const open = ref(false);
const emits = defineEmits(["success"]);

const props = defineProps({
  id:   { type: String, required: true },
  path: { type: String, required: true },
  hard: { type: Boolean, default: false },
  /** "botao" (solto) ou "item" (dentro de um menu de linha). */
  modo: { type: String, default: "botao" },
});

const { softDelete, destroy, loading } = useCreateUpdate(props.path);

const onDelete = async () => {
  const success = props.hard ? await destroy(props.id) : await softDelete(props.id);
  if (success) emits("success");
  open.value = false;
};
</script>

<style scoped lang="scss">
/* Os dois literais rosa que aqui estavam (#fff5f5 e #fed7d7) eram quase
   brancos sobre o tema escuro. Passam à tinta da escala de estado, que é
   translúcida e por isso funciona nos dois temas. */
.dialog-header {
  background: var(--st-danger-tint);
  display: flex;
  justify-content: center;
  padding: 24px 0 16px;
}

.dialog-icon-wrap {
  background: var(--st-danger-tint);
  border: 1px solid var(--st-danger);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
