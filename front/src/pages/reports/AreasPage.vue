<template>
  <PaginaRelatorio
    titulo="Relatórios por área"
    :contexto="contexto"
    :apoio="apoio"
    :carregando="loading"
    :vazio="!reportData"
    texto-vazio="Escolha a área e o período, e gere o relatório."
    @recarregar="fetchReport"
  >
    <template #accoes>
      <select v-model="activeArea" class="lp-filtro" aria-label="Área" @change="selectArea(activeArea)">
        <option v-for="area in availableAreas" :key="area.key" :value="area.key">
          {{ area.label }}
        </option>
      </select>

      <select v-model="period" class="lp-filtro" aria-label="Período">
        <option value="daily">Diário</option>
        <option value="monthly">Mensal</option>
      </select>

      <input
        v-if="period === 'daily'"
        v-model="selectedDate"
        type="date"
        class="lp-filtro"
        aria-label="Data"
      />
      <template v-else>
        <select v-model="selectedMonth" class="lp-filtro" aria-label="Mês">
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <input
          v-model.number="selectedYear"
          type="number"
          class="lp-filtro rpt-ano"
          aria-label="Ano"
        />
      </template>

      <q-btn
        v-if="reportData"
        flat no-caps
        icon="las la-file-pdf"
        label="Exportar PDF"
        class="btn-icone"
        :loading="exportingPdf"
        @click="exportPdf"
      />

      <q-btn
        unelevated no-caps
        label="Gerar"
        class="btn-primaria"
        :loading="loading"
        @click="fetchReport"
      />
    </template>

    <template v-if="reportData">


      <!-- ════════════════════════════════════════════ RECEPÇÃO ═══ -->
      <template v-if="activeArea === 'recepcao'">
        <div class="rpt-form q-mb-md">
          <div class="rpt-form__head" style="--c:#3b82f6">
            <q-icon name="las la-user-check" size="16px" style="color: var(--st-info)" />
            <span>RECEPÇÃO</span>
            <div class="rpt-form__total" style="background: var(--st-info-tint);color: var(--st-info-text)">{{ reportData.total }} pacientes</div>
          </div>
          <div class="rpt-form__body">

            <div class="rpt-group">
              <div class="rpt-group__label">Estado dos atendimentos</div>
              <div class="rpt-tiles">
                <div class="rpt-tile" v-for="s in recepcaoStatusTiles" :key="s.key">
                  <div class="rpt-tile__val">{{ reportData.byStatus?.[s.key] ?? 0 }}</div>
                  <div class="rpt-tile__key">{{ s.label }}</div>
                </div>
              </div>
            </div>

            <div class="rpt-group">
              <div class="rpt-group__label">Proveniência</div>
              <div class="rpt-tiles">
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.byProveniencia?.particular ?? 0 }}</div>
                  <div class="rpt-tile__key">Particular</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.byProveniencia?.seguro ?? 0 }}</div>
                  <div class="rpt-tile__key">Seguro</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.byProveniencia?.protocolo ?? 0 }}</div>
                  <div class="rpt-tile__key">Protocolo</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.byProveniencia?.parceria ?? 0 }}</div>
                  <div class="rpt-tile__key">Parceria</div>
                </div>
                <div class="rpt-tile rpt-tile--editable">
                  <input v-model.number="manual.livre" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">Livre</div>
                </div>
                <div class="rpt-tile rpt-tile--editable">
                  <input v-model.number="manual.medicos" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">Médicos</div>
                </div>
              </div>
            </div>

            <div class="rpt-group">
              <div class="rpt-group__label">Comentários</div>
              <textarea v-model="comments.recepcao" class="rpt-textarea" placeholder="—" rows="2" />
            </div>

          </div>
        </div>

        <!-- Items list -->
        <div class="report-list-card">
          <div class="report-list-head">
            <span>Referência</span><span>Paciente</span><span>Serviço</span><span>Recepcionista</span><span>Estado</span><span>Data / Hora</span>
          </div>
          <div v-if="!reportData.items.length" class="report-empty">Nenhum atendimento no período</div>
          <div v-for="(row, i) in reportData.items" :key="row.id" class="report-row" :class="{ 'report-row--alt': i % 2 !== 0 }">
            <span class="report-row__cell report-row__cell--bold">{{ row.reference }}</span>
            <span class="report-row__cell">{{ row.customer?.name ?? '—' }}</span>
            <span class="report-row__cell c-grey">{{ row.service?.name ?? '—' }}</span>
            <span class="report-row__cell c-grey">{{ row.receptionist?.name ?? '—' }}</span>
            <span class="report-row__cell">
              <span class="lp-estado" :class="`lp-estado--${statusTom(row.status)}`"><span class="lp-estado__ponto" />{{ statusLabel(row.status) }}</span>
            </span>
            <span class="report-row__cell report-row__cell--date">{{ fmtDate(row.createdAt) }}</span>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════════ CONSULTÓRIO ═ -->
      <template v-else-if="activeArea === 'consultorio'">
        <div class="rpt-form q-mb-md">
          <div class="rpt-form__head" style="--c:#8b5cf6">
            <q-icon name="las la-stethoscope" size="16px" style="color: var(--st-purple)" />
            <span>CONSULTÓRIO</span>
            <div class="rpt-form__total" style="background: var(--st-purple-tint);color: var(--st-purple-text)">{{ reportData.total }} consultas</div>
          </div>
          <div class="rpt-form__body">

            <div class="rpt-group">
              <div class="rpt-group__label">Resumo</div>
              <div class="rpt-tiles">
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.total }}</div>
                  <div class="rpt-tile__key">Total</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.withScreening }}</div>
                  <div class="rpt-tile__key">Com triagem</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.byDoctor?.length ?? 0 }}</div>
                  <div class="rpt-tile__key">Médicos activos</div>
                </div>
              </div>
            </div>

            <div class="rpt-group">
              <div class="rpt-group__label">Tipo de consulta (preenchimento manual)</div>
              <div class="rpt-tiles">
                <div class="rpt-tile rpt-tile--editable" v-for="f in consultaTipos" :key="f.key">
                  <input v-model.number="manual[f.key]" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">{{ f.label }}</div>
                </div>
              </div>
            </div>

            <div v-if="reportData.byDoctor?.length" class="rpt-group">
              <div class="rpt-group__label">Por médico</div>
              <div class="doctor-list">
                <div v-for="d in reportData.byDoctor" :key="d.name" class="doctor-row">
                  <div class="doctor-row__avatar"><q-icon name="las la-user-md" size="13px" style="color: var(--st-purple)" /></div>
                  <span class="doctor-row__name">{{ d.name }}</span>
                  <div class="doctor-row__bar-wrap"><div class="doctor-row__bar" :style="{ transform: `scaleX(${reportData.total ? d.count / reportData.total : 0})` }" /></div>
                  <span class="doctor-row__count">{{ d.count }}</span>
                </div>
              </div>
            </div>

            <div class="rpt-group">
              <div class="rpt-group__label">Comentários</div>
              <textarea v-model="comments.consultas" class="rpt-textarea" placeholder="—" rows="2" />
            </div>

          </div>
        </div>

        <div class="report-list-card">
          <div class="report-list-head"><span>Paciente</span><span>NIF</span><span>Médico</span><span>Triagem</span><span>Data / Hora</span></div>
          <div v-if="!reportData.items.length" class="report-empty">Nenhuma consulta no período</div>
          <div v-for="(row, i) in reportData.items" :key="row.id" class="report-row" :class="{ 'report-row--alt': i % 2 !== 0 }">
            <span class="report-row__cell report-row__cell--bold">{{ row.screening?.customer?.name ?? '—' }}</span>
            <span class="report-row__cell c-grey">{{ row.screening?.customer?.nif ?? '—' }}</span>
            <span class="report-row__cell">{{ row.doctor?.name ?? 'Sem médico' }}</span>
            <span class="report-row__cell">
              <span class="lp-estado" :class="row.screening ? 'lp-estado--ok' : 'lp-estado--neutro'"><span class="lp-estado__ponto" />{{ row.screening ? "Feita" : "Por fazer" }}</span>
            </span>
            <span class="report-row__cell report-row__cell--date">{{ fmtDate(row.createdAt) }}</span>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════════ LABORATÓRIO ═ -->
      <template v-else-if="activeArea === 'laboratorio'">
        <div class="rpt-form q-mb-md">
          <div class="rpt-form__head" style="--c:#06b6d4">
            <q-icon name="las la-flask" size="16px" style="color: var(--st-teal)" />
            <span>LABORATÓRIO</span>
            <div class="rpt-form__total" style="background: var(--st-teal-tint);color: var(--st-teal-text)">{{ reportData.total }} exames</div>
          </div>
          <div class="rpt-form__body">

            <div class="rpt-group">
              <div class="rpt-group__label">Estado</div>
              <div class="rpt-tiles">
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.total }}</div>
                  <div class="rpt-tile__key">Total</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.done }}</div>
                  <div class="rpt-tile__key">Concluídos</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.pending }}</div>
                  <div class="rpt-tile__key">Pendentes</div>
                </div>
              </div>
            </div>

            <div class="rpt-group">
              <div class="rpt-group__label">Por categoria (preenchimento manual)</div>
              <div class="rpt-tiles">
                <div class="rpt-tile rpt-tile--editable" v-for="f in labCategorias" :key="f.key">
                  <input v-model.number="manual[f.key]" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">{{ f.label }}</div>
                </div>
              </div>
            </div>

            <div class="rpt-2col">
              <div class="rpt-group">
                <div class="rpt-group__label">Reagentes</div>
                <input v-model="manual.reagentes" type="text" class="rpt-text-input" placeholder="—" />
              </div>
              <div class="rpt-group">
                <div class="rpt-group__label">Materiais</div>
                <input v-model="manual.materiais" type="text" class="rpt-text-input" placeholder="—" />
              </div>
            </div>

            <div v-if="reportData.byExam?.length" class="rpt-group">
              <div class="rpt-group__label">Exames mais solicitados</div>
              <div class="exam-bar-list">
                <div v-for="e in reportData.byExam.slice(0, 8)" :key="e.name" class="exam-bar-row">
                  <span class="exam-bar-row__name">{{ e.name }}</span>
                  <div class="exam-bar-row__track"><div class="exam-bar-row__fill" :style="{ transform: `scaleX(${reportData.byExam[0]?.count ? e.count / reportData.byExam[0].count : 0})` }" /></div>
                  <span class="exam-bar-row__count">{{ e.count }}</span>
                </div>
              </div>
            </div>

            <div class="rpt-group">
              <div class="rpt-group__label">Comentários</div>
              <textarea v-model="comments.laboratorio" class="rpt-textarea" placeholder="—" rows="2" />
            </div>

          </div>
        </div>

        <div class="report-list-card">
          <div class="report-list-head"><span>Exame</span><span>Paciente</span><span>Pagamento</span><span>Resultado</span><span>Data / Hora</span></div>
          <div v-if="!reportData.items.length" class="report-empty">Nenhum exame no período</div>
          <div v-for="(row, i) in reportData.items" :key="row.id" class="report-row" :class="{ 'report-row--alt': i % 2 !== 0 }">
            <span class="report-row__cell report-row__cell--bold">{{ row.exam?.name ?? '—' }}</span>
            <span class="report-row__cell">{{ row.customer?.name ?? '—' }}</span>
            <span class="report-row__cell">
              <span class="lp-estado" :class="row.paid ? 'lp-estado--ok' : 'lp-estado--aviso'"><span class="lp-estado__ponto" />{{ row.paid ? "Pago" : "Por pagar" }}</span>
            </span>
            <span class="report-row__cell">
              <span class="lp-estado" :class="row.result ? 'lp-estado--ok' : 'lp-estado--aviso'"><span class="lp-estado__ponto" />{{ row.result ? "Concluído" : "Pendente" }}</span>
            </span>
            <span class="report-row__cell report-row__cell--date">{{ fmtDate(row.createdAt) }}</span>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════════ ENFERMARIA ══ -->
      <template v-else-if="activeArea === 'enfermaria'">
        <div class="rpt-form q-mb-md">
          <div class="rpt-form__head" style="--c:#a855f7">
            <q-icon name="las la-procedures" size="16px" style="color: var(--st-purple)" />
            <span>ENFERMARIA</span>
            <div class="rpt-form__total" style="background: var(--st-purple-tint);color: var(--st-purple-text)">
              {{ (reportData.observations?.total ?? 0) + (reportData.administrations?.total ?? 0) }} registos
            </div>
          </div>
          <div class="rpt-form__body">

            <div class="rpt-group">
              <div class="rpt-group__label">Resumo</div>
              <div class="rpt-tiles">
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.observations?.total ?? 0 }}</div>
                  <div class="rpt-tile__key">Observações</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.administrations?.total ?? 0 }}</div>
                  <div class="rpt-tile__key">Administrações</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">
                    {{ (reportData.observations?.byStatus?.done ?? 0) + (reportData.administrations?.byStatus?.done ?? 0) }}
                  </div>
                  <div class="rpt-tile__key">Concluídos</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">
                    {{ (reportData.observations?.byStatus?.pending ?? 0) + (reportData.administrations?.byStatus?.pending ?? 0) }}
                  </div>
                  <div class="rpt-tile__key">Pendentes</div>
                </div>
              </div>
            </div>

            <div class="rpt-group">
              <div class="rpt-group__label">Comentários</div>
              <textarea v-model="comments.enfermaria" class="rpt-textarea" placeholder="—" rows="2" />
            </div>

          </div>
        </div>

        <!-- Observações list -->
        <div class="report-list-card q-mb-md">
          <div class="report-list-card__title">
            <q-icon name="las la-procedures" size="15px" style="color: var(--st-purple)" /> Observações
          </div>
          <div class="report-list-head"><span>Serviço</span><span>Duração (h)</span><span>Estado</span><span>Data / Hora</span></div>
          <div v-if="!reportData.observations?.items?.length" class="report-empty">Nenhuma observação no período</div>
          <div v-for="(row, i) in reportData.observations?.items ?? []" :key="row.id" class="report-row" :class="{ 'report-row--alt': i % 2 !== 0 }">
            <span class="report-row__cell report-row__cell--bold">{{ row.service?.name ?? '—' }}</span>
            <span class="report-row__cell c-grey">{{ row.duration ?? '—' }}</span>
            <span class="report-row__cell">
              <span class="lp-estado" :class="`lp-estado--${obsStatusTom(row.status)}`"><span class="lp-estado__ponto" />{{ obsStatusLabel(row.status) }}</span>
            </span>
            <span class="report-row__cell report-row__cell--date">{{ fmtDate(row.createdAt) }}</span>
          </div>
        </div>

        <!-- Administrações list -->
        <div class="report-list-card">
          <div class="report-list-card__title">
            <q-icon name="las la-syringe" size="15px" style="color:var(--danger)" /> Administração de Fármacos
          </div>
          <div class="report-list-head"><span>Paciente</span><span>Fármaco</span><span>Enfermeiro/a</span><span>Estado</span><span>Pago</span><span>Data / Hora</span></div>
          <div v-if="!reportData.administrations?.items?.length" class="report-empty">Nenhuma administração no período</div>
          <div v-for="(row, i) in reportData.administrations?.items ?? []" :key="row.id" class="report-row" :class="{ 'report-row--alt': i % 2 !== 0 }">
            <span class="report-row__cell report-row__cell--bold">{{ row.customer?.name ?? '—' }}</span>
            <span class="report-row__cell">{{ row.service?.name ?? '—' }}</span>
            <span class="report-row__cell c-grey">{{ row.nurse?.name ?? '—' }}</span>
            <span class="report-row__cell">
              <span class="lp-estado" :class="`lp-estado--${obsStatusTom(row.status)}`"><span class="lp-estado__ponto" />{{ obsStatusLabel(row.status) }}</span>
            </span>
            <span class="report-row__cell">
              <span class="lp-estado" :class="row.paid ? 'lp-estado--ok' : 'lp-estado--aviso'"><span class="lp-estado__ponto" />{{ row.paid ? "Pago" : "Por pagar" }}</span>
            </span>
            <span class="report-row__cell report-row__cell--date">{{ fmtDate(row.createdAt) }}</span>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════════ GERAL ═══════ -->
      <template v-else-if="activeArea === 'geral'">
        <div class="rpt-general-grid">

          <!-- Recepção -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#3b82f6">
              <q-icon name="las la-user-check" size="15px" style="color: var(--st-info)" />
              <span>RECEPÇÃO</span>
              <div class="rpt-form__total" style="background: var(--st-info-tint);color: var(--st-info-text)">{{ reportData.recepcao?.total ?? 0 }}</div>
            </div>
            <div class="rpt-form__body">
              <div class="rpt-tiles">
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.recepcao?.byProveniencia?.particular ?? 0 }}</div>
                  <div class="rpt-tile__key">Particular</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.recepcao?.byProveniencia?.seguro ?? 0 }}</div>
                  <div class="rpt-tile__key">Seguro</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.recepcao?.byProveniencia?.protocolo ?? 0 }}</div>
                  <div class="rpt-tile__key">Protocolo</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.recepcao?.byProveniencia?.parceria ?? 0 }}</div>
                  <div class="rpt-tile__key">Parceria</div>
                </div>
                <div class="rpt-tile rpt-tile--editable">
                  <input v-model.number="manualGeral.livre" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">Livre</div>
                </div>
                <div class="rpt-tile rpt-tile--editable">
                  <input v-model.number="manualGeral.medicos" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">Médicos</div>
                </div>
              </div>
              <textarea v-model="commentsGeral.recepcao" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Consultas -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#8b5cf6">
              <q-icon name="las la-stethoscope" size="15px" style="color: var(--st-purple)" />
              <span>CONSULTAS</span>
              <div class="rpt-form__total" style="background: var(--st-purple-tint);color: var(--st-purple-text)">{{ reportData.consultas?.total ?? 0 }}</div>
            </div>
            <div class="rpt-form__body">
              <div class="rpt-tiles">
                <div class="rpt-tile rpt-tile--editable" v-for="f in consultaTiposGeral" :key="f.key">
                  <input v-model.number="manualGeral[f.key]" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">{{ f.label }}</div>
                </div>
              </div>
              <textarea v-model="commentsGeral.consultas" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Enfermaria -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#a855f7">
              <q-icon name="las la-procedures" size="15px" style="color: var(--st-purple)" />
              <span>ENFERMARIA</span>
              <div class="rpt-form__total" style="background: var(--st-purple-tint);color: var(--st-purple-text)">
                {{ (reportData.enfermaria?.administrations ?? 0) + (reportData.enfermaria?.observations ?? 0) }}
              </div>
            </div>
            <div class="rpt-form__body">
              <div class="rpt-tiles">
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.enfermaria?.observations ?? 0 }}</div>
                  <div class="rpt-tile__key">Observações</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.enfermaria?.administrations ?? 0 }}</div>
                  <div class="rpt-tile__key">Administrações</div>
                </div>
              </div>
              <textarea v-model="commentsGeral.enfermaria" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Ambulatório -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#14b8a6">
              <q-icon name="las la-walking" size="15px" style="color: var(--st-teal)" />
              <span>AMBULATÓRIO</span>
              <div class="rpt-form__total" style="background: var(--st-teal-tint);color: var(--st-teal-text)">{{ reportData.ambulatorio?.total ?? 0 }}</div>
            </div>
            <div class="rpt-form__body">
              <textarea v-model="commentsGeral.ambulatorio" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Observação -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#0ea5e9">
              <q-icon name="las la-eye" size="15px" style="color: var(--st-info)" />
              <span>OBSERVAÇÃO</span>
              <div class="rpt-form__total" style="background: var(--st-info-tint);color: var(--st-info-text)">{{ reportData.observacao?.total ?? 0 }}</div>
            </div>
            <div class="rpt-form__body">
              <textarea v-model="commentsGeral.observacao" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Internamento -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#ef4444">
              <q-icon name="las la-bed" size="15px" style="color:var(--danger)" />
              <span>INTERNAMENTO</span>
              <div class="rpt-form__total" style="background: var(--st-danger-tint);color:var(--danger)">{{ reportData.internamento?.total ?? 0 }}</div>
            </div>
            <div class="rpt-form__body">
              <textarea v-model="commentsGeral.internamento" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Farmácia -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#f97316">
              <q-icon name="las la-pills" size="15px" style="color: var(--st-warn)" />
              <span>FARMÁCIA</span>
              <div class="rpt-form__total" style="background: var(--st-warn-tint);color: var(--st-warn-text)">{{ reportData.farmacia?.total ?? 0 }} receitas</div>
            </div>
            <div class="rpt-form__body">
              <div class="rpt-tiles">
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.farmacia?.entregues ?? 0 }}</div>
                  <div class="rpt-tile__key">Entregues</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.farmacia?.naoEntregues ?? 0 }}</div>
                  <div class="rpt-tile__key">Não entregues</div>
                </div>
              </div>
              <textarea v-model="commentsGeral.farmacia" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Laboratório -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#06b6d4">
              <q-icon name="las la-flask" size="15px" style="color: var(--st-teal)" />
              <span>LABORATÓRIO</span>
              <div class="rpt-form__total" style="background: var(--st-teal-tint);color: var(--st-teal-text)">{{ reportData.laboratorio?.total ?? 0 }} exames</div>
            </div>
            <div class="rpt-form__body">
              <div class="rpt-tiles">
                <div class="rpt-tile rpt-tile--editable" v-for="f in labCategorias" :key="f.key">
                  <input v-model.number="manualGeral[f.key]" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">{{ f.label }}</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.laboratorio?.done ?? 0 }}</div>
                  <div class="rpt-tile__key">Concluídos</div>
                </div>
                <div class="rpt-tile">
                  <div class="rpt-tile__val">{{ reportData.laboratorio?.pending ?? 0 }}</div>
                  <div class="rpt-tile__key">Pendentes</div>
                </div>
              </div>
              <textarea v-model="commentsGeral.laboratorio" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Imagiologia -->
          <div class="rpt-form">
            <div class="rpt-form__head" style="--c:#6366f1">
              <q-icon name="las la-x-ray" size="15px" style="color: var(--st-info)" />
              <span>IMAGIOLOGIA</span>
              <div class="rpt-form__total" style="background: var(--st-info-tint);color: var(--st-info-text)">{{ reportData.imagiologia?.total ?? 0 }}</div>
            </div>
            <div class="rpt-form__body">
              <div class="rpt-tiles">
                <div class="rpt-tile rpt-tile--editable" v-for="f in imagFields" :key="f.key">
                  <input v-model.number="manualGeral[f.key]" type="number" min="0" class="rpt-num-input" />
                  <div class="rpt-tile__key">{{ f.label }}</div>
                </div>
              </div>
              <textarea v-model="commentsGeral.imagiologia" class="rpt-textarea" placeholder="Comentários..." rows="1" />
            </div>
          </div>

          <!-- Parcerias e Seguros (full width) -->
          <div class="rpt-form rpt-form--full">
            <div class="rpt-form__head" style="--c:#f59e0b">
              <q-icon name="las la-handshake" size="15px" style="color: var(--st-warn)" />
              <span>PARCERIAS E SEGUROS</span>
              <div class="rpt-form__total" style="background: var(--st-warn-tint);color: var(--st-warn-text)">
                {{ (reportData.recepcao?.byProveniencia?.parceria ?? 0) + (reportData.recepcao?.byProveniencia?.seguro ?? 0) }}
              </div>
            </div>
            <div class="rpt-form__body">
              <textarea v-model="commentsGeral.parcerias" class="rpt-textarea" placeholder="Comentários..." rows="2" />
            </div>
          </div>

          <!-- Notas finais (full width) -->
          <div class="rpt-form rpt-form--full">
            <div class="rpt-form__head" style="--c:#32b989">
              <q-icon name="las la-pen-alt" size="15px" style="color: var(--st-ok)" />
              <span>NOTAS FINAIS DO MÉDICO</span>
            </div>
            <div class="rpt-form__body">
              <textarea v-model="commentsGeral.notas" class="rpt-textarea" placeholder="Notas finais..." rows="3" />
              <div class="rpt-signature">
                <div class="rpt-signature__line" />
                <div class="rpt-signature__label">Médico/a em serviço</div>
              </div>
            </div>
          </div>

        </div>
      </template>

    </template>
  </PaginaRelatorio>
