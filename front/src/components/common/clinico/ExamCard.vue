<template>
  <section class="ec" :class="{ 'ec--aberto': aberto }">
    <component
      :is="colapsavel ? 'button' : 'div'"
      class="ec-head"
      :class="{ 'ec-head--btn': colapsavel }"
      :type="colapsavel ? 'button' : null"
      :aria-expanded="colapsavel ? String(aberto) : null"
      @click="colapsavel && (aberto = !aberto)"
    >
      <q-icon
        v-if="colapsavel"
        :name="aberto ? 'las la-angle-down' : 'las la-angle-right'"
        size="14px"
        class="ec-chev"
      />

      <span class="ec-titulo">{{ titulo }}</span>

      <span v-if="estado" class="ec-estado" :class="`ec-estado--${estado}`">
        {{ ESTADOS[estado] ?? estado }}
      </span>

      <span class="ec-espaco" />

      <!-- O resumo é o que faz um cartão fechado continuar a dizer alguma
           coisa. Sem ele, colapsar esconde que lá dentro há um valor crítico,
           e o utilizador teria de abrir os nove cartões para saber onde olhar. -->
      <span v-if="temResumo" class="ec-resumo">
        <span v-if="resumo.criticos" class="ec-cont ec-cont--critico">
          <q-icon name="las la-exclamation-circle" size="12px" />
          {{ resumo.criticos }} {{ resumo.criticos === 1 ? "crítico" : "críticos" }}
        </span>
        <span v-if="resumo.alterados" class="ec-cont ec-cont--alterado">
          <q-icon name="las la-asterisk" size="12px" />
          {{ resumo.alterados }} {{ resumo.alterados === 1 ? "alterado" : "alterados" }}
        </span>
        <span v-if="!resumo.criticos && !resumo.alterados" class="ec-cont ec-cont--normal">
          <q-icon name="las la-check" size="12px" />
          Sem alterações
        </span>
      </span>

      <span v-if="meta" class="ec-meta">{{ meta }}</span>
    </component>

    <div v-if="aberto" class="ec-corpo">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * O cartão de um pedido de exame.
 *
 * Agrupa **um exame**, não um parâmetro. A distinção importa: o PRODUCT.md
 * proíbe separar listas de parâmetros em cartões espaçados, e é isso que este
 * cartão não faz — por dentro as linhas são contíguas, a 2px umas das outras.
 * Um cartão por pedido, não um cartão por resultado.
 */
import { computed } from "vue";

const ESTADOS = {
  pendente: "Pendente",
  "em-curso": "Em curso",
  validado: "Validado",
};

const props = defineProps({
  titulo: { type: String, required: true },
  /** "pendente" | "em-curso" | "validado" */
  estado: { type: String, default: null },
  /** Linha de contexto: data, requisitante. Texto já formatado. */
  meta: { type: String, default: "" },
  /** { alterados: n, criticos: n } — vindo de `resumirNiveis`. */
  resumo: { type: Object, default: null },
  colapsavel: { type: Boolean, default: true },
});

const aberto = defineModel("aberto", { type: Boolean, default: true });

const temResumo = computed(() => props.resumo && typeof props.resumo === "object");

defineExpose({ ESTADOS });
</script>

<style scoped lang="scss">
.ec {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-card);
  overflow: hidden;
}

.ec-head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  background: var(--surface-2);
  border: none;
  border-bottom: 1px solid transparent;
  text-align: left;
  font-family: inherit;
}

.ec--aberto .ec-head {
  border-bottom-color: var(--border-soft);
}

.ec-head--btn {
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: var(--surface-3);
  }

  &:focus-visible {
    outline: var(--ring-w) solid var(--accent);
    outline-offset: -2px;
  }
}

.ec-chev {
  color: var(--text-faint);
  flex-shrink: 0;
}

.ec-titulo {
  font-size: var(--fs-title);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  color: var(--text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ec-espaco {
  flex: 1;
}

// ── Estado do pedido ─────────────────────────────────────────────────────
// Chip em tinta translúcida com o texto no degrau escuro. Nunca sólido: é o
// que permite ao mesmo chip funcionar nos dois temas.
.ec-estado {
  flex-shrink: 0;
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  font-weight: var(--fw-forte);
  letter-spacing: 0.4px;
  padding: 2px var(--sp-2);
  border-radius: var(--r-pill);
  white-space: nowrap;
}

.ec-estado--pendente {
  background: var(--st-warn-tint);
  color: var(--st-warn-text);
}

.ec-estado--em-curso {
  background: var(--st-info-tint);
  color: var(--st-info-text);
}

.ec-estado--validado {
  background: var(--st-ok-tint);
  color: var(--st-ok-text);
}

// ── Resumo ───────────────────────────────────────────────────────────────
.ec-resumo {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.ec-cont {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.ec-cont--critico {
  color: var(--st-danger-text);
  font-weight: var(--fw-forte);
}

.ec-cont--alterado {
  color: var(--st-warn-text);
}

.ec-cont--normal {
  color: var(--text-faint);
}

.ec-meta {
  flex-shrink: 0;
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  color: var(--text-faint);
  white-space: nowrap;
}

.ec-corpo {
  padding: var(--sp-2) var(--sp-3) var(--sp-3);
}

@media (max-width: 599.98px) {
  .ec-head {
    flex-wrap: wrap;
    padding: var(--sp-2) var(--sp-3);
  }

  .ec-espaco {
    display: none;
  }

  .ec-meta {
    width: 100%;
  }
}
</style>
