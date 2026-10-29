import { defineStore } from "pinia";
import { reactive } from "vue";
import { useFetchApi } from "src/composables/api";
import { showNotify } from "src/utils/notify";

export const useCompanyStore = defineStore("company", () => {
  let data = reactive({ data: {} });

  let form = reactive({
    name: "",
    nif: "",
    phone: "",
    address: "",
    email: "",
  });

  const onReset = () => {
    Object.assign(form, { name: "", nif: "", phone: "", address: "", email: "" });
  };

  let loadings = reactive({
    loadingAll: false,
    loadingOne: false,
    loadingDelete: false,
    loadingCreate: false,
  });

  const create = async (payload) => {
    loadings.loadingCreate = true;
    const response = await useFetchApi().store("companies", payload);
    loadings.loadingCreate = false;
    if (response.success) show();
    showNotify(response.message, response.success);
    return response;
  };

  const show = async () => {
    loadings.loadingOne = true;
    const response = await useFetchApi().index("companies");
    const company = Array.isArray(response.data.data)
      ? response.data.data[0]
      : response.data.data;
    if (company) {
      Object.assign(form, company);
      Object.assign(data.data, company);
    }
    loadings.loadingOne = false;
    return response;
  };

  return { create, show, data, loadings, form, onReset };
});
