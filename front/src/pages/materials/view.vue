<template>
  <q-card flat class="q-my-md">
    <div class="text-h5">{{ form.name }}</div>
    <div class="text-grey-7">{{ form.description }}</div>
    <div class="text-grey-7">{{ form.category }}</div>
    <div class="q-mt-md">
      <div class="text-h6 text-weight-regular">
        Preço unitário:
        <span class="text-bold">
          {{
            new Intl.NumberFormat("de-DE", {
              currency: "AOA",
              style: "currency",
            }).format(form.unit_price)
          }}
        </span>
      </div>
      <div class="text-h6 text-weight-regular">
        Desconto:
        <span class="text-bold">
          {{
            new Intl.NumberFormat("de-DE", {
              currency: "AOA",
              style: "currency",
            }).format(form.discount)
          }}
        </span>
      </div>
    </div>
  </q-card>
</template>
<script setup>
defineProps({
  form: {
    type: String,
    default: {
      name: null,
      description: null,
      category: null,
      unit_price: null,
      sale_price: null,
    },
  },
});
</script>
