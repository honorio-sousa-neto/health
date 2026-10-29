<template>
  <div class="pe">

    <div class="pe-topo">
      <div class="pe-intro">
        <h3 class="pe-titulo">Parâmetros de exame</h3>
        <p class="pe-sub">
          Os campos que o laboratório preenche ao lançar o resultado. O intervalo
          de referência é o que marca um valor como alterado — sem ele, o valor
          é registado mas nunca assinalado.
        </p>
      </div>

      <div class="pe-topo__accoes">
        <q-btn flat no-caps dense icon="las la-layer-group" label="Secção" class="btn-icone" @click="addSection" />
        <q-btn flat no-caps dense icon="las la-plus" label="Parâmetro" class="btn-icone" @click="addField" />
      </div>
    </div>

    <div v-if="fields.length" class="pe-tabela-wrap">
      <table class="pe-tabela">
        <thead>
          <tr>
            <th class="pe-c pe-c--n" scope="col">#</th>
            <th class="pe-c" scope="col">Parâmetro</th>
            <th class="pe-c pe-c--un" scope="col">Unidade</th>
            <th class="pe-c pe-c--ref" scope="col">Valores de referência</th>
            <th class="pe-c pe-c--tipo" scope="col">Tipo</th>
            <th class="pe-c pe-c--rm" scope="col"><span class="sr-only">Remover</span></th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(campo, i) in fields" :key="campo._key">

            <!-- Secção: uma faixa que atravessa a tabela, porque é o que ela
                 faz na folha de resultados — separa, não descreve um valor. -->
            <tr v-if="campo.input === 'SECTION'" class="pe-seccao">
              <td class="pe-c pe-c--n"><q-icon name="las la-layer-group" size="14px" /></td>
              <td class="pe-c" colspan="4">
                <input v-model="campo.label" class="pe-campo pe-campo--seccao" placeholder="Nome da secção…" />
              </td>
              <td class="pe-c pe-c--rm">
                <button class="pe-rm" aria-label="Remover secção" @click="removeField(i)">
                  <q-icon name="las la-times" size="14px" />
                </button>
              </td>
            </tr>

            <!-- Parâmetro -->
            <tr v-else class="pe-linha">
              <td class="pe-c pe-c--n">{{ fieldIndex(i) }}</td>

              <td class="pe-c">
                <input v-model="campo.label" class="pe-campo" placeholder="Nome do parâmetro" />
              </td>

              <td class="pe-c pe-c--un">
                <input
                  v-model="campo.unit"
                  class="pe-campo"
                  list="pe-unidades"
                  placeholder="g/dL"
                  :aria-label="`Unidade de ${campo.label || 'parâmetro'}`"
                />
              </td>

              <td class="pe-c pe-c--ref">
                <input
                  v-model="campo.reference"
                  class="pe-campo"
                  :class="{ 'pe-campo--avisa': !referenciaValida(campo) }"
                  placeholder="12,0 – 16,0"
                  :aria-label="`Valores de referência de ${campo.label || 'parâmetro'}`"
                />
                <!-- A consequência invisível: uma referência que o
                     `parseReference` não lê nunca marca desvios. -->
                <span v-if="!referenciaValida(campo)" class="pe-aviso">
                  Não será usada para marcar desvios.
                  <q-tooltip>
                    Formatos reconhecidos: 12 – 16 · &lt; 50 · ≥ 10 · 4.000 - 11.000
                  </q-tooltip>
                </span>
              </td>

              <td class="pe-c pe-c--tipo">
                <select v-model="campo.input" class="pe-campo" :aria-label="`Tipo de ${campo.label || 'parâmetro'}`">
                  <option value="TEXT">Texto</option>
                  <option value="SELECT">Selecção</option>
                </select>

                <div v-if="campo.input === 'SELECT'" class="pe-opcoes">
                  <span v-for="(opt, oi) in campo.options" :key="oi" class="pe-opcao">
                    {{ opt }}
                    <button class="pe-opcao__rm" :aria-label="`Remover ${opt}`" @click="removeOption(campo, oi)">
                      <q-icon name="las la-times" size="10px" />
                    </button>
                  </span>
                  <input
                    v-model="campo._optionDraft"
                    class="pe-campo pe-campo--opcao"
                    placeholder="Opção, Enter para juntar"
                    @keydown.enter.prevent="addOption(campo)"
                  />
                </div>
              </td>

              <td class="pe-c pe-c--rm">
                <button class="pe-rm" :aria-label="`Remover ${campo.label || 'parâmetro'}`" @click="removeField(i)">
                  <q-icon name="las la-times" size="14px" />
                </button>
              </td>
            </tr>

          </template>
        </tbody>
      </table>
    </div>

    <p v-else class="pe-vazio">
      Nenhum parâmetro definido. Acrescente secções e parâmetros que o
      laboratório vai preencher ao lançar o resultado.
    </p>

    <!-- Unidades já usadas neste formulário, para não se escreverem duas
         grafias da mesma coisa em parâmetros vizinhos. -->
    <datalist id="pe-unidades">
      <option v-for="u in unidadesUsadas" :key="u" :value="u" />
    </datalist>

    <div class="pe-accoes">
      <span v-if="fields.length" class="pe-contagem">
        {{ totalParametros }} {{ totalParametros === 1 ? "parâmetro" : "parâmetros" }}
        <template v-if="totalSeccoes">
          · {{ totalSeccoes }} {{ totalSeccoes === 1 ? "secção" : "secções" }}
        </template>
      </span>
      <q-space />
      <q-btn
        unelevated no-caps
        icon="las la-save"
        label="Guardar formulário"
        class="btn-primaria"
        :loading="saving"
        @click="save"
      />
    </div>

  </div>
