<template>
  <tr class="pr" :class="`pr--${estado.nivel}`">
    <th class="pr-c pr-nome" scope="row">
      <span class="pr-lbl">{{ nome }}</span>
    </th>

    <td class="pr-c pr-valor">
      <span class="pr-vwrap">
        <AbnormalBadge :nivel="estado.nivel" :direccao="estado.direccao" />
        <span class="pr-num" :class="{ 'pr-num--texto': !estado.numerico }">{{ mostrado }}</span>
      </span>
    </td>

    <td class="pr-c pr-unidade">{{ unidade || "" }}</td>

    <td class="pr-c pr-ref">
      <ReferenceRange :referencia="referencia" :valor="valor" :por-definir="porDefinir" />
    </td>
  </tr>
</template>

<script setup>
/**
 * Uma linha de parâmetro clínico.
 *
 * Renderiza `<tr>`, por isso vive dentro de um `ParameterPanel` e não
 * isoladamente. Essa escolha resolve o problema que travou a primeira
 * tentativa: quatro colunas em grelhas independentes dimensionam-se ao
 * conteúdo de cada linha, e unidade e referência saltavam de linha para
 * linha. `subgrid` resolveria, mas o alvo de build é chrome87/safari13.1 e o
 * subgrid só chega no Chrome 117. Uma tabela alinha colunas nativamente,
 * pinta o fundo na linha inteira sem truques, e traz a navegação por linha e
 * coluna que um leitor de ecrã já sabe fazer.
 *
 * ── Altura ───────────────────────────────────────────────────────────────
 * A linha equivalente de hoje (`.vec-field` em ViewResult.vue) é uma grelha
 * de duas linhas: o intervalo de referência ocupa uma linha inteira só para
 * si. Mede 53,4px — 16 de padding, 20,8 do valor, 1 de intervalo, 15,6 da
 * referência. Aqui a referência é a quarta coluna, e a linha fica em 36,8px:
 * 16 de padding mais os 20,8 do valor. Menos 31%, com a referência na mesma
 * sempre visível. Num painel de 30 parâmetros são ~498px poupados.
 */
import { computed } from "vue";
import AbnormalBadge from "./AbnormalBadge.vue";
import ReferenceRange from "./ReferenceRange.vue";
import { severidadeDe, NIVEL } from "src/utils/severidadeClinica";

const props = defineProps({
  nome: { type: String, required: true },
  valor: { type: [String, Number], default: null },
  unidade: { type: String, default: "" },
  referencia: { type: String, default: "" },
  /** Nome do exame, para o `severidadeClinica` consultar os limiares de pânico. */
  exame: { type: String, default: null },
  /**
   * Força o nível em vez de o deduzir. Útil quando a severidade vem do
   * backend ou quando se está a demonstrar um estado.
   */
  nivel: { type: String, default: null },
  direccao: { type: String, default: null },
  /** A referência falta e alguém tem de a preencher — distinto de não existir. */
  porDefinir: { type: Boolean, default: false },
});

const estado = computed(() => {
  if (props.nivel) {
    return {
      nivel: props.nivel,
      direccao: props.direccao,
      numerico: /\d/.test(String(props.valor ?? "")),
    };
  }
  return severidadeDe({
    valor: props.valor,
    referencia: props.referencia,
    exame: props.exame,
    rotulo: props.nome,
  });
});

/** Sem valor rende travessão — a célula vazia leria-se como resultado zero. */
const mostrado = computed(() => {
  const v = String(props.valor ?? "").trim();
  return v === "" ? "—" : v;
});

defineExpose({ NIVEL });
</script>

