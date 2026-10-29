<template>
  <div class="an-wrap">

    <div v-if="!examItems.length" class="an-empty">
      <q-icon name="las la-flask" size="32px" style="color:var(--text-disabled)" />
      <span>Nenhum exame solicitado</span>
    </div>

    <div v-for="item in examItems" :key="item.id" class="an-card">
      <!-- Card header -->
      <div class="an-card-head">
        <span class="an-exam-name">{{ item.examName }}</span>
        <span v-if="!item.paid" class="an-badge an-badge--pending">
          <q-icon name="las la-clock" size="11px" />
          Aguardando faturação
        </span>
        <span v-else class="an-badge an-badge--paid">
          <q-icon name="las la-check" size="11px" />
          Faturado
        </span>
      </div>

      <!-- Locked -->
      <div v-if="!item.paid" class="an-locked">
        <q-icon name="las la-lock" size="20px" style="color:var(--text-disabled)" />
        <span>O laboratório só pode preencher após faturação</span>
      </div>

      <!-- Structured form (has subItens) -->
      <div v-else-if="item.fields.length" class="an-form">
        <template v-for="(f, fi) in item.fields" :key="fi">

          <div v-if="f.input === 'SECTION'" class="an-section">
            <q-icon name="las la-layer-group" size="12px" style="color: var(--st-purple)" />
            {{ f.label }}
          </div>

          <div v-else class="an-field-row">
            <div class="an-field-label">
              {{ f.label }}
              <span v-if="f.unit" class="an-unit">{{ f.unit }}</span>
            </div>
            <div class="an-field-input">
              <span v-if="readonly" class="an-readonly-val">{{ f.value || '—' }}</span>
              <template v-else>
                <select v-if="f.input === 'SELECT'" v-model="f.value" class="an-select">
                  <option value="" disabled>— Seleccionar —</option>
                  <option v-for="opt in f.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <input
                  v-else
                  v-model="f.value"
                  class="an-input"
                  :placeholder="f.reference || ''"
                />
              </template>
            </div>
            <div v-if="f.reference" class="an-ref">Ref: {{ f.reference }}</div>
          </div>

        </template>

        <div class="an-conclusion">
          <span class="an-field-label">Conclusão</span>
          <div v-if="readonly" class="an-conc-row">
            <span class="conc-btn" :class="item.resultColor === 'GREEN' ? 'conc-btn--green' : item.resultColor === 'RED' ? 'conc-btn--red' : ''">
              {{ item.resultColor === 'GREEN' ? 'Normal' : item.resultColor === 'RED' ? 'Alterado' : '—' }}
            </span>
          </div>
          <div v-else class="an-conc-row">
            <button
              class="conc-btn"
              :class="item.resultColor === 'GREEN' && 'conc-btn--green'"
              @click="item.resultColor = 'GREEN'"
            >Normal</button>
            <button
              class="conc-btn"
              :class="item.resultColor === 'RED' && 'conc-btn--red'"
              @click="item.resultColor = 'RED'"
            >Alterado</button>
          </div>
        </div>
      </div>

      <!-- Fallback: no structured form -->
      <div v-else class="an-form">
        <div class="an-field-row">
          <div class="an-field-label">Resultado</div>
          <div v-if="readonly" class="an-readonly-val" style="font-size: var(--fs-body); white-space:pre-wrap">{{ item.resultText || '—' }}</div>
          <textarea
            v-else
            v-model="item.resultText"
            class="an-textarea"
            rows="3"
            placeholder="Descreva o resultado…"
          />
        </div>
        <div class="an-conclusion">
          <span class="an-field-label">Conclusão</span>
          <div v-if="readonly" class="an-conc-row">
            <span class="conc-btn" :class="item.resultColor === 'GREEN' ? 'conc-btn--green' : item.resultColor === 'RED' ? 'conc-btn--red' : ''">
              {{ item.resultColor === 'GREEN' ? 'Normal' : item.resultColor === 'RED' ? 'Alterado' : '—' }}
            </span>
          </div>
          <div v-else class="an-conc-row">
            <button
              class="conc-btn"
              :class="item.resultColor === 'GREEN' && 'conc-btn--green'"
              @click="item.resultColor = 'GREEN'"
            >Normal</button>
            <button
              class="conc-btn"
              :class="item.resultColor === 'RED' && 'conc-btn--red'"
              @click="item.resultColor = 'RED'"
            >Alterado</button>
          </div>
        </div>
      </div>

      <!-- Consumo — num accordion para não pesar na leitura do formulário.
           Pré-preenchido pela receita, editável; a quantidade que ficar é a
           que desconta do stock ao guardar. -->
      <q-expansion-item
        v-if="item.paid"
        dense
        class="an-consumo-acc"
        header-class="an-consumo-header"
      >
        <template #header>
          <div class="an-consumo-head">
            <q-icon name="las la-flask" size="13px" />
            <span class="an-consumo-lbl">Consumo do exame</span>
            <span v-if="item.materials.length" class="an-consumo-count">{{ item.materials.length }}</span>
          </div>
        </template>

        <div class="an-consumo">
          <div v-if="item.materials.length" class="an-consumo-list">
            <div v-for="mat in item.materials" :key="mat.productId" class="an-consumo-row">
              <span class="an-consumo-name">{{ mat.name }}</span>
              <span v-if="readonly" class="an-consumo-ro">×{{ mat.quantity }}</span>
              <div v-else class="an-consumo-qty">
                <button class="an-consumo-btn" @click="mat.quantity = Math.max(0, +(mat.quantity - stepFor(mat)).toFixed(3))">−</button>
                <input
                  v-model.number="mat.quantity"
                  type="number" min="0" :step="stepFor(mat)"
                  class="an-consumo-input"
                  @input="mat.quantity = Math.max(0, mat.quantity || 0)"
                />
                <button class="an-consumo-btn" @click="mat.quantity = +(mat.quantity + stepFor(mat)).toFixed(3)">+</button>
                <span class="an-consumo-unit">{{ mat.unit || 'un' }}</span>
              </div>
            </div>
          </div>
          <div v-else class="an-consumo-vazio">
            Sem consumo padrão definido — configure em Serviços › Consumo padrão
          </div>
        </div>
      </q-expansion-item>
    </div>

    <div v-if="hasPaid && !readonly" class="an-footer">
      <q-btn
        unelevated no-caps
        label="Guardar resultados"
        icon="las la-save"
        color="primary"
        :loading="saving"
        style="border-radius: var(--r-sm); font-size: var(--fs-body)"
        @click="onSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCreateUpdate } from "src/composables/create-update";
