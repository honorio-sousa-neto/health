<template>
  <div class="q-py-md" style="font-size: 11pt">
    <div class="q-px-md">
      <div>
        <div class="text-bold">
          Exames requeridos ({{
            store.currentAttending?.consultation?.serviceType
          }})
        </div>
        {{ store.currentAttending?._count }}
        <ol class="row q-col-gutter-md">
          <li
            class="col-6"
            v-for="exam in store.currentAttending?.consultation?.requests.filter(item => item.paid) ||
            store.currentAttending.requests"
          >
            <div v-if="exam.exam.isHeader">
              <div class="text-bold">
                {{ exam.exam.name }}
              </div>
              <ul>
                <li v-for="subitem in exam.exam.subItens">
                  <div v-if="subitem.isHeader">
                    <div>
                      {{ subitem.name }}
                    </div>
                    <ol>
                      <li v-for="item in subitem.subItens" class="q-my-xs">
                        <div class="col-4">
                          {{ item.name }}
                        </div>
                        <div class="col-4">
                          <q-select
                            v-if="item.input == 'SELECT'"
                            v-model="item.result"
                            dense
                            style="width: 250px"
                            outlined
                            :rules="[required]"
                            :options="item.options"
                            label="Resultado"
                          />
                          <q-input
                            v-else
                            v-model="item.result"
                            dense
                            style="width: 250px"
                            outlined
                            :rules="[required]"
                            type="text"
                            label="Resultado"
                          />
                        </div>
                        <div class="col-4">
                          Valor de referência:
                          <span class="text-bold">{{ item.reference }}</span>
                        </div>
                      </li>
                    </ol>
                  </div>
                  <div v-else class="q-my-xs">
                    <div class="col-4">
                      {{ subitem.name }}
                    </div>
                    <div class="col-4">
                      <q-select
                        v-if="subitem.input == 'SELECT'"
                        v-model="subitem.result"
                        dense
                        style="width: 250px"
                        outlined
                        :rules="[required]"
                        :options="subitem.options"
                        label="Resultado"
                      />
                      <q-input
                        v-else
                        v-model="subitem.result"
                        dense
                        style="width: 250px"
                        outlined
                        :rules="[required]"
                        type="text"
                        label="Resultado"
                      />
                    </div>
                    <div class="col-4">
                      Valor de referência:
                      <span class="text-bold">{{ subitem.reference }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div v-else class="q-my-xs">
              <div class="col-4 text-bold">
                {{ exam.exam.name }}
              </div>
              <div class="col-4">
                <q-select
                  v-if="exam.exam.input == 'SELECT'"
                  v-model="exam.exam.result"
                  dense
                  style="width: 250px"
                  outlined
                  :rules="[required]"
                  :options="exam.exam.options"
                  label="Resultado"
                />
                <q-input
                  v-else
                  v-model="exam.exam.result"
                  dense
                  style="width: 250px"
                  outlined
                  :rules="[required]"
                  type="text"
                  label="Resultado"
                />
              </div>
              <div class="col-4">
                Valor de referência:
                <span class="text-bold">{{ exam.exam.reference }}</span>
              </div>
            </div>
          </li>
        </ol>
      </div>
      <q-btn
        color="teal-8"
        icon="las la-save"
        label="Salvar alterações"
        @click="onSubmit"
        :loading="store.loading"
      />
    </div>
  </div>
</template>
<script setup>
import { useAttendingStore } from "src/stores/attending";
import { useResultExamStore } from "src/stores/result";
import { SessionStorage } from "quasar";
const user = SessionStorage.getItem("alfavida_user");
import { required } from "src/utils/validation";
import { useRoute, useRouter } from "vue-router";

const store = useAttendingStore();
const route = useRoute();
const router = useRouter();
const resultStore = useResultExamStore();
const onSubmit = async () => {
  try {
    let payload = [];
    if (store.currentAttending?.consultation?.requests)
      for (const item of store.currentAttending?.consultation?.requests) {
        payload.push({
          examId: item.examId,
          analystId: user.id,
          result: item.exam,
          attendingId: route.params.attendingId,
        });
      }
    else {
      for (const item of store.currentAttending?.requests) {
        payload.push({
          examId: item.examId,
          analystId: user.id,
          result: item.exam,
          attendingId: route.params.attendingId,
        });
      }
    }
    const { success } = await resultStore.create({
      stage: store.currentAttending?.consultation?.requests
        ? "EXAM_RESULT"
        : "CONCLUDE",
      status: store.currentAttending?.consultation?.requests
        ? "ONGOING"
        : "COMPLETED",
      results: payload,
    });

    if (success) {
      router.push({ name: "pedidos-exame" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
</script>
