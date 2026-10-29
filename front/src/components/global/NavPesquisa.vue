<template>
  <!-- Barra expandida: o campo está lá, sempre visível. -->
  <div v-if="!mini" class="sb-pesquisa">
    <q-icon name="las la-search" size="15px" />
    <q-select
      ref="campoRef"
      v-model="destino"
      :options="opcoes"
      option-label="title"
      use-input
      hide-selected
      fill-input
      hide-dropdown-icon
      borderless
      dense
      input-debounce="0"
      :placeholder="atalho"
      class="sb-pesquisa__campo"
      @filter="filtrar"
      @update:model-value="navegar"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps" dense>
          <q-item-section avatar><q-icon :name="scope.opt.icon" size="18px" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.title }}</q-item-label>
            <q-item-label caption>{{ scope.opt.grupo }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template #no-option>
        <q-item><q-item-section class="text-caption">Nenhuma página com esse nome</q-item-section></q-item>
      </template>
    </q-select>
  </div>

  <!-- Rail: o mesmo campo, num painel ancorado. -->
  <div v-else class="sb-pesquisa sb-pesquisa--rail">
    <button ref="gatilhoRef" class="sb-icon-btn" aria-label="Pesquisar página">
      <q-icon name="las la-search" size="18px" />
      <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
        Pesquisar página · {{ atalho }}
      </q-tooltip>
      <q-menu
        v-model="painelAberto"
        anchor="top end"
        self="top start"
        :offset="[8, 0]"
        class="nav-flyout"
        @show="focarCampo"
      >
        <div class="nav-flyout__titulo">Pesquisar página</div>
        <div class="sb-pesquisa sb-pesquisa--painel">
          <q-icon name="las la-search" size="15px" />
          <q-select
            ref="campoRef"
            v-model="destino"
            :options="opcoes"
            option-label="title"
            use-input
            hide-selected
            fill-input
            hide-dropdown-icon
            borderless
            dense
            input-debounce="0"
            placeholder="Nome da página…"
            class="sb-pesquisa__campo"
            @filter="filtrar"
            @update:model-value="navegar"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps" dense>
                <q-item-section avatar><q-icon :name="scope.opt.icon" size="18px" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.title }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.grupo }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #no-option>
              <q-item><q-item-section class="text-caption">Nenhuma página com esse nome</q-item-section></q-item>
            </template>
          </q-select>
        </div>
      </q-menu>
    </button>
  </div>
</template>

<script setup>
/**
 * Pesquisa de destinos, nos dois estados da barra.
 *
 * Lê a mesma fonte que a navegação desenha — `menuParaPapel()` —, por isso
 * quem pesquisa encontra exactamente o que pode abrir. Estava limitada a
 * admin e inventory enquanto o menu clínico vivia noutro ficheiro; deixou de
 * estar quando a fonte passou a ser uma só.
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Platform, SessionStorage } from "quasar";
import { destinosPesquisaveis, menuParaPapel } from "src/config/menu";

const props = defineProps({ mini: { type: Boolean, default: false } });

const router = useRouter();
const user = SessionStorage.getItem("alfavida_user");
const todos = destinosPesquisaveis(menuParaPapel(user?.role));

const destino = ref(null);
const opcoes = ref(todos);
const campoRef = ref(null);
const painelAberto = ref(false);

const atalho = computed(() => (Platform.is.mac ? "Pesquisar · ⌘K" : "Pesquisar · Ctrl+K"));

const semAcentos = (s) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const filtrar = (valor, update) => {
  update(() => {
    const q = semAcentos(valor).trim();
    opcoes.value = !q
      ? todos
      : todos.filter(
          (d) => semAcentos(d.title).includes(q) || semAcentos(d.grupo).includes(q),
        );
  });
};

const navegar = (opcao) => {
  if (!opcao?.to) return;
  painelAberto.value = false;
  destino.value = null;
  router.push(opcao.to);
};

const focarCampo = () => nextTick(() => campoRef.value?.showPopup?.());

/**
 * Ctrl+K / ⌘K nos dois estados. No rail abre o painel — que já foca o campo
 * ao mostrar-se —, na barra expandida foca o campo directamente.
 */
const aoTeclado = (e) => {
  if (!(e.key === "k" || e.key === "K") || !(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  if (props.mini) painelAberto.value = true;
  else focarCampo();
};

onMounted(() => window.addEventListener("keydown", aoTeclado));
onUnmounted(() => window.removeEventListener("keydown", aoTeclado));
</script>
