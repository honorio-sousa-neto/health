export const columns = [
  { name: "name", label: "Nome", field: "name", align: "left" },
  {
    name: "phone",
    label: "Contacto telefónico",
    field: "phone",
    align: "left",
  },
  {
    name: "insuranceId",
    label: "Assegurado",
    field: "insuranceId",
    align: "center",
  },
  {
    name: "protocolId",
    label: "Protocolo",
    field: "protocolId",
    align: "center",
    format: (val, row) => (val ? row.protocol.name : ""),
  },

  { name: "actions", label: "Acções", align: "center" },
];