</template>

<script setup>
import { SessionStorage } from "quasar";
import { ref, computed, reactive } from "vue";
import { api } from "src/boot/axios";
import { exportAreaReportPdf } from "src/utils/reports/area-report-print";
import PaginaRelatorio from "src/components/common/table/PaginaRelatorio.vue";

const user = SessionStorage.getItem("alfavida_user");

// ── Areas ──────────────────────────────────────────────────────
const isGeneralRole = ["admin", "doctor"].includes(user?.role);

const allAreas = [
  { key: "recepcao",    label: "Recepção",    sub: "Atendimentos",    icon: "las la-user-check",  color: "#3b82f6", bg: "#eff6ff20", iconBg: "#eff6ff", roles: ["admin", "attendant"] },
  { key: "consultorio", label: "Consultório", sub: "Consultas",       icon: "las la-stethoscope", color: "#8b5cf6", bg: "#faf5ff20", iconBg: "#faf5ff", roles: ["admin", "doctor"] },
  { key: "laboratorio", label: "Laboratório", sub: "Exames",          icon: "las la-flask",       color: "#06b6d4", bg: "#ecfeff20", iconBg: "#ecfeff", roles: ["admin", "analyst", "chiefLab", "techLab"] },
  { key: "enfermaria",  label: "Enfermaria",  sub: "Obs. & Fármacos", icon: "las la-procedures",  color: "#a855f7", bg: "#fdf4ff20", iconBg: "#fdf4ff", roles: ["admin", "nurse", "techNursian"] },
  { key: "geral",       label: "Geral",       sub: "Todas as áreas",  icon: "las la-chart-pie",   color: "#32b989", bg: "#f0fbf620", iconBg: "#f0fbf6", roles: ["admin", "doctor"] },
];

