export const columns = [
  {
    name: "exam",
    label: "Exame",
    field: "exam",
    align: "left",
    format: (val) => val.name,
  },
  {
    name: "madeit",
    label: "Realizado por",
    field: "analyst",
    align: "left",
    format: (val) => val.name,
  },
  {
    name: "customer",
    label: "Paciente",
    field: "attending",
    align: "left",
    format: (val) => val.customer.name,
  },
  {
    name: "createdAt",
    label: "Data e hora de atendimento",
    field: "createdAt",
    align: "center",
    format: (val) =>
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(val)),
  },
  // { name: "email", label: "Role", field: "role", align: "left" },
  // {
  //   name: "phone",
  //   label: "Contacto telefónico",
  //   field: "phone",
  //   align: "center",
  // },

  // {
  //   name: "username",
  //   label: "Nome de usuário",
  //   field: "username",
  //   align: "left",
  // },
  { name: "actions", label: "Acções", align: "right" },
];
