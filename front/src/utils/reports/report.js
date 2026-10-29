import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts;

export const printReport = (data, { type, from, to, range }) => {
  function gerarTabelaCategoria(data, categoria) {
    const body = [];

    // Cabeçalho da tabela
    body.push(["Serviço", "Quantidade"]);

    // Verifica se a categoria existe
    if (data.services[categoria]) {
      const servicos = data.services[categoria];
      for (const [nomeServico, quantidade] of Object.entries(servicos)) {
        body.push([nomeServico, quantidade.toString()]);
      }
    } else {
      // Caso categoria não exista
      body.push([
        { text: "Nenhum serviço encontrado", colSpan: 2, alignment: "center" },
        {},
      ]);
    }

    return body;
  }
  try {
    pdfMake.fonts = {
      Roboto: {
        normal:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
        bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
        italics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
        bolditalics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
      },
    };

    const docDefinition = {
      content: [
        {
          text: "RECEPÇÃO GERAL",
          style: ["title"],
        },
        {
          text:
            type == "range"
              ? `Data: De ${new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                }).format(new Date(from))} Até ${new Intl.DateTimeFormat(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  }
                ).format(new Date(to))}`
              : `Data: ${new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                }).format(new Date(range))}` || 0,
          style: ["", { alignment: "center", fontSize: 9 }],
        },
        {
          marginTop: 20,
          text: "Utentes atendidos",
          style: ["subtitle"],
        },
        {
          marginTop: 5,
          table: {
            widths: ["*", "*", "*", "*"],
            body: [
              ["Novo", "Protocolo", "Cliente", "Seguro"],
              [
                "",
                data.customers.protocolo,
                data.customers.particular,
                data.customers.seguro,
              ],
              [
                {
                  text: `Total: ${data.customers.protocolo +
                    data.customers.particular +
                    data.customers.seguro}`,
                  colSpan: 4,
                  alignment: "right",
                },
                "",
                "",
                "",
              ],
            ],
          },
        },
        {
          marginTop: 20,
          text: "Serviços prestados",
          style: ["subtitle"],
        },
        {
          marginTop: 10,
          text: "Clínica geral",
          style: { bold: true, fontSize: 12 },
        },
        {
          marginTop: 5,
          table: {
            widths: ["*", "*"],
            body: gerarTabelaCategoria(data, "Enfermaria"),
          },
        },
        {
          marginTop: 10,
          text: "Laboratório",
          style: { bold: true, fontSize: 12 },
        },
        {
          marginTop: 5,
          table: {
            widths: ["*", "*"],
            body: gerarTabelaCategoria(data, "Laboratório"),
          },
        },
        {
          marginTop: 10,
          text: "Estomatologia",
          style: { bold: true, fontSize: 12 },
        },
        {
          marginTop: 5,
          table: {
            widths: ["*", "*"],
            body: gerarTabelaCategoria(data, "Estomatologia"),
          },
        },
        {
          marginTop: 10,
          text: "Farmácia",
          style: { bold: true, fontSize: 12 },
        },
        {
          marginTop: 5,
          table: {
            widths: ["*", "*"],
            body: gerarTabelaCategoria(data, "Farmácia"),
          },
        },
        {
          marginTop: 10,
          text: "Ecografia / Especialidade",
          style: { bold: true, fontSize: 12 },
        },
        {
          marginTop: 5,
          table: {
            widths: ["*", "*"],
            body: gerarTabelaCategoria(data, "Ecografia e especialidade"),
          },
        },
        {
          marginTop: 10,
          text: "Radiologia",
          style: { bold: true, fontSize: 12 },
        },
        {
          marginTop: 5,
          table: {
            widths: ["*", "*"],
            body: gerarTabelaCategoria(data, "Radiologia"),
          },
        },
      ],
      styles: {
        title: {
          fontSize: 24,
          bold: true,
          alignment: "center",
          color: "#32b989",
        },
        subtitle: {
          color: "#32b989",
          bold: true,
          fontSize: 14,
        },
        header: {
          fillColor: "#32b989",
          color: "#fff",
          bold: true,
        },
      },
      defaultStyle: {
        fontSize: 10,
        color: "#5a5a5a",
      },

      // defaultStyle: {
      //   font: "Roboto",
      // },
    };

    pdfMake.createPdf(docDefinition).open();
  } catch (error) {
    console.error("Error generating report PDF:", error);
  }
};

