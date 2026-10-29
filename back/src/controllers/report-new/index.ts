import { Prisma } from "@prisma/client";
import * as path from "path";
import pdfPrinter from "pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { CompanyRepository } from "../../repositories/company-new";
import { InvoiceRepository } from "../../repositories/invoice";
import { CompanyController } from "../company-new";
const documents = {
  FT: "Factura",
  RC: "Recibo",
  FR: "Factura-Recibo",
  ND: "Nota de Débito",
  NC: "Nota de Débito",
  PP: "Proforma",
};

type InvoiceItemWithService = Prisma.InvoiceItemGetPayload<{
  include: { service: true };
}>;

type InvoiceWithAll = Prisma.InvoiceGetPayload<{
  include: {
    invoiceItems: true;
    customer: {
      include: { customersInsurance: { include: { insurance: true } } };
    };
    payment: true;
    invoiceSource: {
      include: {
        customer: {
          include: { customersInsurance: { include: { insurance: true } } };
        };
        invoiceItems: { include: { service: true } };
      };
    };
    user: true;
  };
}>;
export class InvoicePrintController {
  getItemsInvoice(items: InvoiceItemWithService[]) {
    let itemsTable: any = [];
    items.forEach((item: InvoiceItemWithService) => {
      const element = [
        {
          style: "default",
          text: `${item.service.name} ${
            (item as any).service.description
              ? "- [" + (item as any).service.description + "]"
              : ""
          }`,
          alignment: "left",
        },
        { style: "default", text: item.quantity, alignment: "center" },
        {
          style: "default",
          text: new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format(item.price)
            .slice(0, -3),
          alignment: "center",
        },
        {
          style: "default",
          text: new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format(item.discount)
            .slice(0, -3),
          alignment: "center",
        },
        { style: "default", text: "0,00", alignment: "center" },
        { style: "default", text: "", alignment: "center" },
        {
          style: "default",
          text: new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format((item.price - item.discount) * item.quantity)
            .slice(0, -3),
          alignment: "right",
        },
      ];
      itemsTable.push(element);
    });
    return itemsTable;
  }

