<template>
  <div>
    <div
      v-if="loadingPatients"
      style="min-height: 70vh"
      class="flex flex-center"
    >
      <div class="column">
        <q-spinner-gears color="primary" size="3rem" :thickness="5" />
        <div class="text-center text-body1 q-mt-md text-bold">
          Carregando...
        </div>
      </div>
    </div>
    <div v-else-if="patients.length == 0">
      <div>Lista de espera vazia</div>
    </div>
    <q-list v-else bordered>
      <div v-for="pat in patients">
        <q-expansion-item
          group="somegroup"
          icon="explore"
          :label="pat?.client?.name"
          :caption="formatDate(pat.createdAt)"
          @click="fetchOne(pat.id)"
        >
          <q-card class="bg-grey-4" style="min-height: 70vh">
            <q-card-section>
              <q-form
                style="min-height: 70vh"
                class="column justify-between"
                @submit.prevent="onSubmit"
                @reset="onReset"
              >
                <div>
                  <div class="text-bold q-mb-md text-body1">
                    Informações pessoais
                  </div>
                  <div class="q-gutter-sm">
                    <q-input
                      outlined
                      v-model="patient.name"
                      type="text"
                      label="Nome completo"
                    />
                    <q-input
                      outlined
                      v-model="patient.birthday"
                      type="date"
                      label="Data de nascimento"
                    />
                    <q-input
                      outlined
                      v-model="patient.address"
                      type="text"
                      label="Endereço"
                    />
                    <q-input
                      outlined
                      v-model="patient.phone_number"
                      type="text"
                      label="Número de telefone"
                      mask="###-###-###"
                    />
                    <div>
                      <div class="text-bold">Género</div>
                      <q-radio
                        v-model="patient.gender"
                        val="M"
                        label="Masculino"
                      />
                      <q-radio
                        v-model="patient.gender"
                        val="F"
                        label="Feminino"
                      />
                    </div>
                  </div>
                  <div class="text-bold q-my-md text-body1">Sintomas</div>
                  <div class="q-gutter-sm">
                    <q-checkbox
                      left-label
                      v-model="patient.symptoms.fever"
                      label="Febre"
                    />
                    <q-checkbox
                      left-label
                      v-model="patient.symptoms.spew"
                      label="Vômitos"
                    />
                  </div>
                  <!-- <div class="text-bold q-my-md text-body1">
                    Queixa principal
                  </div>
                  <div>
                    <q-input
                      v-model="text"
                      type="text"
                      label="Sintomas e duração desses sintomas"
                      outlined
                    />
                  </div> -->
                </div>
                <div class="q-mt-md">
                  <q-btn
                    no-caps
                    label="Enviar para o médico"
                    type="submit"
                    color="primary"
                    :loading="loading"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />
      </div>
    </q-list>
  </div>
</template>
<script setup>
import { useFetch } from "src/composables/fetch";
import { onMounted, ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { SessionStorage } from "quasar";
import io from "src/utils/socket";
import { api } from "src/boot/axios";
api.defaults.baseURL;

const socket = io(api.defaults.baseURL.slice(0, -3));

const router = useRouter();
const route = useRoute();
const { index, show, update } = useFetch();
const user = SessionStorage.getItem("alfavida_user");
const patients = ref([]);
let patient = reactive({
  name: null,
  birthday: null,
  gender: null,
  phone_number: null,
  address: null,
  symptoms: {
    fever: false,
    spew: false,
  },
});

const loadingPatients = ref(false);
const loadingPatient = ref(false);
const fetchData = async () => {
  try {
    loadingPatients.value = true;
    const { data } = await index("attendings/index/to-trial");
    loadingPatients.value = false;
    patients.value = data;
  } catch (error) {}
};

async function fetchOne(id) {
  try {
    loadingPatient.value = true;
    onReset();
    const { data } = await show("attendings", id);
    patient.name = data.client.name;
    loadingPatient.value = false;
    router.push({ params: { id } });
  } catch (error) {
    console.log(error.message);
  }
}

const loading = ref(false);
const onSubmit = async () => {
  try {
    loading.value = true;
    const {} = await update("attendings/" + route.params.id, {
      trial_incharge: user.id,
      status: "to-doctor-1",
      patient,
    });
    loading.value = false;
    fetchData();
  } catch (error) {}
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(date));
};

const onReset = () => {
  Object.assign(patient, {
    name: null,
    birthday: null,
    gender: null,
    phone_number: null,
    address: null,
    symptoms: {
      fever: false,
      spew: false,
    },
  });
};

onMounted(() => {
  socket.on("attending:from-attending", (attending) => {
    patients.value.push(attending);
  });
  fetchData();
});
</script>
