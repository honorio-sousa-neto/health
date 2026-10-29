export const columns = [
  { name: "name", label: "Nome", field: "name", align: "left" },
  {
    name: "description",
    label: "Descrição",
    field: "description",
    align: "left",
    format: (val) => (val ? val.slice(0, 30) : val),
  },
  {
    name: "category",
    label: "Sub-categoria",
    field: "category",
    align: "center",
    format: (val) => val.name,
  },
  {
    name: "unit_price",
    label: "Preço unitário",
    field: "unit_price",
    align: "left",
    format: (val) =>
      new Intl.NumberFormat("de-DE", { style: "currency", currency: "AOA" }).format(val),
  },
  {
    name: "classificacao",
    label: "Classificação",
    field: "classificacao",
    align: "center",
    format: (val) => val ?? "—",
  },

  // {
  //   name: "status",
  //   label: "Estado",
  //   field: "status",
  //   align: "left",
  //   format: (val) =>
  //     val.toLowerCase() == "available" ? "Disponível" : "Indisponível",
  // },
  { name: "actions", label: "Acções", align: "right" },
];
