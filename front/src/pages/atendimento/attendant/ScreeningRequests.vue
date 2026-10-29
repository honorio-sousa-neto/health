<template>
  <ListaPagina
    titulo="Pedidos da enfermaria"
    :contexto="contexto"
    :apoio="apoio"
    :colunas="colunas"
    :linhas="linhas"
    :carregando="carregando"
    :paginacao="paginacao"
    :filtrado="!!paginacao.search || !!tipo"
    texto-vazio="Nenhum pedido por facturar."
    @recarregar="recarregar"
  >
    <template #accoes>
      <select v-model="tipo" class="lp-filtro" aria-label="Filtrar por tipo de pedido">
        <option value="">Todos os tipos</option>
        <option v-for="t in TIPOS" :key="t.chave" :value="t.chave">{{ t.plural }}</option>
      </select>

      <q-btn
        flat round dense
        icon="las la-sync-alt"
        class="btn-icone"
        aria-label="Actualizar"
        :loading="carregando"
        @click="recarregar"
      >
        <q-tooltip>Actualizar lista</q-tooltip>
      </q-btn>
    </template>

    <template #celula-doente="{ linha }">
      <span class="pn-doente">
        <span class="pn-avatar">{{ iniciais(linha.doente) }}</span>
        <span>
          <span class="pn-nome">{{ linha.doente ?? "Doente desconhecido" }}</span>
          <span v-if="linha.contacto" class="pn-contacto">{{ linha.contacto }}</span>
        </span>
      </span>
    </template>

    <template #celula-item="{ linha }">
      <span class="pn-item">
        <span class="pn-item__nome">{{ linha.item ?? "\u2014" }}</span>
        <span v-if="linha.detalhe" class="pn-item__detalhe">{{ linha.detalhe }}</span>
      </span>
    </template>

    <!-- A espera cresce à vista, e é por ela que a fila está ordenada. -->
    <template #celula-espera="{ linha }">
      <span class="lp-estado" :class="`lp-estado--${tomDaEspera(linha.criadoEm)}`">
        <span class="lp-estado__ponto" />{{ espera(linha.criadoEm) }}
      </span>
    </template>

    <template #celula-facturar="{ linha }">
      <q-btn
        unelevated no-caps dense
        icon="las la-file-invoice-dollar"
        label="Emitir factura"
        class="btn-primaria pn-accao"
        @click="facturar(linha)"
      />
    </template>
  </ListaPagina>
</template>

<script setup>
/**
 * Os pedidos da enfermaria à espera de factura.
 *
 * ── Três filas ou uma ────────────────────────────────────────────────────
 *
 * Eram três separadores — cirurgias, vacinas, administração de fármacos —
 * com três tabelas quase iguais, quatro indicadores no topo a contá-las e um
 * quarto a somar. Para quem factura é uma fila só: o que está por facturar,
 * do mais antigo ao mais recente. O tipo passa a coluna e a filtro; as
 * contagens passam à linha de apoio.
 *
 * ── A espera ─────────────────────────────────────────────────────────────
 *
 * "Em espera há 40 min" era calculado uma vez por carregamento. A lista
 * recarrega de minuto a minuto, o que disfarçava o problema mas não o
 * resolvia — entre recargas o número ficava parado. Passa a ter relógio
 * próprio.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "src/boot/axios";
import ListaPagina from "src/components/common/table/ListaPagina.vue";
import { usePaginacaoLocal } from "src/composables/paginacao-local";

const router = useRouter();

const TIPOS = [
  { chave: "cirurgia", singular: "Cirurgia", plural: "Cirurgias e nebulizações" },
  { chave: "vacina", singular: "Vacina", plural: "Vacinas" },
  { chave: "farmaco", singular: "Fármaco", plural: "Administração de fármacos" },
];

const cirurgias = ref([]);
const vacinas = ref([]);
const farmacos = ref([]);
const carregando = ref(false);
const tipo = ref("");
const actualizadoEm = ref(null);

/** O nível de uma cirurgia está no nome do serviço. */
const nivel = (nome) => {
  const n = (nome ?? "").toUpperCase();
  if (n.includes("ALFA")) return "ALFA";
  if (n.includes("BETA")) return "BETA";
  if (n.includes("GAMA")) return "GAMA";
  if (n.includes("NEBULIZ")) return "Nebulização";
  return null;
};

// As três origens numa fila só, do mais antigo ao mais recente: quem espera
// há mais tempo fica em cima, seja qual for o tipo do pedido.
const todos = computed(() => {
  const linhas = [
    ...cirurgias.value.map((i) => ({
      chave: `c-${i.id}`,
      id: i.id,
      tipo: "cirurgia",
      doente: i.customer?.name ?? null,
      contacto: i.customer?.phone ?? null,
      item: i.service?.name ?? null,
      detalhe: nivel(i.service?.name),
      criadoEm: i.createdAt,
      params: { surgeryId: i.id },
    })),
    ...vacinas.value.map((i) => ({
      chave: `v-${i.id}`,
      id: i.id,
      tipo: "vacina",
      doente: i.customer?.name ?? null,
      contacto: i.customer?.phone ?? null,
      item: i.service?.name ?? null,
      detalhe: i.type ?? null,
      criadoEm: i.createdAt,
      params: { administrationId: i.id },
    })),
    ...farmacos.value.map((i) => ({
      chave: `f-${i.id}`,
      id: i.id,
      tipo: "farmaco",
      doente: i.customer?.name ?? null,
      contacto: i.customer?.phone ?? null,
      item: i.service?.name ?? null,
      detalhe: [i.type, i.service?.description].filter(Boolean).join(" \u00b7 ") || null,
      criadoEm: i.createdAt,
      params: { administrationId: i.id },
    })),
  ];

  const filtradas = tipo.value ? linhas.filter((l) => l.tipo === tipo.value) : linhas;
  return [...filtradas].sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
});

