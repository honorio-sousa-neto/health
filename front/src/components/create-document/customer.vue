<template>
  <q-card flat square>
    <div class="q-py-sm">
      <div class="text-bold">Selecionar cliente</div>
      <div class="row items-center justify-between q-mt-sm">
        <div class="col-md-12 col-xs-12">
          <q-select
            v-model="customerId"
            type="text"
            label="Pesquisa"
            standout="bg-teal-8 text-white"
            use-input
            dense
            option-label="name"
            option-value="id"
            input-debounce="500"
            @filter="filterFunction"
            :options="options"
          >
            <template v-slot:prepend>
              <q-btn
                color="teal-8 text-white"
                flat
                round
                dense
                icon="las la-plus"
                @click="isCreating = !isCreating"
              />
            </template>
          </q-select>
        </div>
      </div>
      <div>
        <q-slide-transition>
          <div class="q-pt-md" v-if="customerId?.name">
            <div class="text-h6">{{ customerId.name }}</div>
            <div class="text-grey-8">{{ customerId.phone }}</div>
            <div class="text-grey-8">
              {{ customerId.insuranceId && customerId.insurance.name }}
            </div>
            <div class="text-grey-8">
              {{ customerId.internId ? `Seguro interno: ${customerId.intern.name}` : "" }}
            </div>
          </div>
        </q-slide-transition>
      </div>

      <!-- Atendimento associado -->
      <q-slide-transition>
        <div v-if="customerId?.id" class="q-mt-md">
          <div class="att-label">
            <q-icon name="las la-hospital-alt" size="14px" style="color:#4299e1" />
            Atendimento associado
            <span class="att-label-opt">(opcional)</span>
          </div>
          <q-select
            v-model="invoiceStore.form.attendanceId"
            :options="attendanceOptions"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            dense
            clearable
            standout="bg-blue-8 text-white"
            placeholder="Selecionar atendimento…"
            :loading="loadingAttendances"
            no-options-label="Sem atendimentos encontrados"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label class="text-weight-medium" style="font-size:var(--fs-body)">
                    {{ scope.opt.reference }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ scope.opt.serviceName }} · {{ scope.opt.date }}
                    <span class="att-status-chip" :class="`asc--${scope.opt.status.toLowerCase()}`">
                      {{ scope.opt.statusLabel }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #selected-item="scope">
              <span style="font-size:var(--fs-body); font-weight:600">
                {{ scope.opt?.reference ?? scope.opt }}
              </span>
            </template>
          </q-select>
        </div>
      </q-slide-transition>
    </div>
  </q-card>
  <q-separator />
  <q-dialog v-model="isCreating" persistent>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="row justify-between q-mb-md">
          <div class="text-h6 text-weight-regular">Criar cliente</div>
          <q-btn color="grey-8" icon="close" round flat dense v-close-popup />
        </div>
        <Form />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import Form from "../clientes/Form.vue";
import { ref, watch } from "vue";
import { useCustomerStore } from "src/stores/customer";
import { useInvoiceStore } from "src/stores/invoice";
import { api } from "src/boot/axios";

const customerId = defineModel("customer");
const emits = defineEmits(["finished"]);
const store = useCustomerStore();
const invoiceStore = useInvoiceStore();
const isCreating = ref(false);

const options = ref([]);
const filterFunction = async (val, update, abort) => {
  try {
    if (!val) return;
    update(async () => {
      const data = await store.filter(val);
      val = null;
      options.value = data;
    });
  } catch (error) {}
};

/* ── Attendance picker ── */
const attendanceOptions = ref([]);
const loadingAttendances = ref(false);

const statusLabel = (s) => ({
  WAITING: "Em espera", IN_SCREENING: "Em triagem", SCREENED: "Triado",
  WAITING_DOCTOR: "Aguarda médico", IN_CONSULTATION: "Em consulta",
  COMPLETED: "Concluído", CANCELED: "Cancelado",
}[s] ?? s);

const fmtDate = (val) =>
  new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(val));

const loadAttendances = async (cId) => {
  attendanceOptions.value = [];
  invoiceStore.form.attendanceId = null;
  if (!cId) return;
  loadingAttendances.value = true;
  try {
    const { data } = await api.get(`attendances/by-customer/${cId}`);
    const list = data?.data ?? [];
    attendanceOptions.value = list.map((a) => ({
      id: a.id,
      reference: a.reference,
      label: `${a.reference} · ${a.service?.name ?? "—"} · ${fmtDate(a.createdAt)}`,
      serviceName: a.service?.name ?? "—",
      date: fmtDate(a.createdAt),
      status: a.status,
      statusLabel: statusLabel(a.status),
    }));
  } catch (_) {}
  finally { loadingAttendances.value = false; }
};

watch(() => customerId.value?.id, (cId) => loadAttendances(cId), { immediate: true });
</script>

<style scoped>
.att-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.att-label-opt { font-weight: 400; text-transform: none; color: var(--text-faint); letter-spacing: 0; }

.att-status-chip {
  display: inline-block;
  font-size: var(--fs-label);
  font-weight: 600;
  padding: 1px 7px;
  border-radius: var(--r-sm);
  margin-left: 6px;
}
.asc--waiting, .asc--waiting_doctor { background: var(--surface-3); color: var(--text-muted); }
.asc--in_screening { background: rgba(66,153,225,0.1); color: var(--chip-info); }
.asc--completed { background: rgba(50,185,137,0.1); color: var(--chip-ok); }
.asc--canceled { background: rgba(229,62,62,0.08); color: var(--danger); }
.asc--in_consultation { background: rgba(49,130,206,0.1); color: var(--chip-info); }
</style>
