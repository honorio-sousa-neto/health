import { Category, Invoice } from "@prisma/client";
import ExcelJS from "exceljs";
import path from "path";
import { FlowRepository } from "../../repositories/flow";
import {
  HttpResponse,
  IController,
  IRepository,
  Message,
  StatusCode,
} from "../../types/global.interfaces";
import { generateHashes, generateReference } from "../../utils/invoice";
import {
  createInvoice,
  TCreateInvoice,
  TUpdateInvoice,
  updateInvoice,
} from "../../validator/invoice.validator";
import { FlowController } from "../flow";

export class InvoiceController
  implements IController<Invoice, TCreateInvoice, TUpdateInvoice>
{
  constructor(
    private readonly repository: IRepository<
      Invoice,
      TCreateInvoice,
      TUpdateInvoice
    >
  ) {}
  async index(payload: {
    search?: string;
    page?: number;
    perPage?: number;
    category?: string;
  }): Promise<HttpResponse<Invoice[]>> {
    try {
      const response = await this.repository.index(payload);
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async indexByStatus(payload: {
    search?: string;
    page?: number;
    perPage?: number;
    status?: string;
  }): Promise<HttpResponse<Invoice[]>> {
    try {
      if (!this.repository.indexByStatus) throw new Error("Deu merda");
      const response = await this.repository.indexByStatus(payload);
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error) {
      return {
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async show(id: string): Promise<HttpResponse<Invoice>> {
    try {
      const response = await this.repository.show(id);
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error) {
      return {
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async create(payload: TCreateInvoice): Promise<HttpResponse<Invoice>> {
    try {
      let test: Invoice;

      const { bank, ...payloadToValidate } = payload;
      payloadToValidate.hash4 = generateHashes(4);
      payloadToValidate.hash64 = generateHashes(64);
      payloadToValidate.reference = await generateReference(payload.type);
      payloadToValidate.serie = String(new Date().getFullYear());

      if (payload.type == "FR" || payload.type == "RC") {
        if (!payload.total) throw new Error("Total não foi calculado");
        if (payload.amount_received && payload.amount_received < payload.total)
          throw new Error("Insira um montante válido");
        payloadToValidate.status = "PAGO";
      }

      if (
        payload.type == "NC" ||
        payload.type == "RC" ||
        payload.type == "ND"
      ) {
        if (!payload.invoiceId) throw new Error("Insira uma referência válida");
      }

      if (payload.type == "RC") {
        payloadToValidate.status = "PAGO";
      }

      if (
        payload.type == "ND" ||
        payload.type == "NC" ||
        payload.type == "PP"
      ) {
        payloadToValidate.status = "FINAL";
      }

      if (payload.type == "FT") {
        payloadToValidate.status = "POR_PAGAR";
      }

      const payloadValidated = createInvoice.parse(payloadToValidate);
      const response = await this.repository.create(payloadValidated);
      if (payload.type == "RC" || payload.type == "FR") {
        const repository = new FlowRepository();
        const controller = new FlowController(repository);
        await controller.create({
          amount: Number(payloadValidated.total),
          description: `Pagamento do documento ${
            payload.type == "RC"
              ? (response.data as any).invoiceSource.reference
              : response.data?.reference
          }`,
          destination: bank ? bank : "Caixa",
          type: "ENTRY",
        });
      }
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async update(
    id: string,
    payload: TUpdateInvoice
  ): Promise<HttpResponse<Invoice>> {
    try {
      const payloadValidated = updateInvoice.parse(payload);
      const response = await this.repository.update(id, payloadValidated);
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error) {
      return {
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async softDelete(id: string): Promise<HttpResponse<Invoice>> {
    try {
      const response = await this.repository.softDelete(id);
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error) {
      return {
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async destroy(id: string): Promise<HttpResponse<Invoice>> {
    try {
      const response = await this.repository.destroy(id);
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error) {
      return {
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      };
    }
  }

  async filter(search: string): Promise<HttpResponse<Invoice[]>> {
    try {
      if (!this.repository.filter) throw new Error("Nao implemementado");
      const response = await this.repository.filter(search);
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error) {
      return {
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      };
    }
  }

  async invoiceFromInsurance(
    payload: {
      search?: string;
      page: number;
      perPage: number;
      orderBy?: any;
      category?: string;
    },
    insuranceId: string,
    statusOfDocument: string
  ): Promise<HttpResponse<Invoice[]>> {
    try {
      if (!this.repository.invoiceFromInsurance)
        throw new Error("Nor implemeyted");
      const response = await this.repository.invoiceFromInsurance(
        payload,
        insuranceId,
        statusOfDocument
      );
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async invoiceFromCustomer(
    payload: {
      search?: string;
      page: number;
      perPage: number;
      orderBy?: any;
      category?: string;
    },
    customerId: string,
    statusOfDocument: string
  ): Promise<HttpResponse<Invoice[]>> {
    try {
      if (!this.repository.invoiceFromCustomer)
        throw new Error("Nor implemented");
      const response = await this.repository.invoiceFromCustomer(
        payload,
        customerId,
        statusOfDocument
      );
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  async invoiceFromInsuranceTotal(
    insuranceId: string,
    statusOfDocument: string
  ): Promise<HttpResponse<number | null>> {
    try {
      if (!this.repository.invoiceFromInsuranceTotal)
        throw new Error("Nor implemented");
      const response = await this.repository.invoiceFromInsuranceTotal(
        insuranceId,
        statusOfDocument
      );
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
  addSheetData(sheet: ExcelJS.Worksheet, data: any[]) {
    sheet.columns = [
      { header: "Cliente", key: "name", width: 30 },
      { header: "NIF", key: "nif", width: 18 },
      { header: "Ref..", key: "reference", width: 20 },
      {
        header: "Total",
        key: "total",
        width: 35,
        alignment: { vertical: "middle" },
      },
      {
        header: "Método de pagamento",
        key: "payment",
        width: 35,
        alignment: { vertical: "middle" },
      },
    ];
    data.forEach((row) => {
      console.log(JSON.stringify(row, null, 2));
      sheet.addRow(row);
    });

    // Estiliza o cabeçalho
    // sheet.getRow(1).eachCell((cell) => {
    //   cell.font = { bold: true }
    //   cell.fill = {
    //     type: 'pattern',
    //     pattern: 'solid',
    //     fgColor: { argb: 'FFA500' }, // Cor laranja
    //   }
    //   cell.alignment = { horizontal: 'center', vertical: 'middle' }
    // })
  }

  async invoicesByMonth(
    month: number,
    year: number
  ): Promise<HttpResponse<any>> {
    try {
      if (!this.repository.invoicesByMonth)
        throw new Error("Method not implemented");
      const workbook = new ExcelJS.Workbook();

      const status = ["PAGO", "POR_PAGAR"];
      const { data: invoices } = await this.repository.invoicesByMonth(
        month,
        year
      );
      status.forEach((element) => {
        const sheet = workbook.addWorksheet(element);
        this.addSheetData(
          sheet,
          (invoices as Invoice[])
            .filter((item) => item.status == element)
            .map((invoice: any) => ({
              nif: invoice?.customer?.nif || "Desconhecido",
              name: invoice?.customer?.name || "Desconhecido",
              reference: invoice?.reference,
              total: invoice?.total,
              payment: invoice?.payment?.name || "N/A",
            }))
        );
      });
      const filePath = path.join(__dirname, "relatorio.xlsx");
      await workbook.xlsx.writeFile(filePath);
      return {
        body: {
          data: filePath,
        },
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: false,
      };
    }
  }
  async invoicesByCategoryOfService(
    payload: {
      search?: string;
      page: number;
      perPage: number;
      orderBy?: any;
      year: number;
      month: number;
      day?: number;
    },
    category: Category
  ): Promise<HttpResponse<Invoice[]>> {
    try {
      if (!this.repository.invoicesByCategoryOfService)
        throw new Error("Method not implemented");
      const response = await this.repository.invoicesByCategoryOfService(
        payload,
        category
      );
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: true,
      };
    }
  }
}
