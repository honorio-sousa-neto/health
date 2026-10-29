import { UnitOfMeasureRepository } from "../../repositories/unit-of-measure";

const repo = new UnitOfMeasureRepository();

type UnitPayload = {
  name: string;
  abbreviation: string;
  category?: string | null;
  factor?: number;
  baseUnitId?: string | null;
};

export class UnitOfMeasureController {
  async index(search?: string) {
    try {
      const data = await repo.index(search);
      return { data, message: "Sucesso", statusCode: 200, success: true };
    } catch (error: any) {
      return { data: null, message: error.message, statusCode: 500, success: false };
    }
  }

  async show(id: string) {
    try {
      const data = await repo.show(id);
      return { data, message: data ? "Sucesso" : "Não encontrado", statusCode: data ? 200 : 404, success: !!data };
    } catch (error: any) {
      return { data: null, message: error.message, statusCode: 500, success: false };
    }
  }

  async create(payload: UnitPayload) {
    try {
      if (!payload.name || !payload.abbreviation) {
        return { data: null, message: "name e abbreviation são obrigatórios", statusCode: 400, success: false };
      }
      const data = await repo.create(payload);
      return { data, message: "Unidade criada", statusCode: 201, success: true };
    } catch (error: any) {
      return { data: null, message: error.message, statusCode: 500, success: false };
    }
  }

  async update(id: string, payload: Partial<UnitPayload>) {
    try {
      const data = await repo.update(id, payload);
      return { data, message: "Unidade actualizada", statusCode: 200, success: true };
    } catch (error: any) {
      return { data: null, message: error.message, statusCode: 500, success: false };
    }
  }

  async destroy(id: string) {
    try {
      await repo.destroy(id);
      return { data: null, message: "Removido", statusCode: 200, success: true };
    } catch (error: any) {
      return { data: null, message: error.message, statusCode: 500, success: false };
    }
  }
}