const availableAreas = computed(() => allAreas.filter((a) => a.roles.includes(user?.role)));
const activeArea = ref(availableAreas.value[0]?.key ?? null);

const selectArea = (key) => {
  activeArea.value = key;
  reportData.value = null;
  fetched.value = false;
};

// ── Period ─────────────────────────────────────────────────────
const period = ref("daily");
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const monthOptions = [
  { label: "Janeiro", value: 1 },  { label: "Fevereiro", value: 2 },
  { label: "Março", value: 3 },    { label: "Abril", value: 4 },
  { label: "Maio", value: 5 },     { label: "Junho", value: 6 },
  { label: "Julho", value: 7 },    { label: "Agosto", value: 8 },
  { label: "Setembro", value: 9 }, { label: "Outubro", value: 10 },
  { label: "Novembro", value: 11 },{ label: "Dezembro", value: 12 },
];

const periodLabel = computed(() => {
  if (period.value === "daily") {
    return selectedDate.value
      ? new Intl.DateTimeFormat("pt-PT", {
          day: "2-digit", month: "long", year: "numeric",
        }).format(new Date(selectedDate.value))
      : "";
  }
  const m = monthOptions.find((o) => o.value === selectedMonth.value)?.label ?? "";
  return `${m} de ${selectedYear.value}`;
});

