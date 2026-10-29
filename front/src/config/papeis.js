/**
 * O serviço de cada papel, para mostrar a quem está em sessão.
 *
 * Nomeia-se o serviço e não a pessoa — "Enfermagem", não "Enfermeiro". Duas
 * razões: o `enum Role` do Prisma tem papéis que só diferem na categoria
 * profissional e não no trabalho (`nurse` e `techNursian` fazem o mesmo no
 * sistema), e o nome do serviço não obriga a escolher género para o escrever.
 *
 * A chefia de laboratório é a excepção, e é responsabilidade, não categoria.
 */
export const SERVICO = {
  admin: "Administração",
  attendant: "Recepção",
  nurse: "Enfermagem",
  techNursian: "Enfermagem",
  doctor: "Medicina",
  analyst: "Laboratório",
  techLab: "Laboratório",
  chiefLab: "Laboratório · chefia",
  financial: "Financeiro",
  inventory: "Inventário",
};

/** O serviço de um papel. Papel desconhecido não inventa nome. */
export const servicoDe = (role) => SERVICO[role] ?? "";

/** Iniciais para o avatar. Duas, no máximo. */
export const iniciaisDe = (nome) =>
  !nome
    ? "?"
    : String(nome)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
