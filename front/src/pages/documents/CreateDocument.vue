<template>
  <div class="page-wrap">
    <!-- Header -->
    <div class="row items-center q-mb-sm">
      <q-btn flat round dense icon="las la-arrow-left" color="grey-6" class="q-mr-sm"
        @click="$router.go(-1)" />
      <div>
        <div class="text-h6 text-weight-semibold">Emitir documento</div>
        <div class="text-caption text-grey-5">Preencha os campos para emitir</div>
      </div>
    </div>

    <!-- Top row: Client + Settings side by side -->
    <div class="top-row q-mb-sm">
      <div class="emit-card client-card">
        <div class="emit-label">Cliente</div>
        <Customer />
      </div>
      <div class="emit-card settings-card">
        <SettingsAlternative />
      </div>
    </div>

    <!-- Middle: Services + Items — grows to fill available height -->
    <div class="middle-row">
      <div class="middle-col services-col">
        <div class="emit-card fill-card">
          <div class="emit-label">Serviços / Produtos</div>
          <ServiceInvoice />
        </div>
      </div>
      <div class="middle-col items-col">
        <div class="emit-card fill-card">
          <div class="emit-label">Itens adicionados</div>
          <Items v-model:items="store.form.invoiceItems" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCreateUpdate } from "src/composables/create-update";
import { useAttendingStore } from "src/stores/attending";
import { useInvoiceStore } from "src/stores/invoice";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import Customer from "./alternative/Customer.vue";
import Items from "./alternative/Items.vue";
import ServiceInvoice from "./alternative/ServiceInvoice.vue";
import SettingsAlternative from "./alternative/Settings.vue";
import { api } from "src/boot/axios";

const storeAttending = useAttendingStore();
const route = useRoute();
const { fetchOne } = useCreateUpdate("consultations");
const store = useInvoiceStore();

const fetchData = async () => {
  try {
    const response = await fetchOne(route.params.medicalConsultationId);
    store.onReset();
    const partialCust = response.screening?.customer;
    if (partialCust?.id) {
      const { data: cData } = await api.get(`customers/${partialCust.id}`);
      store.form.customer = cData.data ?? partialCust;
    } else {
      store.form.customer = partialCust;
    }
    store.form.invoiceItems = response.exams.map((item) => ({
      quantity: 1, total: item.exam.unit_price, discount: item.exam.discount,
      unit_price: item.exam.unit_price, name: item.exam.name,
      description: item.exam.description, id: item.exam.id,
    }));
    if (response.observationId) {
      store.form.invoiceItems.push({
        quantity: 1, total: response.observation.service.unit_price,
        discount: response.observation.service.discount,
        unit_price: response.observation.service.unit_price,
        name: response.observation.service.name,
        description: response.observation.service.description,
        id: response.observation.service.id,
      });
    } else if (response.internmentId) {
      store.form.invoiceItems.push({
        quantity: 1, total: response.internment.unit_price,
        discount: response.internment.discount,
        unit_price: response.internment.unit_price,
        name: response.internment.name,
        description: response.internment.description,
        id: response.internment.id,
      });
    }
  } catch (error) { console.log(error.message); }
};

store.form.emission_date = new Date(
  new Date().getTime() - new Date().getTimezoneOffset() * 60000
).toISOString().slice(0, 16);

const fetchSurgery = async (id) => {
  try {
    const { data } = await api.get(`surgeries/${id}`);
    const partial = data.data.customer;
    if (partial?.id) {
      const { data: cData } = await api.get(`customers/${partial.id}`);
      store.form.customer = cData.data ?? partial;
    } else if (partial) {
      store.form.customer = partial;
    }
    store.form.invoiceItems.push({
      quantity: 1, total: data.data.service.unit_price, discount: data.data.service.discount,
      unit_price: data.data.service.unit_price, name: data.data.service.name,
      description: data.data.service.description, id: data.data.service.id,
    });
  } catch (error) {}
};

const fetchAdministration = async (id) => {
  try {
    const { data } = await api.get(`administrations/${id}`);
    const partial = data.data.customer;
    if (partial?.id) {
      const { data: cData } = await api.get(`customers/${partial.id}`);
      store.form.customer = cData.data ?? partial;
    } else if (partial) {
      store.form.customer = partial;
    }
    store.form.invoiceItems.push({
      quantity: 1, total: data.data.service.unit_price, discount: data.data.service.discount,
      unit_price: data.data.service.unit_price, name: data.data.service.name,
      description: data.data.service.description, id: data.data.service.id,
    });
    if (Array.isArray(data.data.drugs)) {
      for (const drug of data.data.drugs) {
        const qty = drug.quantity || 1;
        store.form.invoiceItems.push({
          quantity: qty, total: drug.amount * qty, discount: 0,
          unit_price: drug.amount, name: drug.name,
          description: "", id: drug.id,
        });
      }
    }
  } catch (error) {}
};

