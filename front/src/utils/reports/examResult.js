import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts;

const FONTS = {
  Roboto: {
    normal:      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold:        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:     "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

const fmt = (v) =>
  v
    ? new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(v))
    : "—";

const calcAge = (birthday) => {
  if (!birthday) return null;
  const bd = new Date(birthday);
  const t  = new Date();
  let a = t.getFullYear() - bd.getFullYear();
  if (t.getMonth() < bd.getMonth() || (t.getMonth() === bd.getMonth() && t.getDate() < bd.getDate())) a--;
  return a > 0 ? a : null;
};

const HR = (color = "#e2e8f0", w = 0.5, mb = 0) => ({
  canvas: [{ type: "line", x1: 0, x2: 523, y1: 0, y2: 0, lineWidth: w, lineColor: color }],
  marginBottom: mb,
});

// Safe string: avoids passing objects/arrays/null to pdfMake text fields
const str = (v, fallback = "") => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "object") return fallback;
  const s = String(v).trim();
  return s || fallback;
};

// Normalise exam.result into a flat array of field objects regardless of what was stored
const parseResult = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.length ? raw : null;
  // Stored as a plain string → treat as free text
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed ? [{ label: "", value: trimmed, unit: "", reference: "", input: "TEXT" }] : null;
  }
  // Stored as a plain object → try to flatten key/value pairs
  if (typeof raw === "object") {
    const entries = Object.entries(raw);
    if (!entries.length) return null;
    return entries.map(([k, v]) => ({
      label: k, value: typeof v === "object" ? JSON.stringify(v) : String(v ?? ""),
      unit: "", reference: "", input: "FIELD",
    }));
  }
  return null;
};

const buildFieldRows = (fields) => {
  const rows = [];
  for (const f of fields) {
    const isSection = f.input === "SECTION";
    if (isSection) {
      // Section header spanning all 3 columns
      rows.push([
        {
          text: str(f.label),
          colSpan: 3, bold: true, fontSize: 8.5,
          color: "#2b6cb0", fillColor: "#ebf8ff",
          border: [false, false, false, false],
          margin: [0, 6, 0, 2],
        },
        {}, {},
      ]);
    } else {
      const unit      = str(f.unit);
      const reference = str(f.reference);
      const meta      = unit
        ? unit
        : reference
          ? `Ref: ${reference}`
          : "";

      rows.push([
        {
          text:        str(f.label),
          fontSize:    9, color: "#4a5568",
          border:      [false, false, false, true],
          borderColor: ["#f0f1f5", "#f0f1f5", "#f0f1f5", "#f0f1f5"],
        },
        {
          text:        str(f.value, "—"),
          fontSize:    10, bold: true, color: "#1a202c", alignment: "right",
          border:      [false, false, false, true],
          borderColor: ["#f0f1f5", "#f0f1f5", "#f0f1f5", "#f0f1f5"],
        },
        {
          text:        meta,
          fontSize:    8, color: "#a0aec0",
          border:      [false, false, false, true],
          borderColor: ["#f0f1f5", "#f0f1f5", "#f0f1f5", "#f0f1f5"],
        },
      ]);
    }
  }
  return rows;
};

/**
 * @param {object} opts
 * @param {{ name, phone, address }} opts.clinic
 * @param {{ name, phone, birthday }} opts.patient
 * @param {{ name }}                  opts.doctor   (nullable)
 * @param {string}                    opts.date     ISO date
 * @param {Array}                     opts.exams    RequestExams[]
 * @returns {boolean} true on success, false on failure
 */
