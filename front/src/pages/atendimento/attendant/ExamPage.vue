<template>
  <div class="ep-wrap">

    <!-- Header -->
    <div class="ep-header">
      <div>
        <div class="ep-title">
          <q-icon name="las la-file-medical" size="18px" style="color: var(--st-info)" />
          Pedidos do médico
        </div>
        <div class="ep-sub">Faturação pendente · actualiza em tempo real</div>
      </div>
      <q-btn
        unelevated no-caps
        icon="las la-history"
        label="Histórico"
        color="grey-2"
        text-color="grey-7"
        style="border-radius: var(--r-sm); font-size: var(--fs-label)"
        :to="{ name: 'historico-pedidos-exame' }"
      />
    </div>

    <!-- External patients -->
    <div class="ep-section">
      <div class="ep-section-hd">
        <div class="ep-section-title">
          <q-icon name="las la-user-circle" size="14px" style="color: var(--st-teal)" />
          Exames externos
        </div>
      </div>
      <ExternalExamsList />
    </div>

    <!-- Lab exams -->
    <div class="ep-section">
      <div class="ep-section-hd">
        <div class="ep-section-title">
          <q-icon name="las la-flask" size="14px" style="color: var(--st-info)" />
          Exames de laboratório
        </div>
      </div>
      <ExamsListRequested />
    </div>

    <!-- Observations -->
    <div class="ep-section">
      <div class="ep-section-hd">
        <div class="ep-section-title">
          <q-icon name="las la-procedures" size="14px" style="color: var(--st-warn)" />
          Observações
        </div>
      </div>
      <ObservationRequests />
    </div>

    <!-- Prescriptions -->
    <div class="ep-section">
      <div class="ep-section-hd">
        <div class="ep-section-title">
          <q-icon name="las la-pills" size="14px" style="color: var(--st-purple)" />
          Receitas médicas
        </div>
      </div>
      <PrescriptionRequests />
    </div>

    <!-- Ambulatory -->
    <div class="ep-section">
      <div class="ep-section-hd">
        <div class="ep-section-title">
          <q-icon name="las la-walking" size="14px" style="color: var(--st-ok)" />
          Ambulatório
        </div>
      </div>
      <AmbulatoryRequests />
    </div>

  </div>
</template>

<script setup>
import ObservationRequests from "./ObservationRequests.vue";
import PrescriptionRequests from "./PrescriptionRequests.vue";
import ExamsListRequested from "./ExamsListRequested.vue";
import AmbulatoryRequests from "./AmbulatoryRequests.vue";
import ExternalExamsList from "./ExternalExamsList.vue";
</script>

<style scoped lang="scss">
.ep-wrap {
  display: flex; flex-direction: column; gap: 28px;
  padding: 20px 24px; min-height: 100%;
}

.ep-header {
  display: flex; align-items: center; justify-content: space-between;
}
.ep-title {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--fs-section); line-height: var(--lh-tight); font-weight: 700; color: var(--text);
}
.ep-sub { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); margin-top: 3px; margin-left: 26px; }

.ep-section { display: flex; flex-direction: column; gap: 12px; }
.ep-section-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 8px; border-bottom: 1.5px solid var(--border);
}
.ep-section-title {
  display: flex; align-items: center; gap: 7px;
  font-size: var(--fs-body); line-height: var(--lh-body); font-weight: 700; color: var(--text-2);
}
</style>
