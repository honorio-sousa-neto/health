import { api } from "src/boot/axios";
// Never put session tokens in URLs, browser history or referrers.
export async function openProtectedFile(url) {
  const base = new URL(api.defaults.baseURL, window.location.origin);
  const target = new URL(url, base.href + "/");
  if (target.origin !== base.origin) throw new Error("Origem de ficheiro inválida");
  const tab = window.open("about:blank", "_blank");
  if (tab) tab.opener = null;
  try {
    const { data, headers } = await api.get(target.href, { responseType: "blob" });
    const objectURL = URL.createObjectURL(data);
    if (/spreadsheet|excel|octet-stream/.test(headers["content-type"] || "")) {
      const link = document.createElement("a");
      link.href = objectURL;
      link.download = /filename="?([^";]+)/.exec(headers["content-disposition"] || "")?.[1] || "relatorio.xlsx";
      link.click();
      tab?.close();
    } else if (tab) tab.location.replace(objectURL);
    else { const link = document.createElement("a"); link.href = objectURL; link.download = "documento.pdf"; link.click(); }
    setTimeout(() => URL.revokeObjectURL(objectURL), 60000);
  } catch (error) { tab?.close(); throw error; }
}
