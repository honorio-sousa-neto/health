<template>
  <div>
    <!-- <div
      class="header-layout q-px-md bg-teal-8 text-white row items-center"
      :class="!store.leftDrawerOpen ? 'collapse' : ''"
    >
      <div>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="las la-angle-left"
          @click="$router.back()"
          :color="$route.params.id ? 'white' : 'teal-8'"
        />
      </div>
      <div
        class="col q-ml-md text-h6 text-weight-regular row items-center justify-between"
      >
        <div>{{ $route.meta.title }}</div>
        <div>
          <Notifications />
          <q-btn
            color="white"
            icon="las la-bars"
            flat
            round
            @click="store.leftDrawerOpen = !store.leftDrawerOpen"
            dense
          />
        </div>
      </div>
    </div> -->
    <div>
      <RouterView />
    </div>
  </div>
</template>
<script setup>
import { useInvoiceStore } from "src/stores/invoice";
import Notifications from "src/components/global/Notifications.vue";
const store = useInvoiceStore();
</script>

<style scopep>
.header-layout {
  height: 56px;
  max-height: 56px;
  position: fixed;
  top: 0;
  left: 300px;
  right: 0;
  z-index: 9;
  transition: all 0.5s ease-in-out;
}

.collapse {
  left: 0;
  transition: all 0.5s ease-in-out;
}
</style>
