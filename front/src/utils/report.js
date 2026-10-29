import pdfMake from "pdfmake/build/pdfmake";

export function print() {
  pdfMake
    .createPdf(
      {
        content: [
          "First paragraph",
          "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines",
        ],
      },
      null,
      {
        Roboto: {
          normal:
            "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
          bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
          italics:
            "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
          bolditalics:
            "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
        },
      }
    )
    .download();
  console.log("Hey");
}