// O cabeçalho da `PaginaRelatorio` diz sempre de que área e de que período é
// o que está no ecrã — antes isso estava no separador activo e no botão de
// período, e desaparecia de vista ao rolar.
const contexto = computed(() => {
  const area = availableAreas.value.find((a) => a.key === activeArea.value)?.label ?? "";
  return [area, periodLabel.value].filter(Boolean).join(" \u00b7 ");
});

const apoio = computed(() => {
  const area = availableAreas.value.find((a) => a.key === activeArea.value);
  return area ? `${area.sub}. Os campos em branco são preenchidos à mão e entram no PDF.` : "";
});

// ── Manual inputs (per-area) ───────────────────────────────────
const manual = reactive({
  // recepcao
  livre: 0, medicos: 0,
  // consultas
  comMarcacao: 0, semMarcacao: 0, especialidade: 0, controlo: 0, emergencia: 0,
  // laboratorio
  serologico: 0, hematologico: 0, parasitologico: 0, bioquimico: 0,
  reagentes: "", materiais: "",
  // imagiologia
  ecografia: 0, eletrocardiograma: 0, radiologia: 0,
});

const manualGeral = reactive({
  livre: 0, medicos: 0,
  comMarcacao: 0, semMarcacao: 0, especialidade: 0, controlo: 0, emergencia: 0,
  serologico: 0, hematologico: 0, parasitologico: 0, bioquimico: 0,
  ecografia: 0, eletrocardiograma: 0, radiologia: 0,
});

