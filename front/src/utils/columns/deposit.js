export const columns = [
  {
    name: "bank",
    label: "Nome",
    field: "bank",
    align: "left",
    format: (val) => val.name,
  },
  {
    name: "amount",
    label: "Montante",
    field: "amount",
    align: "left",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  { name: "actions", label: "Acções", align: "center" },
];
