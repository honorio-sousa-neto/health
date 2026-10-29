<template>
  <q-btn
    flat no-caps dense
    icon="las la-file-download"
    label="Exportar"
    class="btn-icone"
    :loading="aExportar"
    :disable="!registoId"
  >
    <q-tooltip v-if="!registoId">Guarde a ficha primeiro.</q-tooltip>

    <q-menu anchor="bottom right" self="top right" class="nav-flyout">
      <div class="nav-flyout__titulo">Exportar ficha e consumo padrão</div>
      <q-list>
        <q-item v-close-popup clickable @click="exportarPdf">
          <q-item-section avatar><q-icon name="las la-file-pdf" size="18px" /></q-item-section>
          <q-item-section>
            <q-item-label>PDF</q-item-label>
            <q-item-label caption>Para imprimir ou arquivar.</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-close-popup clickable @click="exportarExcel">
          <q-item-section avatar><q-icon name="las la-file-excel" size="18px" /></q-item-section>
          <q-item-section>
            <q-item-label>Excel</q-item-label>
            <q-item-label caption>Duas folhas: ficha e consumo.</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
/**
 * Exporta a ficha de um artigo e o seu consumo padrão.
 *
 * O Excel é gerado pelo servidor — é lá que vive o ExcelJS, e é o padrão que
 * o relatório de seguradoras já usa. Mas ao contrário desse, não se abre o
 * URL numa janela nova: `/services` está atrás do `verifyToken` e uma janela
 * nova não leva o cabeçalho de autorização. Vai por axios, que o leva, e o
 * ficheiro desce a partir do blob.
 *
 * O PDF é gerado no cliente com o pdfmake, que já é dependência.
 */
import { ref } from "vue";
import { api } from "src/boot/axios";
import { showNotify } from "src/utils/notify";
import { exportarArtigoPdf } from "src/utils/reports/artigoConsumo";

const props = defineProps({
  /** "services" ou "products". */
  basePath: { type: String, required: true },
  registoId: { type: String, default: null },
});

const aExportar = ref(false);

/** Vai buscar a ficha completa: o formulário não traz as relações todas. */
const carregar = async () => {
  const { data } = await api.get(`${props.basePath}/${props.registoId}`);
  return data?.data ?? data;
};

const exportarPdf = async () => {
  aExportar.value = true;
  try {
    exportarArtigoPdf(await carregar());
  } catch (e) {
    showNotify("Não foi possível gerar o PDF. Tente de novo.", false);
  } finally {
    aExportar.value = false;
  }
};

const exportarExcel = async () => {
  aExportar.value = true;
  try {
    const resposta = await api.get(`${props.basePath}/${props.registoId}/export/excel`, {
      responseType: "blob",
    });

    // O nome vem no `content-disposition` do servidor; se não vier, há um de
    // recurso — um ficheiro sem nome é um ficheiro que ninguém volta a achar.
    const disposicao = resposta.headers?.["content-disposition"] ?? "";
    const achado = /filename[^;=\n]*=(?:UTF-8''|")?([^";\n]*)/i.exec(disposicao);
    const nome = achado ? decodeURIComponent(achado[1]) : "artigo-consumo-padrao.xlsx";

    const url = URL.createObjectURL(resposta.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    showNotify("Não foi possível gerar o ficheiro Excel. Tente de novo.", false);
  } finally {
    aExportar.value = false;
  }
};
</script>