const comments = reactive({ recepcao: "", consultas: "", laboratorio: "", enfermaria: "" });
const commentsGeral = reactive({
  recepcao: "", consultas: "", enfermaria: "", ambulatorio: "",
  observacao: "", internamento: "", farmacia: "", laboratorio: "",
  imagiologia: "", parcerias: "", notas: "",
});

// ── Field lists ────────────────────────────────────────────────
const recepcaoStatusTiles = [
  { key: "WAITING",         label: "À espera" },
  { key: "IN_CONSULTATION", label: "Em consulta" },
  { key: "COMPLETED",       label: "Concluídos" },
  { key: "CANCELED",        label: "Cancelados" },
];
const consultaTipos = [
  { key: "comMarcacao",  label: "C/ Marcação" },
  { key: "semMarcacao",  label: "S/ Marcação" },
  { key: "especialidade",label: "Especialidade" },
  { key: "controlo",     label: "Controlo" },
  { key: "emergencia",   label: "Emergência" },
];
const consultaTiposGeral = consultaTipos;
const labCategorias = [
  { key: "serologico",    label: "Serológico" },
  { key: "hematologico",  label: "Hematológico" },
  { key: "parasitologico",label: "Parasitológico" },
  { key: "bioquimico",    label: "Bioquímico" },
];
const imagFields = [
  { key: "ecografia",         label: "Ecografia" },
  { key: "eletrocardiograma", label: "ECG" },
  { key: "radiologia",        label: "Radiologia" },
];

