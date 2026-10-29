export const columns = [
  { name: "name", label: "Nome", field: "name", align: "left" },
  {
    name: "address",
    label: "Endereço",
    field: "address",
    align: "left",
    format: (val) => (val.length > 20 ? `${val.slice(0, 20)}...` : val),
  },

  {
    name: "nif",
    label: "NIF",
    field: "nif",
    align: "center",
  },
  { name: "actions", label: "Acções", align: "center" },
];