</template>

<script setup>
/**
 * O construtor da folha de resultados de um exame.
 *
 * Era uma coluna estreita ao lado do formulário, com cada parâmetro em duas
 * linhas — nome e tipo em cima, unidade e referência por baixo — e dois
 * botões de guardar, um no topo e outro no fim. Passa a tabela, na largura
 * toda da aba, com um parâmetro por linha e uma acção de guardar.
 *
 * ── A referência ─────────────────────────────────────────────────────────
 *
 * É o campo que decide se um valor é assinalado como alterado: o
 * `examReference.parseReference` lê-o e o `severidadeClinica` decide a partir
 * dele. Uma referência que ele não consiga ler não dá erro — simplesmente
 * nunca marca nada, e quem escreveu fica a pensar que marcou.
 *
 * Por isso o campo diz quando não vai ser usada. É o mesmo princípio da
 * coluna "dá baixa de" no consumo padrão: a consequência de uma escolha tem
 * de ser visível no momento em que se faz a escolha.
 */
import { api } from "src/boot/axios";
import { computed, onMounted, reactive, ref } from "vue";
import { showNotify } from "src/utils/notify";
import { parseReference } from "src/utils/examReference";

const props = defineProps({
  productId: { type: String, required: true },
  productName: { type: String, default: "" },
  exam: { type: Object, default: null },
});

const saving = ref(false);
const examId = ref(null);
const fields = reactive([]);

let _key = 0;

const newSection = () => ({ _key: ++_key, input: "SECTION", label: "" });

const newField = () => ({
  _key: ++_key,
  _optionDraft: "",
  label: "",
  unit: "",
  reference: "",
  input: "TEXT",
  options: [],
});

const addSection = () => fields.push(newSection());
const addField = () => fields.push(newField());
const removeField = (i) => fields.splice(i, 1);

/** Numeração que conta só parâmetros, saltando as secções. */
const fieldIndex = (i) => {
  let n = 0;
  for (let j = 0; j <= i; j++) if (fields[j].input !== "SECTION") n++;
  return n;
};

const totalParametros = computed(() => fields.filter((f) => f.input !== "SECTION").length);
const totalSeccoes = computed(() => fields.filter((f) => f.input === "SECTION").length);

const unidadesUsadas = computed(() =>
  [...new Set(fields.map((f) => (f.unit ?? "").trim()).filter(Boolean))].sort(),
);

/**
 * Vazia é válida — nem todo o parâmetro tem intervalo, e um resultado
 * qualitativo ("negativo") não precisa de um. O aviso é para o que foi
 * escrito com intenção de servir e não serve.
 */
const referenciaValida = (campo) => {
  const texto = (campo.reference ?? "").trim();
  if (!texto) return true;
  return parseReference(texto) !== null;
};

const addOption = (campo) => {
  const v = (campo._optionDraft ?? "").trim();
  if (v && !campo.options.includes(v)) campo.options.push(v);
  campo._optionDraft = "";
};
const removeOption = (campo, i) => campo.options.splice(i, 1);

const toPayload = () =>
  fields.map(({ _key, _optionDraft, ...f }) => {
    if (f.input === "SECTION") return { input: "SECTION", label: f.label };
    return { ...f, options: f.input === "SELECT" ? f.options : [] };
  });

const save = async () => {
  const temCampo = fields.some((f) => f.input !== "SECTION" && f.label.trim());
  if (!temCampo) {
    showNotify("Dê nome a pelo menos um parâmetro antes de guardar.", false);
    return;
  }
  saving.value = true;
  try {
    const subItens = toPayload();
    let res;
    if (examId.value) {
      res = await api.patch(`exams/${examId.value}`, { subItens });
    } else {
      res = await api.post("exams", {
        name: props.productName,
        serviceId: props.productId,
        subItens,
        isHeader: false,
        input: "TEXT",
      });
      examId.value = res.data?.data?.id;
    }
    showNotify(res.data?.message ?? "Formulário guardado", res.data?.success ?? true);
  } catch (_) {
    showNotify("Não foi possível guardar o formulário. Tente de novo.", false);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (!props.exam) return;
  examId.value = props.exam.id;
  for (const item of props.exam.subItens ?? []) {
    if (item.input === "SECTION") {
      fields.push({ _key: ++_key, input: "SECTION", label: item.label ?? "" });
    } else {
      fields.push({
        _key: ++_key,
        _optionDraft: "",
        label: item.label ?? "",
        unit: item.unit ?? "",
        reference: item.reference ?? "",
        input: item.input ?? "TEXT",
        options: Array.isArray(item.options) ? [...item.options] : [],
      });
    }
  }
});
</script>