// ── Fetch ──────────────────────────────────────────────────────
const loading = ref(false);
const reportData = ref(null);
const fetched = ref(false);

const endpointFor = (area) => {
  if (area === "geral") return "general";
  return area;
};

const fetchReport = async () => {
  if (!activeArea.value) return;
  loading.value = true;
  reportData.value = null;
  fetched.value = false;
  try {
    const params = period.value === "daily"
      ? { period: "daily", date: selectedDate.value }
      : { period: "monthly", year: selectedYear.value, month: selectedMonth.value };
    const { data } = await api.get(`area-reports/${endpointFor(activeArea.value)}`, { params });
    reportData.value = data.data;
  } catch {
    reportData.value = null;
  } finally {
    loading.value = false;
    fetched.value = true;
  }
};

// ── PDF Export ─────────────────────────────────────────────────
const exportingPdf = ref(false);

const exportPdf = async () => {
  if (!reportData.value) return;
  exportingPdf.value = true;
  try {
    const isGeral = activeArea.value === "geral";
    await exportAreaReportPdf({
      period: periodLabel.value,
      area: activeArea.value,
      data: reportData.value,
      manual: isGeral ? manualGeral : manual,
      comments: isGeral ? commentsGeral : comments,
    });
  } finally {
    exportingPdf.value = false;
  }
};

