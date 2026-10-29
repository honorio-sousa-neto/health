import { data } from "autoprefixer";
import { useCompanyStore } from "src/stores/company";
const storeCompany = useCompanyStore();

export const getCompanyData = () => {
  return {
    columns: [
      storeCompany.data.data.logo
        ? { image: `${storeCompany.data.data.logo}`, width: 70, height: 60 }
        : { text: "" },
      {
        text: `${storeCompany.data.data.nome}\nNº de contribuinte: ${storeCompany.data.data.nif}\nContacto: ${storeCompany.data.data.phone}\nEmail: ${storeCompany.data.data.email}\nEndereço: ${storeCompany.data.data.address}`,
        fontSize: 9,
      },
    ],
  };
};
export const getCustomerData = (data) => {
  return {
    columns: [
      {
        width: "*",

        text: `Cliente: ${
          data?.outros_dados?.cliente?.nome || "CONSUMIDOR FINAL"
        }\nNIF: ${
          data?.outros_dados?.cliente?.nif || "9999999999"
        }\nTelefone: ${data?.outros_dados?.cliente?.telefone}\nEndereço: ${
          data?.outros_dados?.cliente?.endereco
        }`,
        style: ["default"],
      },
    ],
    marginTop: 10,
  };
};

export const getSettingsInvoice = (data) => {
  return [
    {
      text: data.dados.tipo_Factura,
      alignment: "right",
      style: "default",
      bold: true,
    },
    {
      canvas: [{ type: "line", x1: 0, x2: 515, y1: 0, y2: 0, lineWidth: 1 }],
      marginTop: 1,
    },
    {
      columns: [
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: "Data de emissão",
        },
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: "Data de vencimento",
        },
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: "Moeda",
        },
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: "V/Ref.",
        },
        {
          width: "20%",
          text:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "Origem"
              : "",
        },
      ],
      margin: [0, 3, 0, 2],
      style: ["default"],
    },
    {
      canvas: [{ type: "line", x1: 0, x2: 515, y1: 0, y2: 0, lineWidth: 1 }],
    },
    {
      columns: [
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          }).format(new Date(data.dados?.data_emissao)),
        },
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          }).format(new Date(data.dados?.data_vencimento)),
          // text: '',
        },
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: "AOA",
        },
        {
          width:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? "20%"
              : "25%",
          text: `${data.dados?.sigla} ${data.dados?.referencia}`,
        },
        {
          width: "20%",
          text:
            data.dados.sigla == "ND" ||
            data.dados.sigla == "NC" ||
            data.dados.sigla == "RC"
              ? `${data.dados?.sigla_origem} ${data.dados?.origem}`
              : "",
        },
      ],
      marginTop: 3,
      style: ["default"],
    },
  ];
};

export const getItemsTable = (data) => {
  let itemsTable = [];
  data.dados.itens.forEach((item) => {
    const element = [
      {
        style: "default",
        text: [
          { text: `${item.product}\n` },
          { text: "(" + item.motivo_iva + ")", fontSize: 7, color: "grey" },
        ],
        alignment: "left",
      },
      { style: "default", text: item.qtd, alignment: "center" },
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
      { style: "default", text: item.discount, alignment: "center" },
      { style: "default", text: item.taxa, alignment: "center" },
      { style: "default", text: item.codigo_iva, alignment: "center" },
      {
        style: "default",
        text: new Intl.NumberFormat("de-DE", {
          currency: "AOA",
          style: "currency",
        })
          .format(item.total)
          .slice(0, -3),
        alignment: "right",
      },
    ];
    itemsTable.push(element);
  });

  return {
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
        ...itemsTable,
      ],
    },
    layout: {
      hLineWidth: (i, node) =>
        i === 0 || i === node.table.body.length ? 1 : 0.5,
      vLineWidth: () => 0,
      hLineColor: (i, node) =>
        i === 0 || i === node.table.body.length ? "black" : "grey",
    },
  };
};

export const resumeInvoice = (data) => {
  const incidencia = Object.keys(data.outros_dados.taxa_incidencia).map(
    (key) => {
      return [
        {
          style: "default",
          text: `${data.outros_dados.taxa_incidencia[key].descricao}`,
          alignment: "left",
        },
        {
          style: "default",
          text: `${data.outros_dados.taxa_incidencia[key].taxa}`,
          alignment: "center",
        },
        {
          style: "default",
          text: `${new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format(data.outros_dados.taxa_incidencia[key].incidencia)
            .slice(0, -3)}`,
          alignment: "center",
        },
        {
          style: "default",
          text: `${new Intl.NumberFormat("de-DE", {
            currency: "AOA",
            style: "currency",
          })
            .format(data.outros_dados.taxa_incidencia[key].valor)
            .slice(0, -3)}`,
          alignment: "right",
        },
      ];
    }
  );
  return {
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
            ...incidencia,
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
                text: "Subtotal",
                style: "default",
                alignment: "left",
              },
              {
                text: new Intl.NumberFormat("de-DE", {
                  currency: "AOA",
                  style: "currency",
                })
                  .format(data.dados.subtotal)
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
                text: `${data.dados.desconto}`,
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
                text: `${new Intl.NumberFormat("de-DE", {
                  currency: "AOA",
                  style: "currency",
                })
                  .format(data.outros_dados.total_imposto)
                  .slice(0, -3)}`,
                style: "default",
                alignment: "right",
              },
            ],
            Number(data.dados.valor_taxa)
              ? [
                  {
                    text: "Taxa de entrega",
                    style: "default",
                    alignment: "left",
                  },
                  {
                    text: `${new Intl.NumberFormat("de-DE", {
                      currency: "AOA",
                      style: "currency",
                    })
                      .format(Number(data.dados.valor_taxa))
                      .slice(0, -3)}`,
                    style: "default",
                    alignment: "right",
                  },
                ]
              : [{ text: "", colSpan: 2 }],
            [
              {
                text: "Total documento",
                style: "default",
                alignment: "left",
              },
              {
                text: new Intl.NumberFormat("de-DE", {
                  currency: "AOA",
                  style: "currency",
                })
                  .format(data.dados.total_doc)
                  .slice(0, -3),
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
  };
};
