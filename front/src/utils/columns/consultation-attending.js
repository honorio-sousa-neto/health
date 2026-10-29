export const columns = [
  {
    name: "consultation",
    label: "Consulta",
    field: "consultation",
    align: "left",
    format: (val) => val.name + " - " + val.description,
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
  {
    name: "diagnosis",
    label: "Diagnóstico",
    field: "diagnosis",
    align: "left",
  },
  {
    name: "actions",
    label: "Acções",
    align: "right",
  },
];
