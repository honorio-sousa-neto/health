import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts;

/**
 * Exporta um artigo — produto ou serviço — e o seu consumo padrão em PDF.
 *
 * O consumo padrão é a lista do que o artigo gasta de cada vez que é
 * realizado, e é o que torna esta folha útil fora do ecrã: leva-se ao
 * armazém, confere-se contra o que lá está, assina-se.
 *
 * Sem rodapé de certificação AGT: isto não é documento fiscal. O rodapé é
 * texto legal de facturas e notas, e pô-lo aqui daria a uma folha interna a
 * aparência de um documento emitido.
 */

const FONTS = {
  Roboto: {
    normal:      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold:        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:     "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

const TIPO = { PRODUCT: "Produto", SERVICE: "Serviço", CONSUMABLE: "Consumível" };

const moeda = (v) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v ?? 0));

const quantidade = (v) =>
  new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 3 }).format(Number(v ?? 0));

const dataHora = () =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date());

const texto = (v, omissao = "—") => {
  if (v === null || v === undefined) return omissao;
  const s = String(v).trim();
  return s || omissao;
};

const regua = () => ({
  canvas: [{ type: "line", x1: 0, x2: 523, y1: 0, y2: 0, lineWidth: 0.5, lineColor: "#c9d2cf" }],
  margin: [0, 6, 0, 10],
});

/** Duas colunas de rótulo e valor, que é como a ficha se lê no ecrã. */
const ficha = (artigo) => {
  const linhas = [
    ["Tipo", TIPO[artigo.type] ?? texto(artigo.type)],
    ["Categoria", texto(artigo.category?.category?.name ?? artigo.category?.name)],
    ["Preço", `${moeda(artigo.unit_price)} AOA`],
    ["Unidade", artigo.unit ? `${artigo.unit.abbreviation} — ${artigo.unit.name}` : "—"],
    ["Desconto", `${moeda(artigo.discount)} AOA`],
    ["IVA", artigo.tax ? `${Number(artigo.tax)}%` : "Isento"],
  ];
  if (artigo.description) linhas.push(["Descrição", texto(artigo.description)]);

  return {
    table: {
      widths: [110, "*"],
      body: linhas.map(([r, v]) => [
        { text: r, style: "rotulo" },
        { text: v, style: "valor" },
      ]),
    },
    layout: "noBorders",
    margin: [0, 0, 0, 16],
  };
};

/** A tabela do consumo, ou a razão pela qual não há tabela. */
const consumo = (itens) => {
  if (!itens.length) {
    return {
      text: "Sem consumo padrão definido para este artigo.",
      style: "vazio",
      margin: [0, 4, 0, 0],
    };
  }

  const cabecalho = ["Item", "Tipo", "Quantidade", "Unidade"].map((t, i) => ({
    text: t,
    style: "cabecalho",
    alignment: i === 2 ? "right" : "left",
  }));

  const corpo = itens.map((m) => [
    { text: texto(m.consumable?.name), style: "celula" },
    { text: TIPO[m.consumable?.type] ?? "—", style: "celulaFraca" },
    { text: quantidade(m.quantity), style: "celula", alignment: "right" },
    { text: texto(m.consumable?.unit?.abbreviation), style: "celulaFraca" },
  ]);

  return {
    table: { headerRows: 1, widths: ["*", 90, 70, 60], body: [cabecalho, ...corpo] },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.5 : 0.3),
      vLineWidth: () => 0,
      hLineColor: (i) => (i === 1 ? "#c9d2cf" : "#e2e8f0"),
      paddingTop: () => 5,
      paddingBottom: () => 5,
    },
  };
};

export const exportarArtigoPdf = (artigo) => {
  pdfMake.fonts = FONTS;

  const itens = artigo?.consumables ?? [];
  const nome = texto(artigo?.name, "Artigo");

  const doc = {
    pageSize: "A4",
    pageMargins: [36, 40, 36, 48],
    info: { title: `${nome} — consumo padrão` },
    content: [
      { text: "Clínica Alfavida", style: "marca" },
      { text: nome, style: "titulo" },
      { text: `Ficha do artigo e consumo padrão · ${dataHora()}`, style: "subtitulo" },
      regua(),
      ficha(artigo),
      { text: "Consumo padrão", style: "seccao" },
      {
        text: `${itens.length} ${itens.length === 1 ? "item" : "itens"}`,
        style: "vazio",
        margin: [0, 0, 0, 8],
      },
      consumo(itens),
    ],
    footer: (pagina, total) => ({
      margin: [36, 12, 36, 0],
      columns: [
        { text: nome, style: "rodape" },
        { text: `${pagina} / ${total}`, style: "rodape", alignment: "right" },
      ],
    }),
    styles: {
      marca:     { fontSize: 8,  color: "#788582", characterSpacing: 1 },
      titulo:    { fontSize: 16, bold: true, margin: [0, 4, 0, 2] },
      subtitulo: { fontSize: 9,  color: "#5f6c80" },
      seccao:    { fontSize: 8,  bold: true, characterSpacing: 0.6, margin: [0, 6, 0, 4] },
      rotulo:    { fontSize: 9,  color: "#5f6c80", margin: [0, 2, 0, 2] },
      valor:     { fontSize: 10, margin: [0, 2, 0, 2] },
      cabecalho: { fontSize: 8,  bold: true, color: "#3c4a52", characterSpacing: 0.5 },
      celula:    { fontSize: 10 },
      celulaFraca: { fontSize: 9, color: "#5f6c80" },
      vazio:     { fontSize: 9,  color: "#5f6c80" },
      rodape:    { fontSize: 8,  color: "#788582" },
    },
    defaultStyle: { font: "Roboto" },
  };

  const seguro = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 60);

  pdfMake.createPdf(doc).download(`${seguro || "artigo"}-consumo-padrao.pdf`);
};
