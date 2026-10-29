import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts;
import {
  getCompanyData,
  getCustomerData,
  getItemsTable,
  getSettingsInvoice,
  resumeInvoice,
} from "./items";
export const printReceipt = (data) => {
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
        getCompanyData,
        getCustomerData(data),
        ...getSettingsInvoice(data),
        getItemsTable(data),
        resumeInvoice(data),
        {
          marginTop: 30,
          text: "Valor por extenso: " + data.valor_por_extenso,
          alignment: "left",
          style: ["default"],
        },
        {
          marginTop:
            data.dados.sigla == "FT" || data.dados.sigla == "FR" ? 30 : 0,
          text:
            data.dados.sigla == "FT" || data.dados.sigla == "FR"
              ? `Os bens/serviços foram colocados à disposição do adquirente na data de ${new Intl.DateTimeFormat(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }
                ).format(new Date(data.dados?.data_emissao))}`
              : "",
          alignment: "left",
          style: ["default"],
        },
        {
          text: `Operador: ${data.dados.operador}`,
          alignment: "left",
          style: ["default"],
        },
      ],
      // defaultStyle: {
      //   font: "Helvetica",
      // },
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
                `${data.dados.hash_4}` +
                "-Processado por programa validado nº 355/AGT/2023 FacilitaSoft (3.1.1)",
              alignment: "center",
            },
          ],
        ],
      },
      styles: {
        content: { fontSize: 10 },
        default: {
          fontSize: 9,
        },
      },
    };
    pdfMake.createPdf(docDefinition).open();
  } catch (error) {
    console.log(error.message);
  }
};
