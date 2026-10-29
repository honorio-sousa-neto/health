import { useUserStore } from "./user";
import { useServiceStore } from "./service";
import { useMaterialStore } from "./material";
import { useInsuranceStore } from "./insurance";
import { useProtocolStore } from "./protocol";
import { usePaymentStore } from "./payment";
import { useCustomerStore } from "./customer";
import { usePartnerStore } from "./partner";
import { useAttendingStore } from "./attending";
import { useSupplierStore } from "./supplier";
import { useDepositStore } from "./deposit";
import { usePurchaseStore } from "./purchase";
import { useSectionStore } from "./section";
import { useExamsStore } from "./exams";
import { useConsultationStore } from "./consultation";
import { useScreeningStore } from "./screening";
import { useResultExamStore } from "./result";
import { useConsultationAttendingStore } from "./consultation-attending";
const storeMap = {
  user: useUserStore(),
  service: useServiceStore(),
  material: useMaterialStore(),
  insurance: useInsuranceStore(),
  protocol: useProtocolStore(),
  payment: usePaymentStore(),
  customer: useCustomerStore(),
  partner: usePartnerStore(),
  supplier: useSupplierStore(),
  attending: useAttendingStore(),
  deposit: useDepositStore(),
  purchase: usePurchaseStore(),
  section: useSectionStore(),
  exams: useExamsStore(),
  consultation: useConsultationStore(),
  screening: useScreeningStore(),
  result: useResultExamStore(),
  attendingConsultation: useConsultationAttendingStore(),
};

export default storeMap;
