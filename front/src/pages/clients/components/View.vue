<template>
  <div>
    <div class="text-h4 text-weight-light">{{ form.name }}</div>
    <div>
      NIF: <span class="text-bold">{{ form.nif }}</span>
    </div>
    <div>
      Contacto telefónico: <span class="text-bold">{{ form.phone }}</span>
    </div>
    <div>
      Email: <span class="text-bold">{{ form.email }}</span>
    </div>
    <div>
      Endereço: <span class="text-bold">{{ form.address }}</span>
    </div>

    <div class="q-mt-md">
      <div class="text-bold q-mb-md">BENEFÍCIOS</div>
      <div class="q-ml-sm">
        <div class="text-bold">Protocolo:</div>
        <div>
          {{
            form?.protocol?.name
              ? form?.protocol?.name
              : "Sem protocolo associado"
          }}
        </div>
        <div class="text-bold">Seguro externo:</div>
        <div>
          {{
            form?.customersInsurance
              ?.map((item) => item.insurance.name)
              ?.join(", ")
          }}
        </div>
        <div class="text-bold">Seguro interno:</div>
        <div>
          {{
            form?.intern_insurance?.map((item) => item.intern.name)?.join(", ")
          }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive } from "vue";

import { useCreateUpdate } from "src/composables/create-update";
import { useRoute } from "vue-router";

const { fetchOne } = useCreateUpdate("customers");

let form = reactive({
  name: "",
  nif: "",
  phone: "",
  source: "",
  address: "",
  email: "",
  insuranceId: null,
  protocolId: null,
  partnerId: null,
  customersInsurance: [],
  insurance_number: null,
  intern_insurance: [],
});

const route = useRoute();
onMounted(async () => {
  if (route.params.id) {
    const data = await fetchOne(route.params.id);
    Object.assign(form, data);
  }
});
</script>
