export const columns = [
  { name: "name", label: "Nome", field: "name", align: "left" },
  {
    name: "value",
    label: "Valor",
    field: "value",
    align: "left",
    format: (val) => (val.length > 20 ? `${val.slice(0, 20)}...` : val),
  },

  { name: "actions", label: "Acções", align: "center" },
];
