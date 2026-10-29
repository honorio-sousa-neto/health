export const columns = [
  { name: "name", label: "Nome", field: "name", align: "left" },
  {
    name: "description",
    label: "Descrição",
    field: "description",
    align: "left",
  },
  {
    name: "price",
    label: "Preço unitário",
    field: "price",
    align: "left",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },

  {
    name: "quantity",
    label: "Quantidade",
    field: "quantity",
    align: "center",
    format: (val, row) => `${val} ${row.measure}(s)`,
  },
  { name: "actions", label: "Acções", align: "center" },
];
