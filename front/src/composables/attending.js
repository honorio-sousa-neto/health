import { api } from "src/boot/axios";
import { ref } from "vue";

export const useAttending = () => {
  const loading = ref(false);
  const createInvoice = async (form) => {
    loading.value = true;
    const { data } = await api.post("invoices", form);
    loading.value = false;
    return data.data;
  };

  const requestConsultation = async (form) => {
    loading.value = true;
    const { data } = await api.post("medical-consultations", form);
    loading.value = false;
  };

  const updateScreening = async (id, form) => {
    try {
      loading.value = true;
      const { data } = await api.patch("screenings/" + id, form);
      loading.value = false;
      return data;
    } catch (error) {
      loading.value = false;
    }
  };

  const requestExams = () => {};

  return {
    requestConsultation,
    requestExams,
    createInvoice,
    updateScreening,
    loading,
  };
};
