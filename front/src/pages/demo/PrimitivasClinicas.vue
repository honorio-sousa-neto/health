<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-xs">Primitivas clínicas</div>
    <div class="text-caption q-mb-lg">
      Direcção «Banda». Nenhum CSS próprio nesta página — só as primitivas e os
      utilitários do Quasar que a aplicação já usa.
    </div>

    <!-- ── 1. O painel real ────────────────────────────────────────────── -->
    <div class="text-h6 q-mb-xs">Sumário de urina II</div>
    <div class="text-caption q-mb-sm">
      Dezasseis parâmetros, quatro alterados e um crítico. Os níveis não estão
      escritos à mão: saem do <code>severidadeDe()</code> a partir do valor e do
      intervalo de referência.
    </div>

    <ExamCard
      v-model:aberto="urinaAberta"
      titulo="Urina II — sumário"
      estado="validado"
      meta="11/09/2026 · Dr.ª Aguinalda Fortes"
      :resumo="resumoUrina"
      class="q-mb-lg"
    >
      <ParameterPanel
        :grupos="urinaII"
        exame="Urina II"
        legenda="Resultados do sumário de urina II, com intervalos de referência"
      />
    </ExamCard>

    <!-- ── 2. AbnormalBadge ────────────────────────────────────────────── -->
    <div class="text-h6 q-mb-xs">AbnormalBadge</div>
    <div class="text-caption q-mb-sm">
      Três níveis, quatro canais: cor, peso, símbolo e texto acessível. O normal
      não desenha nada — marcar os vinte e seis valores normais de um painel
      destruiria o contraste que faz os quatro alterados saltar à vista.
    </div>

    <div class="row items-center q-gutter-md q-mb-lg">
      <AbnormalBadge nivel="normal" rotulo />
      <AbnormalBadge nivel="alterado" direccao="acima" rotulo />
      <AbnormalBadge nivel="alterado" direccao="abaixo" rotulo />
      <AbnormalBadge nivel="alterado" rotulo />
      <AbnormalBadge nivel="critico" direccao="acima" rotulo />
      <AbnormalBadge nivel="critico" direccao="abaixo" rotulo />
      <AbnormalBadge nivel="critico" rotulo />
    </div>

    <!-- ── 3. ReferenceRange ───────────────────────────────────────────── -->
    <div class="text-h6 q-mb-xs">ReferenceRange</div>
    <div class="text-caption q-mb-sm">
      Sempre visível, nunca em tooltip. Normaliza as cinco formas que o
      <code>parseReference</code> aceita, e sublinha o limite que o valor
      ultrapassou.
    </div>

    <div class="row items-center q-gutter-md q-mb-lg">
      <ReferenceRange referencia="4.000 - 11.000" />
      <ReferenceRange referencia="5,0 a 8,0" />
      <ReferenceRange referencia="< 10" />
      <ReferenceRange referencia="≥ 12" />
      <ReferenceRange referencia="10 – 20" valor="27" />
      <ReferenceRange referencia="10 – 20" valor="4" />
      <ReferenceRange referencia="" />
      <ReferenceRange referencia="" por-definir />
    </div>

    <!-- ── 4. ParameterRow ─────────────────────────────────────────────── -->
    <div class="text-h6 q-mb-xs">ParameterRow</div>
    <div class="text-caption q-mb-sm">
      Todos os estados. Números à direita com cifras tabulares, unidade em
      coluna própria, referência na quarta coluna — 36,8px de altura contra os
      53,4px da linha equivalente de hoje.
    </div>

    <ParameterPanel legenda="Demonstração de todos os estados da linha de parâmetro" class="q-mb-lg">
      <ParameterRow nome="Hemoglobina" valor="14,2" unidade="g/dL" referencia="12,0 – 16,0" />
      <ParameterRow nome="Leucócitos" valor="12.400" unidade="/µL" referencia="4.000 – 11.000" />
      <ParameterRow nome="Plaquetas" valor="82.000" unidade="/µL" referencia="150.000 – 400.000" />
      <ParameterRow nome="Potássio" valor="7,1" unidade="mmol/L" referencia="3,5 – 5,1" />
      <ParameterRow nome="Nitritos" valor="positivo" referencia="negativo" />
      <ParameterRow nome="Hemocultura" valor="" referencia="negativo" />
      <ParameterRow nome="Gota espessa" valor="ausente" referencia="" por-definir />
      <ParameterRow nome="Nome muito longo de um parâmetro laboratorial pouco frequente" valor="0,03" unidade="mg/dL" referencia="< 0,30" />
    </ParameterPanel>

    <!-- ── 5. VitalChip e VitalGrid ────────────────────────────────────── -->
    <div class="text-h6 q-mb-xs">VitalChip em VitalGrid</div>
    <div class="text-caption q-mb-sm">
      Substitui o chip de hoje, que codifica os estados apenas por cor. Aqui o
      estado leva cor, peso e símbolo, e a referência fica dentro do chip.
    </div>

    <VitalGrid class="q-mb-md">
      <VitalChip rotulo="Temperatura" valor="36,8" unidade="°C" referencia="36,0 – 37,5" icone="las la-thermometer-half" />
      <VitalChip rotulo="Tensão arterial" valor="128/84" unidade="mmHg" icone="las la-heartbeat" />
      <VitalChip rotulo="Freq. cardíaca" valor="112" unidade="bpm" referencia="60 – 100" icone="las la-heart" />
      <VitalChip rotulo="Sat. O₂" valor="88" unidade="%" referencia="≥ 95" icone="las la-lungs" />
      <VitalChip rotulo="Glicemia" valor="" unidade="mg/dL" referencia="70 – 110" icone="las la-tint" />
    </VitalGrid>

    <VitalGrid :fluido="false" class="q-mb-lg">
      <VitalChip rotulo="Peso" valor="71,4" unidade="kg" icone="las la-weight" />
      <VitalChip rotulo="Altura" valor="1,68" unidade="m" icone="las la-ruler-vertical" />
      <VitalChip rotulo="IMC" valor="25,3" unidade="kg/m²" referencia="18,5 – 24,9" icone="las la-calculator" />
    </VitalGrid>

    <!-- ── 6. ExamCard ─────────────────────────────────────────────────── -->
    <div class="text-h6 q-mb-xs">ExamCard</div>
    <div class="text-caption q-mb-sm">
      Os três estados do pedido. O resumo no cabeçalho é o que faz um cartão
      fechado continuar a dizer que há um crítico lá dentro.
    </div>

    <div class="q-gutter-sm">
      <ExamCard
        titulo="Hemograma completo"
        estado="validado"
        meta="11/09/2026 · 08:14"
        :resumo="{ alterados: 2, criticos: 1 }"
        :aberto="false"
      />
      <ExamCard
        titulo="Bioquímica — perfil renal"
        estado="em-curso"
        meta="11/09/2026 · 09:02"
        :resumo="{ alterados: 0, criticos: 0 }"
        :aberto="false"
      />
      <ExamCard
        titulo="Serologia — VIH 1/2"
        estado="pendente"
        meta="Requisitado às 09:40"
        :aberto="false"
      />
      <ExamCard titulo="Painel sem resultados" estado="pendente" meta="Aguarda colheita">
        <ParameterPanel :grupos="[]" legenda="Painel vazio" />
      </ExamCard>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue";