import { showNotify } from "src/utils/notify";
import { api } from "src/boot/axios";

const props = defineProps({
  requestExams:   { type: Array,   default: () => [] },
  consultationId: { type: String,  default: null },
  readonly:       { type: Boolean, default: false },
});

const emit = defineEmits(["saved"]);

const route  = useRoute();
const router = useRouter();
const { create } = useCreateUpdate("request-exams");
const saving = ref(false);

/* Build reactive exam items from requestExams prop */
const examItems = reactive([]);

const buildItems = (list) => {
  examItems.splice(0, examItems.length);
  for (const req of list) {
    const service   = req.exam;              // Service model
    const formDef   = service?.exam;         // Exam form definition (may be null)
    const subItens  = Array.isArray(formDef?.subItens) ? formDef.subItens : [];

    /* Build reactive fields from subItens, adding a `value` prop */
    const fields = subItens.map((f) => ({
      input:     f.input ?? "TEXT",
      label:     f.label ?? "",
      unit:      f.unit  ?? "",
      reference: f.reference ?? "",
      options:   Array.isArray(f.options) ? [...f.options] : [],
      value:     "",
    }));

    /* Pre-fill from saved result — match by label to avoid offset from section items */
    const saved = Array.isArray(req.result) ? req.result : [];
    if (saved.length) {
      const savedMap = Object.fromEntries(saved.map((s) => [s.label, s.value ?? ""]));
      fields.forEach((f) => {
        if (f.input !== "SECTION" && f.label in savedMap) f.value = savedMap[f.label];
      });
    }

    examItems.push({
      id:          req.id,
      paid:        req.paid,
      examName:    service?.name ?? "—",
      fields,
      resultColor: req.resultColor ?? null,
      resultText:  req.resultText  ?? "",
      // Consumo: se a requisição já foi guardada, mostra o que foi realmente
      // usado (materialsUsed); caso contrário, pré-preenche pelo padrão da
      // receita (service.consumables).
      materials:   Array.isArray(req.materialsUsed) && req.materialsUsed.length
        ? req.materialsUsed.map((m) => ({
            productId: m.productId,
            name:      m.name ?? "—",
            unit:      m.unit ?? "un",
            quantity:  Number(m.quantity) || 0,
          }))
        : (service?.consumables ?? []).map((m) => ({
            productId: m.consumable.id,
            name:      m.consumable.name,
            unit:      m.consumable.unit?.abbreviation ?? "un",
            quantity:  Number(m.quantity) || 1,
          })),
    });
  }
};

