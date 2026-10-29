import { AmbulatoryPlanRepository } from "../../repositories/ambulatory-plan";

export class AmbulatoryPlanController {
  constructor(private readonly repository: AmbulatoryPlanRepository) {}

  async create(prescriptionId: string, customerId: string) {
    try {
      const data = await this.repository.create(prescriptionId, customerId);
      return { data, statusCode: 201, success: true };
    } catch (e: any) {
      return { data: null, statusCode: 400, success: false, message: e.message };
    }
  }

  async index() {
    const data = await this.repository.findAll();
    return { data, statusCode: 200, success: true };
  }

  async show(planId: string) {
    const data = await this.repository.findOne(planId);
    if (!data) return { data: null, statusCode: 404, success: false, message: "Plano não encontrado" };
    return { data, statusCode: 200, success: true };
  }

  async markDone(sessionId: string, doneById: string) {
    try {
      const data = await this.repository.markDone(sessionId, doneById);
      return { data, statusCode: 200, success: true };
    } catch (e: any) {
      return { data: null, statusCode: 400, success: false, message: e.message };
    }
  }
}
