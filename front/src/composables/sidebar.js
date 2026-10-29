import { LocalStorage } from "quasar";
import { ref, readonly } from "vue";

const CHAVE = "alfavida_sidebar_mini";

// Estado partilhado por todos os componentes que o importem — fica fora da
// função para não se criar uma cópia por cada uso.
const mini = ref(LocalStorage.getItem(CHAVE) === true);

/** Sidebar recolhido a ícones. A preferência persiste entre sessões. */
export function useSidebar() {
  const definir = (valor) => {
    mini.value = valor;
    LocalStorage.set(CHAVE, valor);
  };

  return {
    mini: readonly(mini),
    alternarMini: () => definir(!mini.value),
    definirMini: definir,
  };
}
