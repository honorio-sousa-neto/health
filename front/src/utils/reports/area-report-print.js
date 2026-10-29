import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts;

pdfMake.fonts = {
  Roboto: {
    normal:      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold:        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:     "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

const GREY = "#666666";
const DARK = "#1e293b";

// ── Primitives ─────────────────────────────────────────────────────
const divider = () => ({
  canvas: [{ type: "line", x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.4, lineColor: "#cccccc" }],
  margin: [0, 6, 0, 6],
});

const sectionHead = (title) => ({
  text: title,
  fontSize: 10, bold: true, decoration: "underline", color: DARK,
  margin: [0, 10, 0, 5],
});

const bullet = (label, value, bold = false) => ({
  text: [
    { text: "• " + label + ": ", bold: true, fontSize: 9 },
    { text: String(value ?? 0), bold, fontSize: 9 },
  ],
  margin: [10, 1, 0, 1],
});

const textLine = (label, value) => ({
  text: [{ text: label + ": ", bold: true, fontSize: 9 }, { text: value || "—", fontSize: 9 }],
  margin: [10, 1, 0, 1],
});

const comentarios = (text) => ({
  text: [{ text: "Comentários: ", bold: true, italics: true, fontSize: 9 }, { text: text || "—", italics: true, fontSize: 9, color: GREY }],
  margin: [10, 5, 0, 4],
});

// ── Section blocks ──────────────────────────────────────────────────
function recepcaoSection(data, manual, comments) {
  const prov = data?.recepcao?.byProveniencia ?? data?.byProveniencia ?? {};
  const total = data?.recepcao?.total ?? data?.total ?? 0;
  return [
    sectionHead("RECEPÇÃO"),
    bullet("Total de pacientes", total, true),
    bullet("Particular", prov.particular ?? 0),
    bullet("Livre", manual?.livre ?? 0),
    bullet("Médicos", manual?.medicos ?? 0),
    bullet("Protocolo", prov.protocolo ?? 0),
    bullet("Parceria", prov.parceria ?? 0),
    bullet("Seguro", prov.seguro ?? 0),
    comentarios(comments?.recepcao),
  ];
}

function consultasSection(data, manual, comments) {
  const total = data?.consultas?.total ?? data?.total ?? 0;
  return [
    sectionHead("CONSULTAS"),
    bullet("Total", total, true),
    { text: "Clínica Geral:", bold: true, fontSize: 9, margin: [10, 4, 0, 2] },
    bullet("C/ Marcação",  manual?.comMarcacao ?? 0),
    bullet("S/ Marcação",  manual?.semMarcacao ?? 0),
    bullet("Especialidade", manual?.especialidade ?? 0),
    bullet("Controlo",     manual?.controlo ?? 0),
    bullet("Emergência",   manual?.emergencia ?? 0),
    comentarios(comments?.consultas),
  ];
}

function enfermariaSection(data, comments) {
  const obs = data?.enfermaria?.observations ?? data?.observations?.total ?? 0;
  const adm = data?.enfermaria?.administrations ?? data?.administrations?.total ?? 0;
  return [
    sectionHead("ENFERMARIA"),
    bullet("Observações",   obs),
    bullet("Administrações", adm),
    comentarios(comments?.enfermaria),
  ];
}

function ambulatorioSection(data, comments) {
  return [
    sectionHead("AMBULATÓRIO"),
    bullet("Total", data?.ambulatorio?.total ?? 0, true),
    comentarios(comments?.ambulatorio),
  ];
}

function observacaoSection(data, comments) {
  return [
    sectionHead("OBSERVAÇÃO"),
    bullet("Total", data?.observacao?.total ?? 0, true),
    comentarios(comments?.observacao),
  ];
}

function internamentoSection(data, comments) {
  return [
    sectionHead("INTERNAMENTO"),
    bullet("Total", data?.internamento?.total ?? 0, true),
    comentarios(comments?.internamento),
  ];
}

function farmaciaSection(data, comments) {
  const d = data?.farmacia ?? {};
  return [
    sectionHead("FARMÁCIA"),
    bullet("Total de receitas", d.total ?? 0, true),
    bullet("Receitas entregues",  d.entregues ?? 0),
    bullet("Não entregues",       d.naoEntregues ?? 0),
    comentarios(comments?.farmacia),
  ];
}

function laboratorioSection(data, manual, comments) {
  const d = data?.laboratorio ?? data ?? {};
  return [
    sectionHead("LABORATÓRIO"),
    bullet("Total de exames", d.total ?? 0, true),
    bullet("Concluídos", d.done ?? 0),
    bullet("Pendentes",  d.pending ?? 0),
    { text: "Por categoria:", bold: true, fontSize: 9, margin: [10, 4, 0, 2] },
    bullet("Serológico",    manual?.serologico ?? 0),
    bullet("Hematológico",  manual?.hematologico ?? 0),
    bullet("Parasitológico",manual?.parasitologico ?? 0),
    bullet("Bioquímico",    manual?.bioquimico ?? 0),
    manual?.reagentes ? textLine("Reagentes", manual.reagentes) : null,
    manual?.materiais ? textLine("Materiais",  manual.materiais) : null,
    comentarios(comments?.laboratorio),
  ].filter(Boolean);
}

function imagiologiaSection(data, manual, comments) {
  const total = data?.imagiologia?.total ?? 0;
  return [
    sectionHead("IMAGIOLOGIA"),
    bullet("Total", total, true),
    bullet("Ecografia",          manual?.ecografia ?? 0),
    bullet("Electrocardiograma", manual?.eletrocardiograma ?? 0),
    bullet("Radiologia",         manual?.radiologia ?? 0),
    comentarios(comments?.imagiologia),
  ];
}

function parceriasSection(data, comments) {
  const prov = data?.recepcao?.byProveniencia ?? {};
  return [
    sectionHead("PARCERIAS E SEGUROS"),
    bullet("Parceria", prov.parceria ?? 0),
    bullet("Seguro",   prov.seguro ?? 0),
    comentarios(comments?.parcerias),
  ];
}

function notasSection(comments) {
  return [
    sectionHead("NOTAS FINAIS DO MÉDICO"),
    { text: comments?.notas || "—", fontSize: 9, italics: true, margin: [10, 2, 0, 20] },
    divider(),
    { text: "", margin: [0, 20] },
    {
      columns: [
        { text: "", width: "*" },
        {
          width: "auto",
          stack: [
            { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.8, lineColor: DARK }] },
            { text: "Médico/a em serviço", fontSize: 8, color: GREY, alignment: "center", margin: [0, 4, 0, 0] },
          ],
        },
      ],
    },
  ];
}

