<template>
  <div>
    <template v-for="(grupo, gi) in grupos" :key="grupo.titulo ?? `g${gi}`">
      <!-- Cabeçalho de secção. No rail desaparece e fica só a régua: um
           rótulo truncado a três letras é ruído, a fronteira é o que importa. -->
      <div v-if="grupo.titulo && !mini" class="nav-group-header">
        <span>{{ grupo.titulo }}</span>
      </div>
      <div v-else-if="grupo.titulo && mini" class="nav-mini-sep" />

      <template v-for="item in grupo.itens" :key="item.title">
        <!-- ── Item com filhos, barra expandida ───────────────────────────
             Expande no sítio e empurra o que está por baixo. Não é overlay:
             quando há largura, ver o pai e os filhos ao mesmo tempo é o que
             diz onde se está. -->
        <q-expansion-item
          v-if="item.children && !mini"
          :icon="item.icon"
          :label="item.title"
          :default-opened="temFilhoActivo(item)"
          dense
          class="nav-expansion"
          header-class="nav-item"
        >
          <q-item
            v-for="filho in item.children"
            :key="filho.title"
            clickable
            :to="filho.to"
            active-class="nav-item-active"
            class="nav-item nav-subitem"
          >
            <q-item-section avatar><q-icon :name="filho.icon" /></q-item-section>
            <q-item-section>
              <q-item-label>{{ filho.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- ── Item com filhos, rail ──────────────────────────────────────
             Sem largura para expandir, o grupo abre num painel ancorado à
             direita. `q-menu` já vai ao top layer e fecha ao clicar fora, que
             era para isso que a especificação pedia a Popover API. -->
        <q-item
          v-else-if="item.children && mini"
          clickable
          class="nav-item"
          :class="{ 'nav-item-active': temFilhoActivo(item) }"
        >
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>

          <q-menu
            anchor="top end"
            self="top start"
            :offset="[8, 0]"
            class="nav-flyout"
          >
            <div class="nav-flyout__titulo">{{ item.title }}</div>
            <q-list>
              <q-item
                v-for="filho in item.children"
                :key="filho.title"
                v-close-popup
                clickable
                :to="filho.to"
                active-class="nav-item-active"
                class="nav-item nav-flyout__item"
              >
                <q-item-section avatar><q-icon :name="filho.icon" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ filho.title }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <!-- ── Item simples ───────────────────────────────────────────── -->
        <q-item
          v-else
          clickable
          :to="item.to"
          active-class="nav-item-active"
          class="nav-item"
        >
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section v-if="!mini">
            <q-item-label>{{ item.title }}</q-item-label>
          </q-item-section>
          <q-tooltip v-if="mini" anchor="center right" self="center left" :offset="[10, 0]">
            {{ item.title }}
          </q-tooltip>
        </q-item>
      </template>
    </template>
  </div>
</template>

<script setup>
/**
 * Renderiza um menu — grupos, itens e itens com filhos — venha ele da gestão
 * ou de um papel clínico.
 *
 * Existe porque o mesmo bloco `q-item` estava escrito sete vezes entre
 * `faturacao.vue` e `atendimento.vue`, com pequenas divergências que ninguém
 * tinha decidido: uns itens levavam `text-body2` no rótulo, outros não; uns
 * tinham tooltip no rail, outros não.
 *
 * Sem `role="menu"` nem `aria-haspopup` no painel do rail. Esses atributos
 * prometem navegação por setas entre os itens, e prometê-la sem a implementar
 * é pior do que não a anunciar: um leitor de ecrã passa a esperar teclas que
 * não respondem. Como está, é um botão que revela um grupo de ligações, e é
 * assim que é anunciado.
 */
import { useRoute } from "vue-router";
import { useSidebar } from "src/composables/sidebar";

defineProps({
  /** [{ titulo: string|null, itens: [{ title, to, icon, children? }] }] */
  grupos: { type: Array, required: true },
});

const route = useRoute();
const { mini } = useSidebar();

/** Abre o grupo quando se está numa das suas páginas. */
const temFilhoActivo = (item) =>
  (item.children ?? []).some((f) => f.to?.name === route.name);
</script>

<style scoped lang="scss">
/* Subitens recuados, com o conector em L a ligá-los ao pai */
.nav-expansion :deep(.q-expansion-item__content) {
  padding-left: 14px;
  margin-left: 16px;
  border-left: 1px solid var(--border);
}

.nav-subitem {
  min-height: 34px !important;

  :deep(.q-item__section--avatar) {
    min-width: 28px;
  }
  :deep(.q-icon) {
    font-size: var(--fs-title);
  }
  :deep(.q-item__label) {
    font-size: var(--fs-label);
  }
}
</style>
