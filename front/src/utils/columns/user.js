export const columns = [
  { name: "name", label: "Nome", field: "name", align: "left", ordenavel: true },
  // O rótulo dizia "Role" e a célula mostrava o valor cru do enum.
  { name: "email", label: "Serviço", field: "role", align: "left", ordenavel: true },
  { name: "phone", label: "Contacto telefónico", field: "phone", align: "left", numerico: true },
  // "Nome de usuário" era resíduo de PT-BR.
  { name: "username", label: "Nome de utilizador", field: "username", align: "left", ordenavel: true },
  { name: "actions", label: "Acções", align: "center" },
];