// ── Per-area single-section builders ───────────────────────────────
const AREA_BUILDERS = {
  recepcao:    (d, m, c) => recepcaoSection(d, m, c),
  consultorio: (d, m, c) => consultasSection(d, m, c),
  laboratorio: (d, m, c) => laboratorioSection(d, m, c),
  enfermaria:  (d, m, c) => enfermariaSection(d, c),
};

// ── Main export ────────────────────────────────────────────────────
export async function exportAreaReportPdf({ period, area, data, manual, comments }) {
  const content = [
    // ── Header ──
    {
      stack: [
        { text: "CLÍNICA ALFAVIDA", fontSize: 8, color: GREY, alignment: "center" },
        { text: "RELATÓRIO MÉDICO DIÁRIO", fontSize: 16, bold: true, alignment: "center", margin: [0, 2, 0, 2] },
        { text: `DIA: ${period}`, fontSize: 9, bold: true, alignment: "center", color: GREY },
      ],
      margin: [0, 0, 0, 8],
    },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: DARK }] },
  ];

  if (area === "geral") {
    // Full report — all sections
    const sections = [
      ...recepcaoSection(data, manual, comments),      divider(),
      ...consultasSection(data, manual, comments),     divider(),
      ...enfermariaSection(data, comments),            divider(),
      ...ambulatorioSection(data, comments),           divider(),
      ...observacaoSection(data, comments),            divider(),
      ...internamentoSection(data, comments),          divider(),
      ...farmaciaSection(data, comments),              divider(),
      ...laboratorioSection(data, manual, comments),   divider(),
      ...imagiologiaSection(data, manual, comments),   divider(),
      ...parceriasSection(data, comments),             divider(),
      ...notasSection(comments),
    ];
    content.push(...sections);
  } else {
    // Single-area report
    const builder = AREA_BUILDERS[area];
    if (builder) content.push(...builder(data, manual, comments));
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    content,
    defaultStyle: { font: "Roboto" },
  };

  pdfMake.createPdf(docDefinition).download(`relatorio-${area}-${period.replace(/\//g, "-")}.pdf`);
}
