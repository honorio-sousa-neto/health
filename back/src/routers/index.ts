import { asyncRouter } from "../security/router";
import express from "express";

import { Middlewares } from "../middlewares/token";
import auth from "./auth";
import { authorize } from "../security/authorization";
import balance from "./balance";
import bank from "./bank";
import category from "./category";
import company from "./company";
import consultation from "./consultation";
import customer from "./customer";
import aggregate from "./customer/aggregate";
import deposit from "./deposit";
import drug from "./drug";
import exams from "./exams";
import exemption from "./exemption";
import finance from "./finance";
import flow from "./flow/flow";
import observation from "./observation";
import ambulatory from "./ambulatory";
import prescription from "./prescription";

import hospitalization from "./hospitalization";
import imagiology from "./imagiology";
import insurance from "./insurance";
import intern from "./intern";
import invoice from "./invoice/invoice";
import material from "./material";
import partner from "./partner";
import payment from "./payment";
import product from "./product";
import protocol from "./protocol";
import purchase from "./purchase";
import report from "./report";
import screening from "./screening";
import section from "./section";
import service from "./service";
import signing from "./signing";
import supplier from "./supplier";
import treatmentObservation from "./treatment-observation";
import upload from "./upload";
import user from "./user";
import requestExam from "./request-exams";
import surgery from "./surgery";
import administration from "./administration";
import attendance from "./attendance";
import unitOfMeasure from "./unit-of-measure";
import inventory from "./inventory";
import areaReports from "./area-reports";
import notification from "./notification";
import stock from "./stock";
import ambulatoryPlan from "./ambulatory-plan";

const router = asyncRouter();
const middleware = new Middlewares();

router.use("/auth", auth);
router.use(middleware.verifyToken, authorize);
router.use("/users", user);
router.use("/companies", company);
router.use("/customers", customer);
router.use("/surgeries", surgery);
router.use("/prescriptions", prescription);
router.use("/aggregate", aggregate);
router.use("/services", service);
router.use("/materials", material);
router.use("/products", product);
router.use("/exemptions", exemption);
router.use("/protocols", protocol);
router.use("/insurances", insurance);
router.use("/interns", intern);
router.use("/partners", partner);
router.use("/suppliers", supplier);
router.use("/payments", payment);
router.use("/invoices", invoice);
router.use("/banks", bank);
router.use("/flows", flow);
router.use("/deposits", deposit);
router.use("/finances", finance);
router.use("/sections", section);
router.use("/consultations", consultation);
router.use("/imagiologies", imagiology);
router.use("/ambulatories", ambulatory);

router.use("/exams", exams);
router.use("/screenings", screening);
router.use("/signings", signing);
router.use("/observations", observation);
router.use("/request-exams", requestExam);
router.use("/hospitalizations", hospitalization);
router.use(
  "/treatment-observations",
  treatmentObservation
);
router.use("/administrations", administration);
router.use("/attendances", attendance);
router.use("/units-of-measure", unitOfMeasure);
router.use("/inventories", inventory);

router.use("/categories", category);
router.use("/drugs", drug);
/**
 * Relatórios e comprovativos usam a mesma autenticação e autorização das restantes rotas.
 */
router.use("/balances", balance);
router.use("/reports", report);
router.use("/uploads", upload);

router.use("/area-reports", areaReports);
router.use("/purchases", purchase);
router.use("/notifications", notification);
router.use("/stock", stock);
router.use("/ambulatory-plans", ambulatoryPlan);

export default router;
