const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        // Demonstração isolada das primitivas clínicas. Não faz parte do
        // percurso do paciente; existe para revisão visual e para servir de
        // referência viva enquanto as primitivas são adoptadas ecrã a ecrã.
        path: "demo/primitivas-clinicas",
        name: "demo-primitivas-clinicas",
        component: () => import("pages/demo/PrimitivasClinicas.vue"),
      },
      {
        path: "bem-vindo",
        name: "welcome",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "emitir-documento",
        name: "emitir-documento",
        redirect: { name: "emitir-documento-form" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          // {
          //   path: "lista",
          //   name: "list-services",
          //   component: () => import("pages/services/index.vue"),
          //   meta: { title: "Serviços", isEntry: true },
          // },
          {
            path: "emitir/:medicalConsultationId?/:surgeryId?:/:administrationId?/:prescriptionId?/:pharmacyId?/:observationId?",
            name: "emitir-documento-form",
            component: () => import("pages/documents/CreateDocument.vue"),
            // component: () => import("pages/EmitirDocumento.vue"),
            meta: { title: "Emitir documento", isEntry: true },
          },
        ],
      },
      {
        path: "farmacia",
        name: "farmacia",
        redirect: { name: "farmacia-dispensar" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "dispensar",
            name: "farmacia-dispensar",
            component: () => import("pages/farmacia/DispensarPage.vue"),
            meta: { title: "Farmácia · Dispensar" },
          },
          {
            path: "historico",
            name: "farmacia-historico",
            component: () => import("pages/farmacia/HistoricoPage.vue"),
            meta: { title: "Farmácia · Histórico" },
          },
        ],
      },
      {
        path: "medicamentos",
        name: "medicamentos",
        redirect: { name: "list-medicamentos" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-medicamentos",
            component: () => import("pages/medicamentos/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-medicamento",
            component: () => import("pages/medicamentos/EditPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-medicamento",
            component: () => import("pages/medicamentos/AddPage.vue"),
          },
        ],
      },
      {
        path: "servicos",
        name: "servicos",
        redirect: { name: "list-services" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-services",
            component: () => import("pages/services/IndexPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-servico",
            component: () => import("pages/services/AddPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-servico",
            component: () => import("pages/services/EditPage.vue"),
          },
          {
            path: ":id/mapear-insumo",
            name: "mapear-insumo",
            component: () => import("pages/services/AttachMaterial.vue"),
          },
          {
            path: ":id?",
            name: "editing-service",
            component: () => import("pages/services/edit.vue"),
            meta: { title: "Serviços", isEntry: false },
          },
        ],
      },
      {
        path: "produtos",
        name: "produtos",
        redirect: { name: "list-products" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-products",
            component: () => import("pages/products/IndexPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-produto",
            component: () => import("pages/products/AddPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-produto",
            component: () => import("pages/products/EditPage.vue"),
          },
          {
            path: ":id/mapear-insumo",
            name: "mapear-insumo-produto",
            component: () => import("pages/products/AttachMaterial.vue"),
          },
        ],
      },

      {
        path: "precario",
        name: "precario",
        redirect: { name: "list-precarios" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-precarios",
            component: () => import("pages/precario/IndexPage.vue"),
          },
        ],
      },
      {
        path: "categorias",
        name: "categorias",
        redirect: { name: "list-categorias" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-categorias",
            component: () => import("pages/category/IndexPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-categoria",
            component: () => import("pages/category/AddPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-categoria",
            component: () => import("pages/category/EditPage.vue"),
          },
        ],
      },
      {
        path: "exames",
        name: "exames",
        redirect: { name: "list-exames" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-exames",
            component: () => import("pages/exames/index.vue"),
            meta: { title: "Exames", isEntry: true },
          },
          {
            path: ":id?",
            name: "editing-exame",
            component: () => import("pages/exames/edit.vue"),
            meta: { title: "Exames", isEntry: false },
          },
        ],
      },
      {
        path: "caixa",
        name: "caixa",
        redirect: { name: "list-caixa" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-caixa",
            component: () => import("pages/caixa/index.vue"),
            meta: { title: "Fluxo", isEntry: true },
          },
          {
            path: "",
            name: "fluxo",
            component: () => import("pages/caixa/IndexPage.vue"),
          },
        ],
      },
      {
        path: "laboratorio",
        name: "sections",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "seccao/lista",
            name: "lista-seccao",
            component: () => import("pages/section/IndexPage.vue"),
            meta: { title: "Laboratório", isEntry: true },
          },
          {
            path: "adicionar",
            name: "adicionar-seccao",
            component: () => import("pages/section/AddPage.vue"),
            // component: () => import("pages/section/ViewPage.vue"),
          },
          {
            path: "seccao/:id",
            name: "editar-seccao",
            // component: () => import("pages/section/AddPage.vue"),
            component: () => import("pages/section/ViewPage.vue"),
          },
          {
            path: "seccao-exames/:id?",
            name: "criar-exame",
            component: () => import("pages/section/ViewPageExam.vue"),
            meta: { title: "Laboratório", isEntry: false },
          },
        ],
      },
      {
        path: "servicos-clinicos",
        name: "hospital-services-imagiology",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "imagiologia/lista",
            name: "lista-imagiologia",
            component: () => import("pages/imagiologia/IndexPage.vue"),
          },
          {
            path: "imagiologia/:id/editar",
            name: "editar-imagiologia",
            component: () => import("pages/imagiologia/EditPage.vue"),
          },
          {
            path: "imagiologia/adicionar",
            name: "adicionar-imagiologia",
            component: () => import("pages/imagiologia/AddPage.vue"),
          },
          // {
          //   path: "seccao/:id/:examId",
          //   name: "edit-exam",
          //   component: () => import("pages/section/ViewPageExam.vue"),
          //   meta: { title: "Laboratório", isEntry: false },
          // },
        ],
      },
      {
        path: "servicos-clinicos",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "tratamento-observacao/lista",
            name: "lista-tratamento-observacao",
            component: () =>
              import("pages/treatment-observation/IndexPage.vue"),
          },
          {
            path: "tratamento-observacao/:id/editar",
            name: "editar-tratamento-observacao",
            component: () => import("pages/treatment-observation/EditPage.vue"),
          },
          {
            path: "tratamento-observacao/adicionar",
            name: "adicionar-tratamento-observacao",
            component: () => import("pages/treatment-observation/AddPage.vue"),
          },
        ],
      },
      {
        path: "servicos-clinicos",
        name: "hospital-services-treatment",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "internamento/lista",
            name: "lista-internamento",
            component: () => import("pages/hospitalization/IndexPage.vue"),
            meta: { title: "Internamento", isEntry: true },
          },
          {
            path: "internamento/:id/editar",
            name: "editar-internamento",
            component: () => import("pages/hospitalization/EditPage.vue"),
            meta: { title: "Internamento", isEntry: false },
          },
          {
            path: "internamento/adicionar",
            name: "adicionar-internamento",
            component: () => import("pages/hospitalization/AddPage.vue"),
            meta: { title: "Internamento", isEntry: false },
          },
          // {
          //   path: "seccao/:id/:examId",
          //   name: "edit-exam",
          //   component: () => import("pages/section/ViewPageExam.vue"),
          //   meta: { title: "Laboratório", isEntry: false },
          // },
        ],
      },
      {
        path: "consulta",
        name: "consultation",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-consultas",
            component: () => import("pages/consultation/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-consulta",
            component: () => import("pages/consultation/EditPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-consulta",
            component: () => import("pages/consultation/AddPage.vue"),
          },
        ],
      },

      {
        path: "clientes",
        name: "clientes",
        redirect: { name: "list-clients" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-clientes",
            component: () => import("pages/clients/IndexPage.vue"),
            meta: { title: "Clientes", isEntry: true },
          },
          {
            path: ":id/editar",
            name: "editar-cliente",
            component: () => import("pages/clients/EditPage.vue"),
            meta: { title: "Clientes", isEntry: false },
          },
          {
            path: ":id/ver-contas",
            name: "contas-cliente",
            component: () => import("pages/clients/ViewInvoices.vue"),
            meta: { title: "Clientes", isEntry: false },
          },
          {
            path: "adicionar",
            name: "adicionar-cliente",
            component: () => import("pages/clients/AddPage.vue"),
            meta: { title: "Clientes", isEntry: false },
          },
        ],
      },
      {
        path: "fornecedores",
        name: "fornecedores",
        redirect: { name: "list-suppliers" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-fornecedores",
            component: () => import("pages/suppliers/IndexPage.vue"),
            meta: { title: "Clientes", isEntry: true },
          },
          {
            path: ":id/editar",
            name: "editar-fornecedor",
            component: () => import("pages/suppliers/EditPage.vue"),
            meta: { title: "Clientes", isEntry: false },
          },
          {
            path: "adicionar",
            name: "adicionar-fornecedor",
            component: () => import("pages/suppliers/AddPage.vue"),
            meta: { title: "Clientes", isEntry: false },
          },
        ],
      },
      {
        path: "depositos",
        name: "depositos",
        redirect: { name: "list-deposit" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-depositos",
            component: () => import("pages/deposit/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-deposito",
            component: () => import("pages/deposit/EditPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-deposito",
            component: () => import("pages/deposit/AddPage.vue"),
          },
          {
            path: "list",
            name: "list-deposit",
            component: () => import("pages/deposit/index.vue"),
            meta: { title: "Depósitos", isEntry: true },
          },
          {
            path: ":id?",
            name: "editing-supplier",
            component: () => import("pages/deposit/edit.vue"),
            meta: { title: "Depósitos", isEntry: false },
          },
        ],
      },
      {
        path: "compras",
        name: "compras",
        redirect: { name: "lista-compras" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-compras",
            component: () => import("pages/compras/IndexPage.vue"),
            meta: { title: "Compras", isEntry: true },
          },
          // "nova" antes de ":id", senão seria lido como um identificador.
          {
            path: "nova",
            name: "nova-compra",
            component: () => import("pages/compras/EditPage.vue"),
            meta: { title: "Compras", isEntry: false },
          },
          {
            path: ":id",
            name: "ver-compra",
            component: () => import("pages/compras/EditPage.vue"),
            meta: { title: "Compras", isEntry: false },
          },
        ],
      },
      {
        path: "seguradoras",
        name: "seguradoras",
        redirect: { name: "list-insurances" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-seguradoras",
            component: () => import("pages/seguradoras/IndexPage.vue"),
          },
          {
            path: "clientes/:id",
            name: "clientes-seguradoras",
            component: () => import("pages/seguradoras/CustomersPages.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-seguradora",
            component: () => import("pages/seguradoras/EditPage.vue"),
          },
          {
            path: ":id/contas",
            name: "ver-contas",
            component: () => import("pages/seguradoras/ViewDocuments.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-seguradora",
            component: () => import("pages/seguradoras/AddPage.vue"),
          },
        ],
      },
      {
        path: "protocolos",
        name: "protocolos",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-protocolos",
            component: () => import("pages/protocolos/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-protocolo",
            component: () => import("pages/protocolos/EditPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-protocolo",
            component: () => import("pages/protocolos/AddPage.vue"),
          },
        ],
      },
      {
        path: "forma-pagamentos",
        name: "forma-pagamentos",
        redirect: { name: "list-payments" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-pagamentos",
            component: () => import("pages/payments/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-pagamento",
            component: () => import("pages/payments/EditPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-pagamento",
            component: () => import("pages/payments/AddPage.vue"),
          },
          {
            path: "list",
            name: "list-payments",
            component: () => import("pages/payments/index.vue"),
            meta: { title: "Métodos de pagamento", isEntry: true },
          },
          {
            path: ":id?",
            name: "editing-payment",
            component: () => import("pages/payments/edit.vue"),
            meta: { title: "Métodos de pagamento", isEntry: false },
          },
        ],
      },
      {
        path: "documentos-emitidos",
        name: "documentos-emitidos",
        redirect: { name: "documentos-emitidos-lista" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "documentos-emitidos-lista",
            component: () => import("pages/documents/IndexPage.vue"),
            meta: { title: "Documentos emitidos", isEntry: true },
          },
        ],
      },
      {
        path: "usuarios",
        name: "usuarios",
        redirect: { name: "list-usuarios" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-usuarios",
            component: () => import("pages/users/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-usuario",
            component: () => import("pages/users/EditPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-usuario",
            component: () => import("pages/users/AddPage.vue"),
          },
        ],
      },
      {
        path: "grupos",
        name: "grupos",
        redirect: { name: "list-grupos" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-grupos",
            component: () => import("pages/groups/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-grupo",
            component: () => import("pages/groups/EditPage.vue"),
          },
          {
            path: ":id/ver",
            name: "ver-grupo",
            component: () => import("pages/groups/SubGroupPage.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-grupo",
            component: () => import("pages/groups/AddPage.vue"),
          },
          {
            path: ":id/subgrupos",
            name: "subgrupos",
            component: () => import("pages/groups/Subgroup.vue"),
          },
        ],
      },
      {
        path: "stock-control",
        name: "stock-control",
        redirect: { name: "list-stock-control" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "list-stock-control",
            component: () => import("pages/stock-control/index.vue"),
            meta: { title: "Estoque | Controle", isEntry: true },
          },
          {
            path: ":id?",
            name: "editing-stock-control",
            component: () => import("pages/stock-control/edit.vue"),
            meta: { title: "Estoque | Controle", isEntry: false },
          },
        ],
      },
      {
        path: "inventario",
        name: "inventario",
        redirect: { name: "inventario-saldo" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "saldo",
            name: "inventario-saldo",
            component: () => import("pages/inventario/SaldoPage.vue"),
            meta: { title: "Inventário" },
          },
          {
            path: "historico",
            name: "inventario-movimentos",
            component: () => import("pages/inventario/MovimentosPage.vue"),
            meta: { title: "Histórico de movimentos" },
          },
          {
            path: "departamentos",
            name: "inventario-locais",
            component: () => import("pages/inventario/LocaisPage.vue"),
            meta: { title: "Departamentos" },
          },
          {
            path: "entradas",
            name: "inventario-entradas",
            component: () => import("pages/inventario/EntradasPage.vue"),
            meta: { title: "Entradas de Stock" },
          },
          {
            path: "transferencias",
            name: "inventario-transferencias",
            component: () => import("pages/inventario/TransferenciasPage.vue"),
            meta: { title: "Transferências" },
          },
          {
            path: "consumos",
            name: "inventario-consumos",
            component: () => import("pages/inventario/ConsumosPage.vue"),
            meta: { title: "Consumos" },
          },
          {
            path: "relatorio",
            name: "inventario-relatorio",
            component: () => import("pages/inventario/RelatorioPage.vue"),
            meta: { title: "Relatório Mensal" },
          },
        ],
      },
      {
        path: "materials",
        name: "materials",
        redirect: { name: "lista-materials" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-materials",
            component: () => import("pages/material/IndexPage.vue"),
          },
          {
            path: ":id/editar",
            name: "editar-materials",
            component: () => import("pages/material/EditPage.vue"),
          },
          {
            path: ":id/stock",
            name: "stock-material",
            component: () => import("pages/material/AddStock.vue"),
          },
          {
            path: "adicionar",
            name: "adicionar-materials",
            component: () => import("pages/material/AddPage.vue"),
          },
          {
            path: "unidades-de-medida",
            name: "unidades-de-medida",
            component: () => import("pages/unit-of-measure/IndexPage.vue"),
          },
          {
            path: "unidades-de-medida/nova",
            name: "nova-unidade",
            component: () => import("pages/unit-of-measure/AddPage.vue"),
          },
          {
            path: "unidades-de-medida/:id/editar",
            name: "editar-unidade",
            component: () => import("pages/unit-of-measure/EditPage.vue"),
          },
        ],
      },
      {
        path: "lotes",
        name: "batch",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "lista",
            name: "lista-lotes",
            component: () => import("pages/batches/IndexPage.vue"),
          },
        ],
      },
      {
        path: "sobre-nos",
        name: "sobre-nos",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "info",
            name: "sobre-nos-info",
            component: () => import("pages/about/EditPage.vue"),
          },
        ],
      },
      {
        path: "financeiro",
        name: "financeiro",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "relatorio",
            name: "financeiro-relatorio",
            component: () => import("pages/financial/IndexPage.vue"),
            meta: { title: "Financeiro", isEntry: true },
          },
        ],
      },
      {
        path: "relatorios",
        name: "relatorios",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "areas",
            name: "relatorios-areas",
            component: () => import("pages/reports/AreasPage.vue"),
            meta: { title: "Relatórios por Área", isEntry: true },
          },
        ],
      },
      {
        path: "balanco",
        name: "balanco",
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "",
            name: "balanco-relatorio",
            component: () => import("pages/balance/IndexPage.vue"),
          },
          {
            path: "relatorio",
            name: "balanco-relatorio-old",
            component: () => import("pages/balance/index.vue"),
            meta: { title: "Balanço", isEntry: true },
          },
          {
            path: "view/:category",
            name: "balanco-view",
            component: () => import("pages/balance/ViewPage.vue"),
            meta: { title: "Balanço", isEntry: true },
          },
        ],
      },
      {
        path: "dashboard",
        name: "dashboard",
        redirect: { name: "dashboard-page" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "",
            name: "dashboard-page",
            component: () => import("pages/dashboard/index.vue"),
            meta: { title: "Visão geral", isEntry: true },
          },
        ],
      },
      {
        path: "atendimento",
        name: "atendimento",
        redirect: { name: "recepcao-historico" },
        component: () => import("layouts/InnerLayout.vue"),
        children: [
          {
            path: "recepcao/lista",
            name: "lista-atendimento",
            component: () => import("pages/atendimento/reception/AddPage.vue"),
            meta: { title: "Novo atendimento", isEntry: true },
          },
          {
            path: "recepcao/historico",
            name: "recepcao-historico",
            component: () => import("pages/atendimento/reception/IndexPage.vue"),
            meta: { title: "Atendimentos", isEntry: true },
          },
          {
            path: "recepcao/atendimento/:id",
            name: "recepcao-atendimento",
            component: () => import("pages/atendimento/reception/ViewPage.vue"),
          },
          {
            path: "recepcao/pedidos-exame",
            name: "lista-exames",
            component: () => import("pages/atendimento/attendant/ExamPage.vue"),
            meta: { title: "Atendimento / Exames solicitados", isEntry: true },
          },
          {
            path: "recepcao/historico-pedidos",
            name: "historico-pedidos-exame",
            component: () => import("pages/atendimento/attendant/ExamHistoryPage.vue"),
            meta: { title: "Atendimento / Histórico de pedidos", isEntry: true },
          },
          {
            path: "recepcao/relatorios",
            name: "report-daily",
            component: () => import("pages/atendimento/attendant/Report.vue"),
            meta: { title: "Relatórios", isEntry: true },
          },
          {
            path: "enfermaria/triagem/lista",
            name: "lista-triagem",
            component: () => import("pages/atendimento/triagem/IndexPage.vue"),
            meta: { title: "Triagem", isEntry: true },
          },
          {
            path: "enfermaria/observacao/lista",
            name: "lista-observacao",
            component: () =>
              import("pages/atendimento/triagem/ObservationPage.vue"),
            meta: { title: "Observação", isEntry: true },
          },
          {
            path: "enfermaria/ambulatorio/lista",
            name: "lista-ambulatorio",
            component: () =>
              import("pages/atendimento/triagem/AmbulatoryPage.vue"),
            meta: { title: "Ambulatório", isEntry: true },
          },
          {
            path: "enfermaria/ambulatorio/:planId",
            name: "detalhe-ambulatorio",
            component: () =>
              import("pages/atendimento/triagem/AmbulatoryDetail.vue"),
            meta: { title: "Plano Ambulatório" },
          },
          {
            path: "enfermaria/administracao-farmacos/lista",
            name: "administracao-farmacos",
            component: () =>
              import("pages/atendimento/triagem/AdministrationMedicaments.vue"),
            meta: { title: "Administração de fármacos", isEntry: true },
          },
          {
            path: "enfermaria/vacinas/lista",
            name: "ordens-vacinas",
            component: () =>
              import("pages/atendimento/triagem/VaccineOrders.vue"),
            meta: { title: "Ordens de vacinação", isEntry: true },
          },
          {
            path: "enfermaria/cirurgia/lista",
            name: "lista-cirurgias",
            component: () =>
              import("pages/atendimento/triagem/SurgeryPage.vue"),
            meta: { title: "Pequenas cirurgias", isEntry: true },
          },
          {
            path: "enfermaria/observacao/adicionar",
            name: "adicionar-observacao",
            component: () =>
              import("pages/atendimento/triagem/AddObservacao.vue"),
            meta: { title: "Observação", isEntry: true },
          },
          {
            path: "enfermaria/triagem/historico",
            name: "historico-triagem",
            component: () => import("pages/atendimento/triagem/ListPage.vue"),
            meta: { title: "Triagem - Histórico", isEntry: true },
          },
          {
            path: "enfermaria/triagem/:consultationId?",
            name: "editar-triagem",
            component: () => import("pages/atendimento/triagem/EditPage.vue"),
            meta: { title: "Triagem", isEntry: true },
          },
          {
            path: "enfermaria/triagem/ver/:id",
            name: "ver-triagem",
            component: () => import("pages/atendimento/triagem/ViewPage.vue"),
            meta: { title: "Triagem", isEntry: true },
          },
          {
            path: "consulta/lista",
            name: "medico-lista-atendimento",
            component: () => import("pages/atendimento/medico/IndexPage.vue"),
          },
          {
            path: "consulta/historico",
            name: "medico-historico",
            component: () => import("pages/atendimento/medico/ListPage.vue"),
          },
          {
            path: "consulta/resultado-exames",
            name: "medico-lista-resultado-exames",
            component: () => import("pages/atendimento/medico/ExamList.vue"),
          },
          {
            path: "consulta/ver-exame/:consultationId",
            name: "medico-resultado-exame",
            component: () => import("pages/atendimento/medico/ViewResult.vue"),
          },
          {
            path: "consulta/:id",
            name: "medico-resultado",
            component: () => import("pages/atendimento/medico/ViewPage.vue"),
            meta: { title: "Histórico", isEntry: true },
          },
          {
            path: "consulta/iniciar/:consultationId",
            name: "medico-atendimento",
            component: () => import("pages/atendimento/medico/EditPage.vue"),
          },
          {
            path: "laboratorio/pedidos-exame",
            name: "pedidos-exame",
            component: () => import("pages/atendimento/exam/IndexPage.vue"),
          },
          {
            path: "laboratorio/:medicalConsultationId",
            name: "editar-exame",
            component: () => import("pages/atendimento/exam/EditPage.vue"),
          },
          {
            path: "laboratorio/externo/:customerId",
            name: "editar-exame-externo",
            component: () => import("pages/atendimento/exam/EditPageExternal.vue"),
          },
          {
            path: "laboratorio/historico",
            name: "historico-exame",
            component: () => import("pages/atendimento/exam/ListPage.vue"),
            meta: { title: "Laboratório", isEntry: true },
          },
          {
            path: "laboratorio/ver/:id",
            name: "ver-exame",
            component: () => import("pages/atendimento/exam/ViewPage.vue"),
            meta: { title: "Laboratório - Resultados", isEntry: true },
          },
          {
            path: "medico/exames/lista",
            name: "medico-lista-exames",
            component: () => import("pages/attending/medic/Exams.vue"),
            meta: { title: "Sala do médico", isEntry: true },
          },
          {
            path: "medico/exames/ver/:id",
            name: "medico-lista-exame",
            component: () => import("pages/attending/medic/ViewAndEdit.vue"),
            meta: { title: "Sala do médico", isEntry: true },
          },
          {
            path: "medico/relatório",
            name: "medico-report",
            component: () => import("pages/attending/medic/ReportMedic.vue"),
            meta: { title: "Sala do médico", isEntry: true },
          },
          {
            path: "recepcao/pedidos-exame",
            name: "recepcao-pedido-exame",
            component: () => import("pages/attending/attendance/AskExam.vue"),
          },
          {
            path: "recepcao/pedidos-enfermaria",
            name: "pedidos-enfermaria",
            component: () =>
              import("pages/atendimento/attendant/ScreeningRequests.vue"),
          },
          {
            path: ":id",
            name: "editar-atendimento",
            component: () => import("pages/attending/Form.vue"),
            meta: { title: "Atendimento / Recepção", isEntry: true },
          },
          // {
          //   path: ":id",
          //   name: "editar-atendimento",
          //   component: () => import("pages/attending/edit.vue"),
          //   meta: { title: "Atendimento / Recepção", isEntry: true },
          // },
          // {
          //   path: "pedidos-exame",
          //   name: "pedidos-exame",
          //   component: () => import("pages/attending/analyst/AskExams.vue"),
          //   meta: { title: "Pedidos de exame", isEntry: true },
          // },
          {
            path: "historico",
            name: "pedidos-historico",
            component: () => import("pages/attending/analyst/Historic.vue"),
            meta: { title: "Histórico de exames", isEntry: true },
          },
          {
            path: "ver-exames/:id",
            name: "ver-exames",
            component: () => import("pages/attending/analyst/ViewAndEdit.vue"),
            meta: { title: "Pedidos de exame", isEntry: true },
          },
        ],
      },
      // {
      //   path: "seguro-interno",
      //   name: "seguro-interno",
      //   component: () => import("layouts/InnerLayout.vue"),
      //   children: [
      //     {
      //       path: "lista",
      //       name: "seguro-interno-lista",
      //       component: () => import("pages/packages/IndexPage.vue"),
      //       meta: { title: "Seguro interno", isEntry: true },
      //     },
      //     {
      //       path: "adicionar",
      //       name: "seguro-interno-adicionar",
      //       component: () => import("pages/packages/AddPage.vue"),
      //       meta: { title: "Seguro interno", isEntry: true },
      //     },
      //     {
      //       path: ":id/editar",
      //       name: "seguro-interno-editar",
      //       component: () => import("pages/packages/EditPage.vue"),
      //       meta: { title: "Seguro interno", isEntry: true },
      //     },
      //   ],
      // },
    ],
  },
  {
    path: "/auth",
    component: () => import("layouts/SecondaryLayout.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("pages/Login.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