export const printExamResult = ({ clinic, patient, doctor, date, exams }) => {
  try {
    pdfMake.fonts = FONTS;

    const patientAge = calcAge(patient?.birthday);
    const content    = [];

    // ── Clinic header ──────────────────────────────────────────────────────────
    content.push({
      columns: [
        [
          { text: str(clinic?.name, "Clínica"), fontSize: 13, bold: true, color: "#1a202c" },
          {
            text: [
              clinic?.phone ? `Tel: ${clinic.phone}` : "",
              clinic?.phone && clinic?.address ? "   |   " : "",
              str(clinic?.address),
            ].join(""),
            fontSize: 8, color: "#718096", marginTop: 2,
          },
        ],
        [
          { text: "RELATÓRIO DE RESULTADOS DE EXAMES", fontSize: 9, bold: true, color: "#2b6cb0", alignment: "right" },
          { text: `Emitido em: ${fmt(new Date())}`, fontSize: 8, color: "#a0aec0", alignment: "right", marginTop: 2 },
        ],
      ],
      marginBottom: 8,
    });

    content.push(HR("#e2e8f0", 0.5, 10));

    // ── Patient / doctor / date ────────────────────────────────────────────────
    content.push({
      columns: [
        [
          { text: "PACIENTE", fontSize: 7, bold: true, color: "#94a3b8", marginBottom: 2 },
          {
            text: [
              { text: str(patient?.name, "—"), bold: true, fontSize: 11, color: "#1a202c" },
              patientAge ? { text: `  ${patientAge} anos`, fontSize: 9, color: "#718096" } : { text: "" },
            ],
          },
          patient?.phone
            ? { text: `Tel: ${patient.phone}`, fontSize: 8, color: "#718096", marginTop: 2 }
            : { text: "" },
        ],
        doctor?.name
          ? [
              { text: "MÉDICO RESPONSÁVEL", fontSize: 7, bold: true, color: "#94a3b8", marginBottom: 2 },
              { text: `Dr. ${str(doctor.name)}`, fontSize: 10, color: "#1a202c" },
            ]
          : [{ text: "" }],
        [
          { text: "DATA", fontSize: 7, bold: true, color: "#94a3b8", marginBottom: 2 },
          { text: fmt(date), fontSize: 10, color: "#1a202c" },
        ],
      ],
      marginBottom: 14,
    });

    content.push(HR("#e2e8f0", 0.5, 14));

    // ── Exam results ───────────────────────────────────────────────────────────
    const visible = (exams ?? []).filter(
      (e) => e.paid && (e.resultColor || e.resultText || e.result)
    );

    if (!visible.length) {
      content.push({
        text: "Sem resultados registados para esta consulta.",
        fontSize: 10, color: "#a0aec0", italics: true, alignment: "center", marginTop: 20,
      });
    }

    for (const exam of visible) {
      const isNormal  = exam.resultColor === "GREEN";

      // Exam name + conclusion badge
      content.push({
        columns: [
          {
            text: str(exam.exam?.name ?? exam.exam?.exam?.name, "—").toUpperCase(),
            fontSize: 10, bold: true, color: "#1a202c",
          },
          exam.resultColor
            ? {
                text:      isNormal ? "● NORMAL" : "● ALTERADO",
                fontSize:  9, bold: true,
                color:     isNormal ? "#276749" : "#c53030",
                alignment: "right",
              }
            : { text: "" },
        ],
        marginBottom: 6,
      });

      const fields = parseResult(exam.result);

      if (fields) {
        const rows = buildFieldRows(fields);
        if (rows.length) {
          content.push({
            table: {
              widths: ["*", "auto", "auto"],
              body: rows,
            },
            layout: {
              hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.4),
              vLineWidth: () => 0,
              hLineColor: () => "#f0f1f5",
              paddingLeft:   () => 4,
              paddingRight:  () => 4,
              paddingTop:    () => 4,
              paddingBottom: () => 4,
            },
            marginBottom: 6,
          });
        }
      } else if (exam.resultText) {
        content.push({
          text:       str(exam.resultText),
          fontSize:   10, color: "#4a5568", lineHeight: 1.5,
          marginLeft: 8, marginBottom: 6,
        });
      }

      content.push(HR("#f0f1f5", 0.3, 12));
    }

    // ── Build PDF ──────────────────────────────────────────────────────────────
    pdfMake.createPdf({
      content,
      footer: (page, total) => ({
        columns: [
          { text: str(clinic?.name), fontSize: 7, color: "#b0b7c3", marginLeft: 36 },
          { text: `Página ${page} de ${total}`, fontSize: 7, color: "#b0b7c3", alignment: "right", marginRight: 36 },
        ],
      }),
      pageMargins:  [36, 36, 36, 36],
      defaultStyle: { font: "Roboto", fontSize: 10 },
    }).open();

    return true;
  } catch (err) {
    console.error("[examResult] PDF generation failed:", err);
    return false;
  }
};