// ── Formatters ─────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)) : "—";

// Sete estados em sete cores sólidas — laranja, azul, ciano, roxo, índigo,
// verde, vermelho — não distinguiam nada: a cor deixava de ser sinal. Fica o
// rótulo, e o tom só marca quem está à espera de alguém.
const statusMap = {
  WAITING:         { label: "À espera",     tom: "aviso" },
  IN_SCREENING:    { label: "Em triagem",   tom: "info" },
  SCREENED:        { label: "Triado",       tom: "info" },
  WAITING_DOCTOR:  { label: "Aguarda médico", tom: "aviso" },
  IN_CONSULTATION: { label: "Em consulta",  tom: "info" },
  COMPLETED:       { label: "Concluído",    tom: "ok" },
  CANCELED:        { label: "Cancelado",    tom: "neutro" },
};
const statusLabel = (s) => statusMap[s]?.label ?? s;
const statusTom = (s) => statusMap[s]?.tom ?? "neutro";

const obsStatusMap = {
  pending: { label: "Pendente",  tom: "aviso" },
  running: { label: "Em curso",  tom: "info" },
  done:    { label: "Concluído", tom: "ok" },
};
const obsStatusLabel = (s) => obsStatusMap[s]?.label ?? s;
const obsStatusTom = (s) => obsStatusMap[s]?.tom ?? "neutro";
</script>

<style scoped lang="scss">
.rpt-ano { width: 88px; }




// ── Filter bar ───────────────────────────────────────────────────



.filter-input--sm{ max-width: 90px; min-width: 80px; }

// ── Report form card ─────────────────────────────────────────────
.rpt-form {
  background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-control); overflow: hidden;
  &--full { grid-column: 1 / -1; }
}

.rpt-form__head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 14px; background: var(--surface-3);
  border-bottom: 1.5px solid var(--border);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800; color: var(--text);
  text-transform: uppercase; letter-spacing: 0.8px;
}

.rpt-form__total {
  margin-left: auto; padding: 2px 10px; border-radius: var(--r-pill);
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 800;
}

.rpt-form__body { padding: 14px; display: flex; flex-direction: column; gap: 12px; }

// ── Group ────────────────────────────────────────────────────────
.rpt-group { display: flex; flex-direction: column; gap: 8px; }
.rpt-group__label {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px;
}

// ── Tiles ────────────────────────────────────────────────────────
.rpt-tiles { display: flex; flex-wrap: wrap; gap: 8px; }

