export const columns = [
  {
    name: "type",
    field: "type",
    align: "left",
    label: "Documento",
    format: (val) => {
      const types = {
        FT: "FACTURA",
        FR: "FACTURA-RECIBO",
        RC: "RECIBO",
        ND: "NOTA DE DÉBITO",
        NC: "NOTA DE CRÉDITO",
        PP: "PROFORMA",
      };
      return types[val];
    },
  },
  {
    name: "reference",
    field: "reference",
    align: "left",
    label: "Referência",
  },
  {
    name: "customer",
    field: "customer",
    align: "left",
    label: "Cliente",
    format: (val, row) =>
      ["RC", "ND", "NC"].includes(row.type)
        ? row.invoiceSource.customer.name
        : val?.name,
  },
  {
    name: "emission_date",
    field: "emission_date",
    align: "left",
    label: "Data de emissão",
    format: (val) => {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(val));
    },
  },
  {
    name: "status",
    field: "status",
    label: "Estado",
    align: "center",
    style: (row) => (row.status == "POR_PAGAR" ? "color: red" : "color: green"),
  },
  {
    name: "total",
    field: "total",
    align: "center",
    label: "Total",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "actions",
    label: "Acções",
    align: "center",
  },
];
export const columnsExtra = [
  {
    name: "open",
    label: "",
    align: "center",
  },
  {
    name: "type",
    field: "type",
    align: "left",
    label: "Documento",
    format: (val) => {
      const types = {
        FT: "FACTURA",
        FR: "FACTURA-RECIBO",
        RC: "RECIBO",
        ND: "NOTA DE DÉBITO",
        NC: "NOTA DE CRÉDITO",
        PP: "PROFORMA",
      };
      return types[val];
    },
  },
  {
    name: "reference",
    field: "reference",
    align: "left",
    label: "Referência",
  },
  {
    name: "customer",
    field: "customer",
    align: "left",
    label: "Cliente",
    format: (val, row) =>
      ["RC", "ND", "NC"].includes(row.type)
        ? row.invoiceSource.customer.name
        : val.name,
  },
  {
    name: "emission_date",
    field: "emission_date",
    align: "left",
    label: "Data de emissão",
    format: (val) => {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(val));
    },
  },
  {
    name: "status",
    field: "status",
    label: "Estado",
    align: "center",
  },
  {
    name: "total",
    field: "total",
    align: "right",
    label: "Total",
    format: (val) =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "AOA",
      }).format(val),
  },
  {
    name: "actions",
    label: "Acções",
    align: "center",
  },
];