<style scoped lang="scss">
.pr-c {
  padding: var(--sp-2) 10px;
  vertical-align: middle;
  // O fundo vive nas células e não na linha porque `<tr>` com border-radius
  // não recorta em todos os motores; as extremidades arredondam-se na
  // primeira e na última célula, logo abaixo.
  background: var(--linha-fundo, transparent);
  // O contorno está sempre reservado, mesmo transparente. Duas razões: dá ao
  // hover onde pintar sem deslocar nada, e iguala a altura das linhas — até
  // aqui só o crítico desenhava contorno, e por isso era 2px mais alto que as
  // vizinhas, numa tabela cujo argumento inteiro é o alinhamento.
  // `border-collapse: separate` impede contorno no `<tr>`, daí ser por célula.
  border-top: 1px solid var(--linha-contorno, transparent);
  border-bottom: 1px solid var(--linha-contorno, transparent);
  transition: background 0.12s ease, border-color 0.12s ease;
}

.pr-c:first-child {
  border-left: 1px solid var(--linha-contorno, transparent);
  border-top-left-radius: var(--r-sm);
  border-bottom-left-radius: var(--r-sm);
}

.pr-c:last-child {
  border-right: 1px solid var(--linha-contorno, transparent);
  border-top-right-radius: var(--r-sm);
  border-bottom-right-radius: var(--r-sm);
}

// Hover como ajuda de leitura horizontal: em 30 linhas, saber em que linha se
// está é o que evita ler o valor da linha de cima. É resposta a intenção do
// utilizador, não animação decorativa.
//
// Numa linha sem banda o hover pinta o fundo, que é o gesto mais legível e
// não colide com nada. O `:not()` não é defensivo, é o contrato: sem ele
// `.pr:hover .pr-c` (três classes) vencia `.pr--alterado .pr-c` (duas) e o
// hover voltava a pintar por cima da banda — que é precisamente o defeito.
.pr:not(.pr--alterado):not(.pr--critico):hover .pr-c {
  --linha-fundo: var(--surface-3);
}

// Numa linha com banda o hover pinta o CONTORNO e não toca no preenchimento.
// O fundo dessas linhas transporta estado clínico; se a interacção o mexesse,
// o valor mais importante do sistema perderia contraste exactamente no momento
// em que o clínico aponta para ele para o ler. A regra é permanente e vale
// para hover, foco, selecção e linha alternada.
.pr--alterado .pr-c {
  --linha-fundo: var(--clin-banda-alterado);
}

.pr--critico .pr-c {
  --linha-fundo: var(--clin-banda-critico);
}

.pr--alterado:hover .pr-c {
  --linha-contorno: var(--clin-contorno-hover);
}

// Contorno completo no crítico — nunca barra lateral. O DESIGN.md bane a
// barra de acento, e a linha inteira contornada distingue-se da banda sozinha
// mesmo quando as duas tintas se confundem, que é o caso em deuteranopia.
// O crítico já usa o contorno para informação, por isso o hover não lho pode
// tirar: fica só com a banda, que é o canal mais forte que tem.
.pr--critico .pr-c {
  --linha-contorno: var(--clin-contorno-critico);
}

// ── Nome ─────────────────────────────────────────────────────────────────
.pr-nome {
  text-align: left;
  font-weight: var(--fw-medio);
  // A coluna do nome absorve a folga; as outras três encolhem ao conteúdo.
  width: 100%;
}

.pr-lbl {
  font-size: var(--fs-body);
  line-height: var(--lh-tight);
  color: var(--text-2);
}

.pr--alterado .pr-lbl,
.pr--critico .pr-lbl {
  color: var(--clin-rotulo-banda);
}

// ── Valor ────────────────────────────────────────────────────────────────
.pr-valor {
  text-align: right;
  white-space: nowrap;
}

.pr-vwrap {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-1);
}