const fetchPrescription = async (id) => {
  try {
    const { data } = await api.get(`prescriptions/${id}`);
    store.form.invoiceItems.length = 0;
    store.form.ambulatoryConsultationId = data.data.consultationId ?? null;
    const partialCustomer = data.data.consultation?.screening?.customer;
    if (partialCustomer?.id) {
      const { data: cData } = await api.get(`customers/${partialCustomer.id}`);
      store.form.customer = cData.data ?? partialCustomer;
    }
    let quantity = 1;
    store.form.invoiceItems.push(
      ...data.data.items.map((item) => {
        quantity = Number(item.quantity);
        const clf = item.service.classificacao;
        const name = clf ? `Injetável - ${clf}` : item.service.name;
        return {
          quantity, total: item.service.unit_price * quantity, discount: item.service.discount,
          unit_price: item.service.unit_price,
          name, description: item.service.description, id: item.service.id,
        };
      })
    );
    const { data: itens } = await api.get("services/filter/find", { params: { search: "Materiais Comuns" } });
    store.form.invoiceItems.push(...itens.data.map((item) => ({
      quantity, total: item.unit_price * quantity, discount: item.discount,
      unit_price: item.unit_price, name: item.name, description: item.description, id: item.id,
    })));
    const { data: service } = await api.get("services/filter/find", { params: { search: "Serviço" } });
    store.form.invoiceItems.push(...service.data.map((item) => ({
      quantity, total: item.unit_price * quantity, discount: item.discount,
      unit_price: item.unit_price, name: item.name, description: item.description, id: item.id,
    })));
  } catch (error) { console.log(error.message); }
};

const fetchPharmacy = async (id) => {
  try {
    const { data } = await api.get(`prescriptions/${id}`);
    store.form.invoiceItems.length = 0;
    const partial = data.data.consultation?.screening?.customer;
    if (partial?.id) {
      const { data: cData } = await api.get(`customers/${partial.id}`);
      store.form.customer = cData.data ?? partial;
    } else if (partial) {
      store.form.customer = partial;
    }
    store.form.invoiceItems.push(
      ...data.data.items.map((item) => {
        // Receita em doses (ex.: comprimidos) → fatura em embalagens (cartelas).
        // Doses por embalagem = factor da unidade (ex.: "Cartela de 10" = 10),
        // com recurso ao unitsPerPackage para produtos ainda sem unidade.
        const u = item.service.unit;
        const perPackage =
          u && u.kind === "count" && Number(u.factor) > 1
            ? Number(u.factor)
            : Number(item.service.unitsPerPackage) > 1
              ? Number(item.service.unitsPerPackage)
              : 1;
        const quantity = Math.ceil(Number(item.quantity) / perPackage);
        return {
          quantity, total: item.service.unit_price * quantity,
          discount: item.service.discount, unit_price: item.service.unit_price,
          name: item.service.name, description: item.service.description, id: item.service.id,
        };
      })
    );
  } catch (error) {}
};

const fetchObservation = async (id) => {
  try {
    const { data } = await api.get(`observations/${id}`);
    const obs = data.data;
    store.form.invoiceItems.length = 0;
    const partialCustomer = obs.consultation?.screening?.customer;
    if (partialCustomer?.id) {
      const { data: cData } = await api.get(`customers/${partialCustomer.id}`);
      store.form.customer = cData.data ?? partialCustomer;
    }
    store.form.invoiceItems.push({
      quantity: 1, total: obs.service.unit_price, discount: obs.service.discount,
      unit_price: obs.service.unit_price, name: obs.service.name,
      description: obs.service.description, id: obs.service.id,
    });
  } catch (error) {}
};

onMounted(() => {
  if (route.params.medicalConsultationId) fetchData();
  if (route.params.surgeryId) fetchSurgery(route.params.surgeryId);
  if (route.params.administrationId) fetchAdministration(route.params.administrationId);
  if (route.params.prescriptionId) fetchPrescription(route.params.prescriptionId);
  if (route.params.pharmacyId) fetchPharmacy(route.params.pharmacyId);
  if (route.params.observationId) fetchObservation(route.params.observationId);
});
</script>

<style scoped lang="scss">
.page-wrap {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 32px); /* 100vh minus 16px padding top + bottom from .page-content */
  gap: 8px;
  overflow: hidden;
}

/* ── Top row: Client + Settings ── */
.top-row {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.client-card {
  flex: 35;
  min-width: 0;
}

.settings-card {
  flex: 65;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ── Middle row fills remaining height ── */
.middle-row {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
}

.services-col {
  flex: 0 0 33%;
  min-width: 0;
}

.items-col {
  flex: 1;
  min-width: 0;
}

.middle-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Card that fills the column height */
.fill-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.fill-card > :last-child {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* ── Cards ── */
.emit-card {
  background: var(--surface);
  border-radius: var(--r-control);
  padding: 14px 16px;
  border: 1px solid var(--border);
}

/* ── Labels ── */
.emit-label {
  flex-shrink: 0;
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-soft);
}
</style>