  async handle(id: string, second = false): Promise<Buffer> {
    const repository = new InvoiceRepository();
    const companyRepository = new CompanyRepository();
    const companyController = new CompanyController(companyRepository);
    const { data } = await repository.show(id);
    const company = (await companyController.show("company")).body?.data;

    const invoice = data as InvoiceWithAll;

    return new Promise(async (resolve, reject) => {
      const customer = ["FR", "FT", "PP"].includes(invoice.type)
        ? invoice.customer
        : invoice.invoiceSource?.customer;
      const fonts = {
        Helvetica: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      };
      let items = ["FR", "FT", "PP"].includes(invoice.type)
        ? (invoice?.invoiceItems as InvoiceItemWithService[])
        : (invoice.invoiceSource?.invoiceItems as InvoiceItemWithService[]);
      const imagePath = path.resolve(__dirname, "../../../image/logo.jpg");
      const companyData = [
        {
          // : company.name,
          // style: ['header'],
          image: imagePath,
          width: 80,
          height: 40,
        },
        "VLS Global Prestação de Serviços, SA",
        `Endereço: ${company?.address}`,
        `Telefone: (+244) ${company?.phone}`,
        `Email: ${company?.email}`,
        `Número de contribuinte: ${company?.nif}`,
      ];
      const printer = new pdfPrinter(fonts);
      let docDefinition: TDocumentDefinitions = {
        content: [
          {
            columns: [
              {
                width: "50%",
                style: ["default"],
                columns: [companyData],
              },
              {
                width: "50%",
                style: ["default"],
                columns: [
                  [
                    {
                      text: documents[invoice?.type as keyof typeof documents],
                      alignment: "right",
                      style: ["header"],
                    },
                    {
                      text: `Referência: ${invoice?.reference}`,
                      alignment: "right",
                    },
                    {
                      text:
                        "Data de emissão: " +
                        new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(new Date(invoice?.emission_date as Date)),
                      alignment: "right",
                    },
                    {
                      text: `Série: ${invoice.serie}`,
                      alignment: "right",
                    },
                    {
                      text: second ? "Cópia" : "Original",
                      alignment: "right",
                      fontSize: 9,
                    },
                  ],
                ],
              },
            ],
            // optional space between columns
            columnGap: 10,
          },
          {
            columns: [
              {
                width: "50%",
                marginTop: 15,
                table: {
                  widths: ["30%", "70%"],
                  headerRows: 1,
                  body: [
                    [
                      {
                        text: customer?.customersInsurance[0]?.insuranceNumber
                          ? "Segurado"
                          : "Cliente",
                        style: "tableHeader",
                        colSpan: 2,
                        alignment: "center",
                      },
                      {},
                    ],

                    [
                      {
                        text: "Nome",
                        style: ["bodyStyle"],
                      },
                      {
                        text: customer?.name,
                        style: ["bodyStyle"],
                      },
                    ],
                    [
                      {
                        text: "NIF",
                        style: ["bodyStyle"],
                      },
                      {
                        text: customer?.nif,
                        style: ["bodyStyle"],
                      },
                    ],
                    [
                      {
                        text: "Cartão",
                        style: ["bodyStyle"],
                      },
                      {
                        text: customer?.customersInsurance[0]?.insuranceNumber,
                        style: ["bodyStyle"],
                      },
                    ],
                  ],
                },
              },
              customer?.customersInsurance[0]?.insuranceNumber
                ? {
                    width: "50%",
                    marginTop: 15,
                    table: {
                      widths: ["30%", "70%"],
                      headerRows: 1,
                      body: [
                        [
                          {
                            text: "Seguradora",
                            style: "tableHeader",
                            colSpan: 2,
                            alignment: "center",
                          },
                          {},
                        ],

                        [
                          {
                            text: "Nome",
                            style: ["bodyStyle"],
                          },
                          {
                            text: customer?.customersInsurance[0]?.insurance
                              ?.name,
                            style: ["bodyStyle"],
                          },
                        ],
                        [
                          {
                            text: "Endereço",
                            style: ["bodyStyle"],
                          },
                          {
                            text: customer?.customersInsurance[0]?.insurance
                              ?.address,
                            style: ["bodyStyle"],
                          },
                        ],
                        [
                          {
                            text: "Contribuinte",
                            style: ["bodyStyle"],
                          },
                          {
                            text: customer?.customersInsurance[0]?.insurance
                              ?.nif,
                            style: ["bodyStyle"],
                          },
                        ],
                      ],
                    },
                  }
                : {
                    width: "50%",
                    marginTop: 15,
                    text: "",
                  },
            ],
            columnGap: 10,
          },
          {
            canvas: [
              { type: "line", x1: 0, x2: 515, y1: 0, y2: 0, lineWidth: 1 },
            ],
            marginTop: 10,
          },
          {
            columns: [
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",
                text: "Data de emissão",
              },
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",
                text: "Data de vencimento",
              },
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",
                text: "Moeda",
              },
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",
                text: "V/Ref.",
                alignment: "right",
              },
              {
                width: "20%",
                text: ["FR", "FT", "PP"].includes(invoice.type) ? "" : "Origem",
                alignment: "right",
              },
            ],
            margin: [0, 3, 0, 2],
            style: ["default"],
          },
          {
            canvas: [
              { type: "line", x1: 0, x2: 515, y1: 0, y2: 0, lineWidth: 1 },
            ],
          },
          {
            columns: [
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",
                text: new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(new Date(invoice?.emission_date as Date)),
              },
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",

                text: "",
              },
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",
                text: "AOA",
              },
              {
                width: ["FR", "FT", "PP"].includes(invoice.type)
                  ? "25%"
                  : "20%",
                text: `${invoice?.reference}`,
                alignment: "right",
              },
              {
                width: "20%",
                text: `${invoice?.invoiceSource?.reference || ""}`,
                alignment: "right",
              },
            ],
            marginTop: 3,
            style: ["default"],
          },
          {
            marginTop: 25,
            table: {
              widths: ["40%", "10%", "10%", "10%", "10%", "10%", "10%"],
              headerRows: 1,
              body: [
                [
                  {
                    text: "Descrição",
                    style: "default",
                    alignment: "left",
                  },
                  {
                    text: "Qtd",
                    style: "default",
                    alignment: "center",
                  },
                  {
                    text: "Unit.P",
                    style: "default",
                    alignment: "center",
                  },
                  {
                    text: "Desc.",
                    style: "default",
                    alignment: "center",
                  },
                  {
                    text: "Taxa(%)",
                    style: "default",
                    alignment: "center",
                  },
                  {
                    text: "Código",
                    style: "default",
                    alignment: "center",
                  },
                  {
                    text: "Valor",
                    style: "default",
                    alignment: "right",
                  },
                ],
                ...this.getItemsInvoice(items),
              ],
            },
            layout: {
              hLineWidth: (i, node) =>
                i === 0 || i === node.table.body.length ? 1 : 0.5,
              vLineWidth: () => 0,
              hLineColor: (i, node) =>
                i === 0 || i === node.table.body.length ? "black" : "grey",
            },
          },
          {
            marginTop: 30,
            columns: [
              {
                width: "60%",
                table: {
                  widths: ["20%", "15%", "30%", "35%"],
                  body: [
                    [
                      {
                        text: "Descrição",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: "Taxa%",
                        style: "default",
                        alignment: "center",
                      },
                      {
                        text: "Incidência",
                        style: "default",
                        alignment: "center",
                      },
                      {
                        text: "Valor do imposto",
                        style: "default",
                        alignment: "right",
                      },
                    ],
                    [
                      {
                        text: "IVA",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: "0,00",
                        style: "default",
                        alignment: "center",
                      },
                      {
                        text: new Intl.NumberFormat("de-DE", {
                          currency: "AOA",
                          style: "currency",
                        })
                          .format(invoice?.total as number)
                          .slice(0, -3),
                        style: "default",
                        alignment: "center",
                      },
                      {
                        text: "0,00",
                        style: "default",
                        alignment: "right",
                      },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: (i, node) =>
                    i === 0 || i === node.table.body.length ? 1 : 1,
                  vLineWidth: () => 0,
                  hLineColor: (i, node) =>
                    i === 0 || i === node.table.body.length ? "black" : "black",
                },
              },
              {
                width: "40%",
                table: {
                  widths: ["*", "*"],
                  body: [
                    [
                      {
                        text: "Total liquido",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: new Intl.NumberFormat("de-DE", {
                          currency: "AOA",
                          style: "currency",
                        })
                          .format(invoice?.total as number)
                          .slice(0, -3),
                        style: "default",
                        alignment: "right",
                      },
                    ],
                    [
                      {
                        text: "Total de desconto",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: new Intl.NumberFormat("de-DE", {
                          currency: "AOA",
                          style: "currency",
                        })
                          .format(invoice?.discount as number)
                          .slice(0, -3),
                        style: "default",
                        alignment: "right",
                      },
                    ],
                    [
                      {
                        text: "Total de imposto",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: "0,00",
                        style: "default",
                        alignment: "right",
                      },
                    ],
                    [
                      {
                        text: "Total retenção",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: "0,00",
                        style: "default",
                        alignment: "right",
                      },
                    ],
                    [
                      {
                        text: "Total a pagar",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: new Intl.NumberFormat("de-DE", {
                          currency: "AOA",
                          style: "currency",
                        })
                          .format(invoice?.total as number)
                          .slice(0, -3),
                        style: "default",
                        alignment: "right",
                      },
                    ],
                    [
                      {
                        text: invoice?.amount_received ? "Pago" : "",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: invoice?.amount_received
                          ? new Intl.NumberFormat("de-DE", {
                              currency: "AOA",
                              style: "currency",
                            })
                              .format(invoice?.amount_received as number)
                              .slice(0, -3)
                          : "",
                        style: "default",
                        alignment: "right",
                      },
                    ],
                    [
                      {
                        text: invoice?.amount_received ? "Troco" : "",
                        style: "default",
                        alignment: "left",
                      },
                      {
                        text: invoice?.amount_received
                          ? new Intl.NumberFormat("de-DE", {
                              currency: "AOA",
                              style: "currency",
                            })
                              .format(
                                Number(invoice?.amount_received) -
                                  Number(invoice.total),
                              )
                              .slice(0, -3)
                          : "",
                        style: "default",
                        alignment: "right",
                      },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: (i, node) =>
                    i === 0 || i === 4 || i === node.table.body.length ? 1 : 0,
                  vLineWidth: () => 0,

                  hLineColor: (i, node) =>
                    i === 0 || i === node.table.body.length ? "black" : "black",
                },
              },
            ],
            columnGap: 20,
          },
          {
            marginTop: 30,
            text: `Os bens/serviços foram colocados à disposição do adquirente na data de ${new Intl.DateTimeFormat(
              "en-GB",
              {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              },
            ).format(new Date(invoice?.emission_date as Date))} em Luanda`,
            alignment: "left",
            style: ["default"],
          },
          {
            text: `Operador: ${invoice?.user?.name}`,
            alignment: "left",
            style: ["default"],
          },
        ],
        footer: {
          style: {
            fontSize: 9,
          },
          marginLeft: 36,
          marginRight: 36,

          columns: [
            [
              {
                text:
                  `LKxQ` +
                  "-Processado por programa validado nº 355/AGT/2023 FacilitaSoft (3.1.1)",
                alignment: "center",
              },
            ],
          ],
        },
        defaultStyle: {
          font: "Helvetica",
        },
        styles: {
          header: {
            fontSize: 16,
          },
          default: {
            lineHeight: 1.3,
            fontSize: 9,
          },
          anotherStyle: {
            italics: true,
            alignment: "right",
          },
          tableHeader: {
            // fillColor: '#06063f',
            // color: 'white',
            fontSize: 10,
            bold: true,
          },
          bodyStyle: {
            alignment: "left",
            fontSize: 10,
            lineHeight: 1,
          },
        },
      };
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: any[] = [];
      pdfDoc.on("data", (chunk) => {
        chunks.push(chunk);
      });
      pdfDoc.end();
      pdfDoc.on("end", () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      pdfDoc.on("error", (error) => {
        reject(error);
      });
    });
  }

  async defineDocument(id: string, second = false): Promise<Buffer> {
    const repository = new InvoiceRepository();
    const companyRepository = new CompanyRepository();
    const companyController = new CompanyController(companyRepository);
    const { data } = await repository.show(id);
    const company = (await companyController.show("company")).body?.data;

    const invoice = data as InvoiceWithAll;
    return new Promise(async (resolve, reject) => {
      const customer = ["FR", "FT", "PP"].includes(invoice.type)
        ? invoice.customer
        : invoice.invoiceSource?.customer;
      const fonts = {
        Helvetica: {
          normal: "Helvetica",
          bold: "Helvetica-Bold",
          italics: "Helvetica-Oblique",
          bolditalics: "Helvetica-BoldOblique",
        },
      };

      let items = ["FR", "FT", "PP"].includes(invoice.type)
        ? (invoice?.invoiceItems as InvoiceItemWithService[])
        : (invoice.invoiceSource?.invoiceItems as InvoiceItemWithService[]);
      const imagePath = path.resolve(__dirname, "../../../image/logo.jpg");
      const companyData = [
        {
          // : company.name,
          // style: ['header'],
          image: imagePath,
          width: 80,
          height: 40,
        },
        "VLS Global Prestação de Serviços, SA",
        `Endereço: ${company?.address}`,
        `Telefone: (+244) ${company?.phone}`,
        `Email: ${company?.email}`,
        `Número de contribuinte: ${company?.nif}`,
      ];
      const printer = new pdfPrinter(fonts);
      let itemsTable: any = [];

      const docDefinition: TDocumentDefinitions = {
        pageSize: {
          width: 80 * 2.83465,
          height: "auto",
        },
        pageMargins: [3, 10, 3, 10],
        content: [
          {
            text: `${company?.name}`,
            alignment: "center",
            style: { bold: true, fontSize: 11 },
            marginBottom: 4,
          },
          {
            text: `Nº de contibuinte: ${company?.nif || ""}`,
            alignment: "center",
            style: ["header"],
          },
          {
            text: `Endereço: ${company?.address || ""}`,
            alignment: "center",
            style: "header",
          },
          {
            text: `Telefone: ${company?.phone || ""}`,
            alignment: "center",
            style: "header",
          },
          {
            text: `Email: ${company?.email || ""}`,
            alignment: "center",
            style: "header",
          },
          {
            canvas: [
              { type: "line", x1: 0, y1: 0, x2: 218, y2: 0, lineWidth: 1 },
            ],
            margin: [0, 0, 0, 4],
          },
          {
            text:
              "Ref.:" +
              " " +
              `${
                invoice?.reference
              }\n Data de emissão:  ${new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(new Date(invoice?.emission_date as Date))}\n Série: ${
                invoice.serie
              } `,
            alignment: "left",
            style: {
              fontSize: 9,
              lineHeight: 1.4,
            },
          },
          {
            canvas: [
              { type: "line", x1: 0, y1: 0, x2: 218, y2: 0, lineWidth: 1 },
            ],
            margin: [0, 2, 0, 5],
          },
          {
            text: `Cliente: ${customer?.name} \nNIF: ${
              customer?.nif || " "
            } \n Contacto: ${customer?.phone || ""}\n Cartão: ${
              customer?.customersInsurance[0]?.insuranceNumber || " "
            }`,
            alignment: "left",
            style: {
              fontSize: 9,
            },
            margin: [0, 3, 0, 0],
          },
          {
            canvas: [
              { type: "line", x1: 0, y1: 0, x2: 218, y2: 0, lineWidth: 1 },
            ],
            margin: [0, 5, 0, 5],
          },
          {
            table: {
              headerRows: 1,
              widths: ["25%", "15%", "20%", "20%", "20%"],
              body: [
                [
                  { text: "Descrição", style: "tableHeader" },
                  { text: "Qtd", style: "tableHeader" },
                  { text: "P. Unit", alignment: "right", style: "tableHeader" },
                  { text: "Desc.", alignment: "right", style: "tableHeader" },
                  { text: "Total", style: "tableHeader" },
                ],
                ...this.getItemsInvoiceTermal(items, invoice.isAmbulatory),
              ],
            },
            layout: {
              hLineWidth: function (i, node) {
                return 0; // Remove as linhas horizontais
              },
              vLineWidth: function (i, node) {
                return 0; // Remove as linhas verticais
              },
              paddingLeft: function (i, node) {
                return 4;
              },
              paddingRight: function (i, node) {
                return 4;
              },
              paddingTop: function (i, node) {
                return 2;
              },
              paddingBottom: function (i, node) {
                return 2;
              },
            },
            fontSize: 9,
            marginTop: 2,
          },
          {
            canvas: [
              { type: "line", x1: 0, y1: 0, x2: 218, y2: 0, lineWidth: 1 },
            ],
            margin: [0, 5, 0, 5],
          },
          {
            columns: [
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: "Total liquido",
              },
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: new Intl.NumberFormat("de-DE", {
                  currency: "AOA",
                  style: "currency",
                })
                  .format(
                    Number(Number(invoice.total) + Number(invoice.discount)),
                  )
                  .slice(0, -3),
                alignment: "right",
              },
            ],
          },
          {
            columns: [
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: "Total desconto",
              },
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: new Intl.NumberFormat("de-DE", {
                  currency: "AOA",
                  style: "currency",
                })
                  .format(Number(invoice.discount))
                  .slice(0, -3),
                alignment: "right",
              },
            ],
          },
          {
            columns: [
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: "Total de imposto",
              },
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: `0,00`,
                alignment: "right",
              },
            ],
          },
          {
            columns: [
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: "Retenção",
              },
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  lineHeight: 1.4,
                },
                text: `0,00`,
                alignment: "right",
              },
            ],
          },
          {
            columns: [
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  bold: true,
                },
                text: `Total ${invoice.type == "FT" ? "a pagar" : ""}`,
              },
              {
                width: "50%",
                style: {
                  fontSize: 9,
                  bold: true,
                },
                text: new Intl.NumberFormat("de-DE", {
                  currency: "AOA",
                  style: "currency",
                })
                  .format(Number(invoice.total))
                  .slice(0, -3),
                alignment: "right",
              },
            ],
          },
          (invoice.type == "FR" || invoice.type == "RC") && !invoice.co_payment
            ? {
                columns: [
                  {
                    width: "50%",
                    style: {
                      fontSize: 9,
                      bold: true,
                    },
                    text: `Montante entregue`,
                  },
                  {
                    width: "50%",
                    style: {
                      fontSize: 9,
                      bold: true,
                    },
                    text: new Intl.NumberFormat("de-DE", {
                      currency: "AOA",
                      style: "currency",
                    })
                      .format(Number(invoice?.amount_received))
                      .slice(0, -3),
                    alignment: "right",
                  },
                ],
              }
            : {},
          invoice.type == "FR" || invoice.type == "RC"
            ? {
                columns: [
                  {
                    width: "50%",
                    style: {
                      fontSize: 9,
                    },
                    text: `${invoice.co_payment ? "Co-pagamento" : "Troco"}`,
                    bold: true,
                  },
                  {
                    width: "50%",
                    style: {
                      fontSize: 9,
                      bold: true,
                    },
                    text: new Intl.NumberFormat("de-DE", {
                      currency: "AOA",
                      style: "currency",
                    })
                      .format(
                        Number(invoice.co_payment) ||
                          Number(invoice?.amount_received) -
                            Number(invoice.total),
                      )
                      .slice(0, -3),
                    alignment: "right",
                  },
                ],
              }
            : {},
          invoice.type == "FR" || invoice.type == "RC"
            ? {
                columns: [
                  {
                    width: "50%",
                    style: {
                      fontSize: 9,
                    },
                    text: `Forma de pagamento`,
                  },
                  {
                    width: "50%",
                    style: {
                      fontSize: 9,
                    },
                    text: invoice?.payment?.name,
                    alignment: "right",
                  },
                ],
                margin: [0, 10, 0, 0],
              }
            : {},
          {
            text: "Coordenadas bancárias",
            style: {
              fontSize: 9,
              bold: true,
            },
            margin: [0, 10, 0, 0],
          },
          ...((company as any)?.banks ?? []).map((item: any) => ({
            text: `Nº de conta: ${item?.number} \n IBAN: AO06 ${item?.iban} \n `,
            alignment: "left",
            style: {
              fontSize: 9,
            },
            margin: [0, 0, 0, 0],
          })),

          {
            style: {
              fontSize: 6,
            },
            text: `Os bens/serviços foram colocados a disposição do adquirente na data de ${new Intl.DateTimeFormat(
              "en-GB",
              {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              },
            ).format(
              new Date(invoice?.emission_date as Date),
            )} e endereço de emissão do documento`,
          },
          {
            text: `Emitido por: ${invoice.user && invoice.user.name} \n${
              invoice?.hash4
            }-Processado por programa validado nº 355/AGT/2023 FacilitaSoft (3.1.1)`,
            alignment: "center",
            style: {
              fontSize: 6,
            },
            margin: [0, 3, 0, 0],
          },
        ],
        defaultStyle: {
          font: "Helvetica",
        },
        styles: {
          header: {
            fontSize: 10,
            lineHeight: 1.7,
          },
          tableHeader: {
            bold: true,
          },
        },
      };
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: any[] = [];
      pdfDoc.on("data", (chunk) => {
        chunks.push(chunk);
      });
      pdfDoc.end();
      pdfDoc.on("end", () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      pdfDoc.on("error", (error) => {
        reject(error);
      });
    });
  }
  // [
  //   { text: 'Serviço', style: 'tableHeader' },
  //   { text: 'Desc', style: 'tableHeader' },
  //   { text: 'Qtd', style: 'tableHeader' },
  //   { text: 'Preço', alignment: 'right', style: 'tableHeader' },
  // ],
  setNameProducts(amount: number): string {
    if (amount <= 500) return "Material Alfa";
    if (amount > 500 && amount <= 1000) return "Material Beta";
    if (amount > 1000 && amount <= 1500) return "Material Gama";
    return "Material Delta";
  }
  getItemsInvoiceTermal(
    items: InvoiceItemWithService[],
    isAmbulatory: boolean,
  ) {
    let itemsTable: any = [];
    items.forEach((item: InvoiceItemWithService) => {
      const element = [
        {
          // `[${item.service.name}] - ${item.service.description || ''}`
          style: "default",
          text: [
            {
              text:
                isAmbulatory &&
                !["Serviço", "Itens Comuns"].includes(item.service.name)
                  ? this.setNameProducts(item.price)
                  : ` ${item.service.name}`,
            },
            {
              text: `\n${
                (item as any).service.description
                  ? "[" + (item as any).service.description + "]"
                  : ""
              }`,
              style: {
                fontSize: 7,
                color: "grey",
              },
            },
          ],
          alignment: "left",
        },
        { style: "default", text: item.quantity, alignment: "center" },
        {
          style: "default",
          text: new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format(item.price)
            .slice(0, -3),
          alignment: "center",
        },
        {
          style: "default",
          text: new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format(item.discount * item.quantity)
            .slice(0, -3),
          alignment: "center",
        },

        {
          style: "default",
          text: new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format((item.price - item.discount) * item.quantity)
            .slice(0, -3),
          alignment: "right",
        },
      ];
      itemsTable.push(element);
    });
    return itemsTable;
  }
}