export const printFecho = (data, { date, payments = [] }) => {
  try {
    pdfMake.fonts = {
      Roboto: {
        normal:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
        bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
        italics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
        bolditalics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
      },
    };

    const AREAS = [
      { key: "Enfermaria",    label: "Clínica Geral"  },
      { key: "Laboratório",   label: "Laboratório"    },
      { key: "Imagiologia",   label: "Imagiologia"    },
      { key: "Ecografia",     label: "Ecografia"      },
      { key: "Estomatologia", label: "Estomatologia"  },
      { key: "Especialidade", label: "Especialidade"  },
      { key: "Farmácia",      label: "Farmácia"       },
    ];

    const fmtMoney = (v) =>
      new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        minimumFractionDigits: 0,
      }).format(v ?? 0);

    const fmtDate = (d) =>
      d
        ? new Intl.DateTimeFormat("pt-PT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(new Date(d + "T12:00:00"))
        : "";

    const fmtNow = new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const grandTotal = AREAS.reduce((s, a) => s + (data[a.key] ?? 0), 0);

    const areaRows = AREAS.map((a, i) => [
      {
        text: a.label,
        fillColor: i % 2 === 0 ? "#ffffff" : "#f8fafc",
        color: "#334155",
        margin: [0, 2, 0, 2],
      },
      {
        text: fmtMoney(data[a.key] ?? 0),
        alignment: "right",
        fillColor: i % 2 === 0 ? "#ffffff" : "#f8fafc",
        color: data[a.key] > 0 ? "#1e293b" : "#94a3b8",
        bold: data[a.key] > 0,
        margin: [0, 2, 0, 2],
      },
    ]);

    const tableBody = [
      [
        { text: "ÁREA", bold: true, color: "#ffffff", fillColor: "#1e293b", fontSize: 9 },
        { text: "VALOR (AOA)", bold: true, color: "#ffffff", fillColor: "#1e293b", fontSize: 9, alignment: "right" },
      ],
      ...areaRows,
      [
        { text: "TOTAL DO DIA", bold: true, color: "#ffffff", fillColor: "#32b989", fontSize: 11 },
        { text: fmtMoney(grandTotal), bold: true, color: "#ffffff", fillColor: "#32b989", fontSize: 11, alignment: "right" },
      ],
    ];

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 50, 40, 50],
      content: [
        // ── Cabeçalho ──────────────────────────────────────────
        {
          columns: [
            {
              stack: [
                { text: "FECHO DO DIA", style: "docTitle" },
                { text: `Faturamento por área · ${fmtDate(date)}`, style: "docSubtitle", marginTop: 4 },
              ],
            },
            {
              stack: [
                { text: `Emitido em`, style: "metaLabel" },
                { text: fmtNow, style: "metaValue", marginTop: 2 },
              ],
              alignment: "right",
              width: "auto",
            },
          ],
          marginBottom: 4,
        },
        // ── Linha separadora ────────────────────────────────────
        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: "#32b989" },
          ],
          margin: [0, 8, 0, 20],
        },
        // ── Label da secção ─────────────────────────────────────
        { text: "Resumo de Faturamento", style: "sectionLabel", marginBottom: 10 },
        // ── Tabela principal ────────────────────────────────────
        {
          table: {
            widths: ["*", 180],
            body: tableBody,
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0,
            hLineColor: () => "#e2e8f0",
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 9,
            paddingBottom: () => 9,
          },
        },

        // ── Métodos de pagamento ────────────────────────────────
        ...(payments.length
          ? [
              { text: "Métodos de Pagamento", style: "sectionLabel", margin: [0, 24, 0, 10] },
              {
                table: {
                  widths: ["*", 180],
                  body: [
                    [
                      { text: "MÉTODO", bold: true, color: "#ffffff", fillColor: "#1e293b", fontSize: 9 },
                      { text: "VALOR (AOA)", bold: true, color: "#ffffff", fillColor: "#1e293b", fontSize: 9, alignment: "right" },
                    ],
                    ...payments.map((p, i) => {
                      const unpaid = p.name === "Sem pagamento";
                      const bg = unpaid ? "#fefce8" : (i % 2 === 0 ? "#ffffff" : "#f8fafc");
                      return [
                        {
                          text: p.name,
                          fillColor: bg,
                          color: unpaid ? "#92400e" : "#334155",
                          italics: unpaid,
                        },
                        {
                          text: fmtMoney(p.total),
                          alignment: "right",
                          fillColor: bg,
                          color: unpaid ? "#b45309" : "#1e293b",
                          bold: true,
                        },
                      ];
                    }),
                  ],
                },
                layout: {
                  hLineWidth: () => 0.5,
                  vLineWidth: () => 0,
                  hLineColor: () => "#e2e8f0",
                  paddingLeft: () => 12,
                  paddingRight: () => 12,
                  paddingTop: () => 9,
                  paddingBottom: () => 9,
                },
              },
            ]
          : []),
      ],
      styles: {
        docTitle: {
          fontSize: 20,
          bold: true,
          color: "#1e293b",
        },
        docSubtitle: {
          fontSize: 11,
          color: "#64748b",
        },
        metaLabel: {
          fontSize: 8,
          color: "#94a3b8",
          bold: true,
        },
        metaValue: {
          fontSize: 9,
          color: "#475569",
        },
        sectionLabel: {
          fontSize: 9,
          bold: true,
          color: "#94a3b8",
        },
      },
      defaultStyle: {
        fontSize: 11,
        color: "#334155",
      },
    };

    pdfMake.createPdf(docDefinition).open();
  } catch (error) {
    console.error("Error generating report PDF:", error);
  }
};