.pr-num {
  font-size: var(--fs-title);
  line-height: var(--lh-tight);
  font-weight: var(--fw-semi);
  color: var(--text);
  // Cifras tabulares: sem elas o "1" é mais estreito que o "8" e uma coluna
  // de trinta números deixa de alinhar. É um dos defeitos que o browser traz
  // por omissão e que nenhum sistema de design herda de graça.
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

// Resultados qualitativos ("positivo", "turvo") não são números e não ganham
// nada em alinhamento numérico — ganham em serem lidos como palavras.
.pr-num--texto {
  font-size: var(--fs-body);
  font-weight: var(--fw-medio);
  font-variant-numeric: normal;
}

.pr--normal .pr-num {
  color: var(--text);
}

.pr--alterado .pr-num {
  color: var(--clin-texto-alterado);
  font-weight: var(--fw-forte);
}

.pr--critico .pr-num {
  color: var(--clin-texto-critico);
  font-weight: var(--fw-maximo);
}

// ── Unidade ──────────────────────────────────────────────────────────────
// Coluna própria, alinhada à esquerda: é o que faz "mg/dL" e "/µL" ficarem
// uns por baixo dos outros em vez de colados a números de larguras
// diferentes.
.pr-unidade {
  text-align: left;
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  color: var(--text-faint);
  white-space: nowrap;
}

.pr--alterado .pr-unidade,
.pr--critico .pr-unidade {
  color: var(--clin-rotulo-banda);
}

// ── Referência ───────────────────────────────────────────────────────────
.pr-ref {
  text-align: right;
  white-space: nowrap;
}

// ── Ecrã estreito ────────────────────────────────────────────────────────
// Quatro colunas não cabem em 390px. Com scroll horizontal, a referência sai
// do ecrã — e "sempre visível" deixa de ser verdade, que é precisamente a
// restrição que esta primitiva existe para cumprir. Por isso a linha dobra:
// nome, valor e unidade em cima; a referência ocupa a segunda linha inteira.
//
// A referência atravessa as três colunas de propósito. Com ela numa coluna
// só, a banda partia-se a meio da linha e o contorno do crítico desenhava
// duas caixas em vez de uma.
@media (max-width: 599.98px) {
  .pr {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: baseline;
  }

  .pr-c {
    padding: var(--sp-1) var(--sp-2);
    border-radius: 0;
    border: none;
  }

  .pr-nome {
    grid-column: 1;
    grid-row: 1;
    padding-top: var(--sp-2);
    border-top-left-radius: var(--r-sm);
  }

  .pr-valor {
    grid-column: 2;
    grid-row: 1;
    padding-top: var(--sp-2);
    padding-right: var(--sp-1);
  }

  .pr-unidade {
    grid-column: 3;
    grid-row: 1;
    padding-top: var(--sp-2);
    padding-left: 0;
    border-top-right-radius: var(--r-sm);
  }

  .pr-ref {
    grid-column: 1 / -1;
    grid-row: 2;
    text-align: left;
    padding-top: 0;
    padding-bottom: var(--sp-2);
    border-bottom-left-radius: var(--r-sm);
    border-bottom-right-radius: var(--r-sm);
  }

  // Contorno reservado também aqui, na aresta exterior que cada célula ocupa
  // depois da dobra. Sem isto o hover não teria onde pintar em ecrã estreito e
  // a linha com banda voltaria a depender do preenchimento.
  .pr-nome {
    border-top: 1px solid var(--linha-contorno, transparent);
    border-left: 1px solid var(--linha-contorno, transparent);
  }

  .pr-valor {
    border-top: 1px solid var(--linha-contorno, transparent);
  }

  .pr-unidade {
    border-top: 1px solid var(--linha-contorno, transparent);
    border-right: 1px solid var(--linha-contorno, transparent);
  }

  .pr-ref {
    border-bottom: 1px solid var(--linha-contorno, transparent);
    border-left: 1px solid var(--linha-contorno, transparent);
    border-right: 1px solid var(--linha-contorno, transparent);
  }

  // O contorno do crítico acompanha a dobra sem regra própria: `--linha-contorno`
  // já vem definido por `.pr--critico .pr-c`, fora desta consulta de média, e
  // as quatro declarações acima limitam-se a dizer que aresta cada célula pinta.
}
</style>