.rpt-tile {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  min-width: 76px; padding: 10px 12px;
  background: var(--surface-3); border-radius: var(--r-sm); border: 1.5px solid var(--border);
  &--editable { border-style: dashed; background: var(--surface); }
}

.rpt-tile__val { font-size: 22px; font-weight: 800; color: var(--text); line-height: 1; }
.rpt-tile__key {
  font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.4px; text-align: center;
}

// ── Inputs ───────────────────────────────────────────────────────
.rpt-num-input {
  width: 52px; font-size: 22px; font-weight: 800; color: var(--text);
  background: transparent; border: none; border-bottom: 2px solid var(--border-strong);
  text-align: center; outline: none; padding: 2px 0;
  &:focus { border-bottom-color: var(--st-ok); }
}

.rpt-text-input {
  width: 100%; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text); background: var(--surface-3);
  border: 1.5px solid var(--border); border-radius: var(--r-sm); padding: 7px 10px; outline: none;
  &:focus { border-color: var(--st-ok); }
}

.rpt-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.rpt-textarea {
  width: 100%; font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--st-info-text); background: var(--surface-3);
  border: 1.5px solid var(--border); border-radius: var(--r-sm); padding: 8px 12px;
  outline: none; resize: vertical; font-family: inherit;
  &:focus { border-color: var(--st-ok); }
}

// ── Doctor breakdown ─────────────────────────────────────────────
.doctor-list { display: flex; flex-direction: column; gap: 6px; }
.doctor-row {
  display: grid; grid-template-columns: 28px 1fr 3fr 36px;
  align-items: center; gap: 10px;
}
.doctor-row__avatar {
  width: 28px; height: 28px; border-radius: var(--r-sm); background: var(--st-purple-tint);
  display: flex; align-items: center; justify-content: center;
}
.doctor-row__name  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text-2); }
.doctor-row__bar-wrap { height: 6px; background: var(--surface-3); border-radius: var(--r-pill); overflow: hidden; }
/* Anima transform, não width: width força relayout a cada frame, e máquinas
   fracas são contexto confirmado. O raio vem do recorte do track. */
.doctor-row__bar { height: 100%; width: 100%; background: #8b5cf6; transform-origin: left; transition: transform 0.4s ease; }
.doctor-row__count { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-purple-text); text-align: right; }

// ── Exam bars ────────────────────────────────────────────────────
.exam-bar-list { display: flex; flex-direction: column; gap: 6px; }
.exam-bar-row { display: grid; grid-template-columns: 1fr 3fr 32px; align-items: center; gap: 10px; }
.exam-bar-row__name  { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 600; color: var(--text); }
.exam-bar-row__track { height: 7px; background: var(--st-teal-tint); border-radius: var(--r-pill); overflow: hidden; }
.exam-bar-row__fill  { height: 100%; width: 100%; background: #06b6d4; transform-origin: left; transition: transform 0.4s ease; }
.exam-bar-row__count { font-size: var(--fs-label); line-height: var(--lh-tight); font-weight: 700; color: var(--st-teal-text); text-align: right; }

// ── General grid ─────────────────────────────────────────────────
.rpt-general-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

// ── Signature ────────────────────────────────────────────────────
.rpt-signature {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-top: 8px;
}
.rpt-signature__line { width: 220px; height: 1px; background: #1e293b; }
.rpt-signature__label { font-size: var(--fs-label); line-height: var(--lh-tight); color: var(--text-faint); }

// ── List card ────────────────────────────────────────────────────
.report-list-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-control); overflow: hidden;
}
.report-list-card__title {
  display: flex; align-items: center; gap: 6px;
  padding: var(--sp-3) var(--sp-4);
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: var(--fw-forte); letter-spacing: 0.6px; text-transform: uppercase;
  color: var(--text-3);
  background: var(--surface-2); border-bottom: 1px solid var(--border);
}
.report-list-head {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
  padding: 0 var(--sp-3);
  height: var(--row-h, 44px);
  align-items: center;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  font-size: var(--fs-label);
  line-height: var(--lh-tight);
  font-weight: var(--fw-forte);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--text-3);
}
.report-empty { padding: 24px; text-align: center; font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-muted); }

/* Sem riscas alternadas: a régua entre linhas já separa, e a risca disputava
   o fundo com o realce de passagem do rato. */
.report-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
  align-items: center;
  padding: 0 var(--sp-3);
  min-height: var(--row-h, 44px);
  border-bottom: 1px solid var(--border-soft);

  &:last-child { border-bottom: none; }
  &:hover { background: var(--surface-3); }
}

.report-row__cell {
  font-size: var(--fs-body);
  line-height: var(--lh-tight);
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--bold { font-weight: var(--fw-semi); color: var(--text); }
  &--date { font-size: var(--fs-label); color: var(--text-muted); font-variant-numeric: tabular-nums; }
}
.c-grey { color: var(--text-muted); }

// ── State box ────────────────────────────────────────────────────
</style>
