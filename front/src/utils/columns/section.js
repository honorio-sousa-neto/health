export const columns = [
  { name: "name", label: "Nome", field: "name", align: "left" },
  {
    name: "email",
    label: "Numero de exames",
    field: "_count",
    align: "center",
    format: (val) => val.exams,
  },
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