watch(() => props.requestExams, buildItems, { immediate: true });

const hasPaid = computed(() => examItems.some((i) => i.paid));

// Passo do incremento: itens fraccionários (reagentes por rendimento, ex. 0,02)
// afinam-se ao milésimo; os inteiros somam de 1 em 1.
const stepFor = (mat) => (Number.isInteger(mat.quantity) ? 1 : 0.001);

const onSubmit = async () => {
  saving.value = true;
  try {
    const consultationId = props.consultationId ?? route.params.medicalConsultationId ?? null;
    const payload = examItems
      .filter((i) => i.paid)
      .map((i) => ({
        id:             i.id,
        consultationId,
        resultColor:    i.resultColor ?? "GREEN",
        resultText:     i.resultText || i.fields.filter((f) => f.input !== "SECTION" && f.value).map((f) => `${f.label}: ${f.value}`).join(" | "),
        result:         i.fields.filter((f) => f.input !== "SECTION").map((f) => ({ label: f.label, value: f.value, unit: f.unit, reference: f.reference })),
        // Lista completa (inclui os postos a 0), para o registo do consumo
        // reflectir exactamente o que ficou. O stock ignora os 0 no backend.
        materials:      i.materials.filter((m) => m.productId),
      }));

    await create(payload);
    showNotify("Resultados guardados", true);
    emit("saved");
  } catch (_) {
    showNotify("Erro ao guardar resultados", false);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.an-wrap {
  // Duas colunas em ecrãs largos; uma quando não há espaço. align-items:start
  // impede que um cartão curto estique até à altura do vizinho.
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  align-items: start;
  gap: 16px;
  width: 100%;
}

// O estado vazio e o rodapé atravessam as duas colunas
.an-empty,
.an-footer { grid-column: 1 / -1; }

.an-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 48px 0; color: var(--text-faint); font-size: var(--fs-body); line-height: var(--lh-body);
}

/* Card */
.an-card {
  background: var(--surface); border-radius: var(--r-control); border: 1px solid var(--border); overflow: hidden;
}
.an-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; background: var(--surface-2); border-bottom: 1px solid var(--border-soft);
}
.an-exam-name {
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.4px;
}
.an-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; padding: 3px 10px; border-radius: var(--r-pill);
}
.an-badge--pending { color: var(--chip-warn); background: rgba(237,137,54,0.1); border: 1px solid rgba(237,137,54,0.3); }
.an-badge--paid    { color: var(--chip-ok); background: rgba(50,185,137,0.08); border: 1px solid rgba(50,185,137,0.3); }

/* Locked */
.an-locked {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 28px 16px; color: var(--text-faint); font-size: var(--fs-label); line-height: var(--lh-tight); text-align: center;
}

/* Form */
.an-form { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }

