import { Notify } from "quasar";

Notify.registerType("ok", {
  icon:     "las la-check-circle",
  color:    "white",
  textColor:"grey-9",
  classes:  "notify-card notify-card--ok",
  position: "bottom-right",
  timeout:  3000,
  progress: true,
  actions:  [{ icon: "las la-times", color: "grey-5", round: true, flat: true, dense: true }],
});

Notify.registerType("fail", {
  icon:     "las la-times-circle",
  color:    "white",
  textColor:"grey-9",
  classes:  "notify-card notify-card--fail",
  position: "bottom-right",
  timeout:  4500,
  progress: true,
  actions:  [{ icon: "las la-times", color: "grey-5", round: true, flat: true, dense: true }],
});

export const showNotify = (message, success) => {
  Notify.create({
    type:    success ? "ok" : "fail",
    message: message ?? (success ? "Operação concluída" : "Ocorreu um erro"),
  });
};

// ── Rede ──────────────────────────────────────────────────────────────────
// Um problema de rede não é uma operação falhada: o pedido pode não ter
// sequer chegado ao servidor. Merece o degrau "aviso" da escala de estado,
// não o vermelho de erro — e um ícone que diga do que se trata.
Notify.registerType("rede", {
  icon:     "las la-wifi",
  color:    "white",
  textColor:"grey-9",
  classes:  "notify-card notify-card--rede",
  position: "bottom-right",
  timeout:  0,          // fica até a ligação voltar ou o utilizador fechar
  progress: false,
  actions:  [{ icon: "las la-times", color: "grey-5", round: true, flat: true, dense: true }],
});

/**
 * Aviso de rede, com no máximo um no ecrã de cada vez.
 *
 * Sem isto, um ecrã que dispara seis pedidos ao carregar produzia seis
 * notificações iguais quando a rede caía — e o que é um aviso passava a ser
 * uma parede.
 */
let fecharAvisoRede = null;

export const showNetworkNotify = (message) => {
  if (fecharAvisoRede) return;
  fecharAvisoRede = Notify.create({
    type:    "rede",
    message: message ?? "Sem ligação ao servidor. A tentar novamente…",
    onDismiss: () => { fecharAvisoRede = null; },
  });
};

/** Chamada quando um pedido volta a passar: retira o aviso que estiver no ecrã. */
export const clearNetworkNotify = () => {
  if (!fecharAvisoRede) return;
  fecharAvisoRede();
  fecharAvisoRede = null;
};
