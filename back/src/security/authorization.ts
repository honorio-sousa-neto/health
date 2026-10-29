import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { clinicalRoles } from "./auth";
const finance: Role[] = ["financial", "attendant"];
const inventory: Role[] = ["inventory"];
const clinical = new Set(["customers", "surgeries", "prescriptions", "aggregate", "consultations", "imagiologies", "ambulatories", "exams", "screenings", "signings", "observations", "request-exams", "hospitalizations", "treatment-observations", "administrations", "attendances", "ambulatory-plans"]);
const catalog = new Set(["services", "materials", "products", "exemptions", "protocols", "insurances", "interns", "partners", "suppliers", "payments", "banks", "sections", "categories", "drugs", "units-of-measure"]);
const stock = new Set(["stock", "inventories", "purchases", "uploads"]);
const financial = new Set(["invoices", "flows", "deposits", "finances", "balances", "reports"]);
export function canAccess(role: Role, method: string, section: string, path = "", body?: any): boolean {
  if (role === "admin") return true;
  const read = method === "GET" || method === "HEAD";
  if (section === "users") return read; // Public staff directory; mutations are administrative.
  if (section === "notifications") return true;
  if (section === "companies") return read;
  if (section === "area-reports") return read && [...clinicalRoles, ...finance].includes(role);
  if (catalog.has(section)) {
    if (read) return true;
    return role === "inventory" && ["products", "materials", "suppliers", "categories", "units-of-measure"].includes(section);
  }
  // Patient billing/demographic endpoints are required by the financial workflow.
  if (section === "customers" && role === "financial") return read;
  if (finance.includes(role)) {
    if (section === "request-exams" && method === "POST" && path === "/request-exams/external") return true;
    if (section === "request-exams" && method === "PATCH" && /^\/request-exams\/[0-9a-f-]{36}$/.test(path) && Array.isArray(body?.exams) && Object.keys(body).every((key) => key === "exams")) return true;
    if (["prescriptions", "observations", "surgeries", "administrations"].includes(section) && method === "PATCH" && new RegExp(`^/${section}/[0-9a-f-]{36}$`).test(path) && body?.paid === true && Object.keys(body).every((key) => ["paid", "customerId"].includes(key))) return true;
  }
  if (section === "consultations" && method === "PATCH" && ["analyst", "chiefLab", "techLab"].includes(role)) return body?.stage === "EXAM_RESULT" && Object.keys(body).every((key) => key === "stage");
  if (section === "request-exams" && !read) {
    const lab = ["analyst", "chiefLab", "techLab"].includes(role);
    if (method === "POST" && path === "/request-exams") return lab;
    if (method === "PATCH" && /^\/request-exams\/(claim|conclude)\//.test(path)) return lab;
    if (method === "POST" && /^\/request-exams\/[0-9a-f-]{36}$/.test(path)) return role === "doctor";
  }
  if (section === "prescriptions" && method === "POST" && /^\/prescriptions\/[0-9a-f-]{36}\/dispense$/.test(path)) return ["nurse", "techNursian"].includes(role);
  if (clinical.has(section)) {
    if (read) return clinicalRoles.includes(role);
    const writers: Record<string, Role[]> = {
      customers: ["attendant"], aggregate: ["attendant"], attendances: ["attendant"],
      screenings: ["nurse", "techNursian"], consultations: ["doctor"],
      prescriptions: ["doctor"], surgeries: ["doctor", "nurse"],
      imagiologies: ["doctor", "analyst", "chiefLab", "techLab"], exams: ["analyst", "chiefLab", "techLab"],
      "request-exams": ["doctor", "analyst", "chiefLab", "techLab"],
      administrations: ["nurse", "techNursian"], hospitalizations: ["doctor", "nurse", "techNursian"],
      observations: ["doctor", "nurse", "techNursian"], "treatment-observations": ["doctor", "nurse", "techNursian"],
      ambulatories: ["doctor", "nurse", "techNursian"], "ambulatory-plans": ["doctor", "nurse", "techNursian"],
      signings: ["nurse", "techNursian"],
    };
    return (writers[section] ?? []).includes(role);
  }
  if (stock.has(section)) {
    if (section === "stock" && /\/(items|consumables\/suggest|consumptions\/declare)(\/|$)/.test(path)) return ["doctor", "nurse", "techNursian", "analyst", "chiefLab", "techLab", "inventory"].includes(role);
    return inventory.includes(role) || (read && role === "financial");
  }
  if (financial.has(section)) return finance.includes(role);
  return false;
}
export function authorize(req: Request, res: Response, next: NextFunction) {
  const section = req.path.split("/")[1];
  if (!req.user || !canAccess(req.user.role, req.method, section, req.path, req.body)) {
    res.status(403).json({ success: false, message: "Sem permissão para esta operação" }); return;
  }
  // Authorship is always resolved from the active account, never from request data.
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body) && "userId" in req.body) req.body.userId = req.user.id;
  next();
}