.an-section {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--st-purple-text);
  text-transform: uppercase; letter-spacing: 0.8px;
  padding: 6px 10px; background: var(--st-purple-tint); border-radius: var(--r-sm);
  margin-top: 4px;
}

.an-field-row { display: flex; flex-direction: column; gap: 4px; padding-left: 4px; }
.an-field-label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted);
  display: flex; align-items: center; gap: 6px;
}
.an-unit { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); font-weight: 400; background: var(--border); padding: 1px 6px; border-radius: var(--r-sm); }
.an-ref  { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

.an-readonly-val { font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 600; color: var(--text-2); padding: 4px 0; }
.an-field-input { display: flex; }
.an-input {
  flex: 1; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 6px 10px; font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-2);
  font-family: inherit; outline: none; background: var(--surface);
  transition: border-color 0.12s;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: var(--st-info); }
}
.an-select {
  flex: 1; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 6px 10px; font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-2);
  font-family: inherit; outline: none; background: var(--surface); cursor: pointer;
  &:focus { border-color: var(--st-info); }
}
.an-textarea {
  flex: 1; width: 100%; border: 1.5px solid var(--border-strong); border-radius: var(--r-sm);
  padding: 8px 10px; font-size: var(--fs-body); color: var(--text-2); font-family: inherit;
  outline: none; resize: vertical; line-height: 1.5;
  &::placeholder { color: var(--text-disabled); }
  &:focus { border-color: var(--st-info); }
}

/* Conclusion */
.an-conclusion { display: flex; align-items: center; gap: 12px; padding-top: 4px; border-top: 1px solid var(--surface-3); }
.an-conc-row   { display: flex; gap: 8px; }
.conc-btn {
  padding: 5px 18px; border-radius: var(--r-pill); font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600;
  border: 1.5px solid var(--border-strong); background: var(--surface-3); color: var(--text-muted);
  cursor: pointer; transition: all 0.12s;
  &:hover { border-color: #cbd5e0; }
}
.conc-btn--green { background: rgba(50,185,137,0.1); border-color: var(--st-ok); color: var(--chip-ok); }
.conc-btn--red   { background: rgba(229,62,62,0.1);  border-color: var(--st-danger); color: var(--danger); }

/* Footer */
.an-footer { padding-top: 4px; }

/* Consumo (accordion) */
.an-consumo-acc {
  border-top: 1px dashed var(--border);
}
.an-consumo-acc :deep(.an-consumo-header) {
  padding: 8px 16px;
  min-height: unset;
}
.an-consumo-head {
  display: flex; align-items: center; gap: 6px;
  color: var(--text-muted);
}
.an-consumo-lbl {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
}
.an-consumo-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 17px; height: 17px; padding: 0 4px; border-radius: var(--r-sm);
  background: var(--surface-3); border: 1px solid var(--border-strong);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--text-muted);
}
.an-consumo {
  padding: 2px 16px 12px;
}
.an-consumo-list { display: flex; flex-direction: column; gap: 5px; }
.an-consumo-row {
  display: flex; align-items: center; gap: 10px;
}
.an-consumo-name { flex: 1; min-width: 0; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.an-consumo-ro { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-3); }

.an-consumo-qty {
  display: flex; align-items: center; gap: 0; flex-shrink: 0;
  background: var(--surface-3); border: 1px solid var(--border-strong);
  border-radius: var(--r-sm); overflow: hidden;
}
.an-consumo-btn {
  width: 24px; height: 26px; border: none; background: transparent;
  font-size: var(--fs-title); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted); cursor: pointer;
  transition: background .12s, color .12s;
  &:hover { background: var(--border); color: var(--text); }
}
.an-consumo-input {
  width: 46px; height: 26px; text-align: center; border: none; outline: none;
  background: transparent; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
  -moz-appearance: textfield;
  &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
}
.an-consumo-unit {
  padding: 0 8px 0 4px; font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-faint);
  border-left: 1px solid var(--border);
}
.an-consumo-vazio { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); font-style: italic; }
</style>
