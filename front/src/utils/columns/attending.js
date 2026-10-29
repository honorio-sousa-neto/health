export const columns = [
  {
    name: "customer",
    label: "Paciente",
    field: "customer",
    align: "left",
    format: (val) => val.name,
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
  {
    name: "actions",
    label: "Acções",
    align: "right",
  },
];