import ExamCard from "src/components/common/clinico/ExamCard.vue";
import ParameterPanel from "src/components/common/clinico/ParameterPanel.vue";
import ParameterRow from "src/components/common/clinico/ParameterRow.vue";
import AbnormalBadge from "src/components/common/clinico/AbnormalBadge.vue";
import ReferenceRange from "src/components/common/clinico/ReferenceRange.vue";
import VitalChip from "src/components/common/clinico/VitalChip.vue";
import VitalGrid from "src/components/common/clinico/VitalGrid.vue";
import { resumirNiveis } from "src/utils/severidadeClinica";

const urinaAberta = ref(true);

/**
 * Sumário de urina II, nas três secções em que se lê.
 * Quatro alterados — aspecto, proteínas, nitritos, eritrócitos — e um
 * crítico: 250 leucócitos/µL contra uma referência de < 10, vinte e cinco
 * vezes o limite.
 */
const urinaII = [
  {
    titulo: "Exame físico",
    parametros: [
      { nome: "Cor", valor: "amarelo-citrino", referencia: "amarelo-citrino" },
      { nome: "Aspecto", valor: "turvo", referencia: "límpido" },
      { nome: "Densidade", valor: "1,030", referencia: "1,005 – 1,030" },
      { nome: "pH", valor: "6,0", referencia: "5,0 – 8,0" },
    ],
  },
  {
    titulo: "Exame químico",
    parametros: [
      { nome: "Proteínas", valor: "100", unidade: "mg/dL", referencia: "< 30" },
      { nome: "Glicose", valor: "negativo", referencia: "negativo" },
      { nome: "Corpos cetónicos", valor: "negativo", referencia: "negativo" },
      { nome: "Bilirrubina", valor: "negativo", referencia: "negativo" },
      { nome: "Urobilinogénio", valor: "0,2", unidade: "mg/dL", referencia: "0,1 – 1,0" },
      { nome: "Nitritos", valor: "positivo", referencia: "negativo" },
      { nome: "Hemoglobina", valor: "negativo", referencia: "negativo" },
    ],
  },
  {
    titulo: "Sedimento",
    parametros: [
      { nome: "Leucócitos", valor: "250", unidade: "/µL", referencia: "< 10" },
      { nome: "Eritrócitos", valor: "15", unidade: "/µL", referencia: "< 5" },
      { nome: "Células epiteliais", valor: "raras", referencia: "raras" },
      { nome: "Cilindros", valor: "ausentes", referencia: "ausentes" },
      { nome: "Cristais", valor: "ausentes", referencia: "ausentes" },
    ],
  },
];

const resumoUrina = computed(() =>
  resumirNiveis(
    urinaII.flatMap((g) => g.parametros.map((p) => ({ ...p, exame: "Urina II", rotulo: p.nome }))),
  ),
);
</script>