const { paginacao, linhas } = usePaginacaoLocal(todos, ["doente", "item"]);

const contexto = computed(() => {
  if (paginacao.search) return `a filtrar por \u201c${paginacao.search}\u201d`;
  return actualizadoEm.value ? `actualizado ${desde(actualizadoEm.value)}` : "";
});

const apoio = computed(() => {
  const partes = [];
  if (cirurgias.value.length) partes.push(`${cirurgias.value.length} cirurgias`);
  if (vacinas.value.length) partes.push(`${vacinas.value.length} vacinas`);
  if (farmacos.value.length) partes.push(`${farmacos.value.length} administrações`);
  const resumo = partes.length ? `${partes.join(" \u00b7 ")}. ` : "";
  return `${resumo}Do mais antigo ao mais recente: quem espera há mais tempo fica em cima.`;
});

/* ── O relógio ─────────────────────────────────────────────────────────── */
const agora = ref(Date.now());
let relogio = null;
let recarga = null;

const minutos = (valor) =>
  valor ? Math.floor((agora.value - new Date(valor).getTime()) / 60000) : null;

const espera = (valor) => {
  const m = minutos(valor);
  if (m == null) return "\u2014";
  if (m < 1) return "menos de 1 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto ? `${h}h ${resto}min` : `${h}h`;
};

const tomDaEspera = (valor) => {
  const m = minutos(valor);
  if (m == null) return "neutro";
  if (m >= 60) return "erro";
  if (m >= 30) return "aviso";
  return "neutro";
};

const desde = (data) => {
  const s = Math.floor((agora.value - data) / 1000);
  if (s < 10) return "agora mesmo";
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  return `há ${Math.floor(m / 60)}h`;
};

/* ── Colunas ───────────────────────────────────────────────────────────── */
const iniciais = (nome) =>
  nome?.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?";

const rotuloTipo = (chave) => TIPOS.find((t) => t.chave === chave)?.singular ?? chave;

const colunas = [
  { name: "doente", label: "Doente", field: "doente", align: "left", ordenavel: true },
  {
    name: "tipo", label: "Tipo", field: "tipo", align: "left", largura: "120px",
    format: (v) => rotuloTipo(v),
  },
  { name: "item", label: "Procedimento ou fármaco", field: "item", align: "left" },
  { name: "espera", label: "Em espera", field: () => null, align: "left", largura: "150px" },
  {
    name: "criadoEm", label: "Pedido em", field: "criadoEm", align: "left", largura: "150px",
    format: (v) =>
      v
        ? new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit", month: "short",
            hour: "2-digit", minute: "2-digit",
          }).format(new Date(v))
        : "\u2014",
  },
  { name: "facturar", label: "", field: () => null, align: "right", largura: "160px" },
];

const facturar = (linha) =>
  router.push({ name: "emitir-documento-form", params: linha.params });

/* ── Carregar ──────────────────────────────────────────────────────────── */
const recarregar = async () => {
  carregando.value = true;
  try {
    const [c, f, v] = await Promise.all([
      api.get("surgeries/requests/list").catch(() => ({ data: {} })),
      api.get("administrations").catch(() => ({ data: {} })),
      api.get("administrations/vaccines").catch(() => ({ data: {} })),
    ]);
    cirurgias.value = c.data?.data ?? [];
    // Só interessa o que ainda não foi facturado — é essa a fila.
    farmacos.value = (f.data?.data ?? []).filter((i) => !i.paid);
    vacinas.value = (v.data?.data ?? []).filter((i) => !i.paid);
    actualizadoEm.value = Date.now();
  } finally {
    carregando.value = false;
  }
};

onMounted(() => {
  recarregar();
  recarga = setInterval(recarregar, 60000);
  relogio = setInterval(() => { agora.value = Date.now(); }, 30000);
});

onUnmounted(() => {
  clearInterval(recarga);
  clearInterval(relogio);
});
</script>

<style scoped lang="scss">
.pn-doente {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
}

.pn-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  background: var(--surface-3);
  color: var(--text-2);
  font-size: var(--fs-label);
  font-weight: var(--fw-semi);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pn-nome {
  display: block;
  font-weight: var(--fw-semi);
  color: var(--text);
}

.pn-contacto {
  display: block;
  margin-top: 1px;
  font-size: var(--fs-label);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.pn-item__nome { display: block; color: var(--text-2); }

.pn-item__detalhe {
  display: block;
  margin-top: 1px;
  font-size: var(--fs-label);
  color: var(--text-muted);
}

.pn-accao {
  min-width: 148px;
  font-size: var(--fs-label);
}
</style>
