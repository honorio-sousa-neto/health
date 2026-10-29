import "@fontsource-variable/inter";
import { defineBoot as boot } from "#q-app";
import { iniciarTema } from "src/composables/theme";

// Aplica o tema guardado antes de a interface montar, para não haver um
// clarão branco quando a preferência é o tema escuro.
export default boot(() => {
  iniciarTema();
});
