/**
 * O menu da aplicação, inteiro, num só sítio.
 *
 * Forma de um grupo:
 *   { titulo: "Inventário" | null, itens: [ { title, to, icon, children? } ] }
 *
 * `titulo: null` é um grupo sem cabeçalho — a lista aparece directamente.
 *
 * ── Como está organizado ──────────────────────────────────────────────────
 *
 * Por trabalho de quem usa, na ordem do percurso do doente, e o suporte
 * depois: recepção → triagem → consulta → exames → internamento, e só então
 * facturação, stock, tesouraria, relatórios e configuração.
 *
 * Uma acção tem um nome só, em todos os papéis. "Histórico" chegou a
 * significar quatro coisas diferentes conforme quem estava em sessão; agora
 * qualifica-se pelo grupo onde vive.
 *
 * Os grupos são partilhados por referência entre papéis. Um médico e um
 * analista vêem o mesmo "Relatórios" porque é o mesmo destino, e a única
 * forma de não divergirem com o tempo é não haver duas cópias.
 */

// ── Blocos reutilizados ────────────────────────────────────────────────────

const RELATORIOS_AREA = {
  titulo: "Relatórios",
  itens: [
    { title: "Por área", to: { name: "relatorios-areas" }, icon: "las la-chart-pie" },
  ],
};

const RELATORIOS_GESTAO = {
  titulo: "Relatórios",
  itens: [
    { title: "Por área", to: { name: "relatorios-areas" }, icon: "las la-chart-pie" },
    { title: "Financeiro", to: { name: "financeiro-relatorio" }, icon: "las la-chart-line" },
    { title: "Balanço", to: { name: "balanco-relatorio", query: { mode: "diario" } }, icon: "las la-balance-scale" },
  ],
};

// "Vendas" descrevia mal o que está cá dentro: não há vendas, há emissão de
// documentos fiscais, o preçário que os alimenta e as entidades que os pagam.
const FACTURACAO = {
  titulo: "Facturação",
  itens: [
    { title: "Emitir documento", to: { name: "emitir-documento" }, icon: "las la-file-invoice" },
    { title: "Documentos", to: { name: "documentos-emitidos", query: { category: "FT" } }, icon: "las la-file-alt" },
    { title: "Preçário", to: { name: "precario" }, icon: "las la-money-bill-wave" },
    { title: "Clientes", to: { name: "lista-clientes" }, icon: "las la-user-friends" },
    { title: "Seguradoras", to: { name: "lista-seguradoras" }, icon: "las la-building" },
    { title: "Protocolos", to: { name: "lista-protocolos" }, icon: "las la-clipboard-list" },
  ],
};

const TESOURARIA = {
  titulo: "Tesouraria",
  itens: [
    { title: "Fluxo de caixa", to: { name: "fluxo" }, icon: "las la-exchange-alt" },
    { title: "Depósito", to: { name: "lista-depositos" }, icon: "las la-piggy-bank" },
  ],
};

const FARMACIA = {
  titulo: "Farmácia",
  itens: [
    { title: "Dispensar", to: { name: "farmacia-dispensar" }, icon: "las la-pills" },
    { title: "Histórico", to: { name: "farmacia-historico" }, icon: "las la-history" },
  ],
};

const INVENTARIO = {
  titulo: "Inventário",
  itens: [
    // "Estoque" é resíduo de PT-BR; o PRODUCT.md usa "stock" no corpo e a
    // forma portuguesa do saldo em mão é "existências".
    { title: "Existências", to: { name: "inventario-saldo" }, icon: "las la-warehouse" },
    {
      title: "Operações",
      icon: "las la-exchange-alt",
      children: [
        { title: "Entradas", to: { name: "inventario-entradas" }, icon: "las la-arrow-down" },
        { title: "Saídas (Consumo)", to: { name: "inventario-consumos" }, icon: "las la-minus-circle" },
        { title: "Transferências", to: { name: "inventario-transferencias" }, icon: "las la-exchange-alt" },
      ],
    },
    { title: "Histórico", to: { name: "inventario-movimentos" }, icon: "las la-history" },
    { title: "Relatório", to: { name: "inventario-relatorio" }, icon: "las la-chart-bar" },
    { title: "Departamentos", to: { name: "inventario-locais" }, icon: "las la-hospital" },
    { title: "Lotes", to: { name: "lista-lotes" }, icon: "las la-box" },
  ],
};

const ARTIGOS = {
  titulo: "Artigos",
  itens: [
    { title: "Produtos", to: { name: "produtos" }, icon: "las la-pills" },
    { title: "Serviços", to: { name: "servicos" }, icon: "las la-stethoscope" },
    { title: "Consumíveis", to: { name: "materials" }, icon: "las la-boxes" },
    { title: "Categorias", to: { name: "list-categorias" }, icon: "las la-tags" },
  ],
};

const COMPRAS = {
  titulo: "Compras",
  itens: [
    { title: "Fornecedores", to: { name: "lista-fornecedores" }, icon: "las la-truck" },
    { title: "Compras", to: { name: "compras" }, icon: "las la-shopping-cart" },
  ],
};

const CONFIGURACOES = {
  titulo: "Configurações",
  itens: [
    { title: "Unidades de medida", to: { name: "unidades-de-medida" }, icon: "las la-ruler" },
    { title: "Métodos de pagamento", to: { name: "lista-pagamentos" }, icon: "las la-credit-card" },
    { title: "Utilizadores", to: { name: "lista-usuarios" }, icon: "las la-users" },
    { title: "Informações", to: { name: "sobre-nos-info" }, icon: "las la-info-circle" },
  ],
};

const LABORATORIO = {
  titulo: "Laboratório",
  itens: [
    { title: "Pedidos de exame", to: { name: "pedidos-exame" }, icon: "las la-flask" },
    { title: "Histórico", to: { name: "historico-exame" }, icon: "las la-history" },
  ],
};

// ── O menu de cada papel ───────────────────────────────────────────────────

const MENUS = {
  admin: [
    // Sem área clínica: o admin administra o negócio e a configuração, não
    // executa o percurso do doente. Quem o executa tem o seu próprio menu.
    { titulo: null, itens: [{ title: "Visão geral", to: { name: "dashboard-page" }, icon: "las la-tachometer-alt" }] },
    FACTURACAO,
    FARMACIA,
    INVENTARIO,
    ARTIGOS,
    COMPRAS,
    TESOURARIA,
    RELATORIOS_GESTAO,
    CONFIGURACOES,
  ],

  // Quem recebe o doente. A primeira entrada é o acto, não a lista: abrir um
  // atendimento é o que esta pessoa faz dezenas de vezes por turno, e não
  // tinha entrada de menu nenhuma — chegava-se lá por URL ou não se chegava.
  attendant: [
    {
      titulo: "Recepção",
      itens: [
        { title: "Novo atendimento", to: { name: "lista-atendimento" }, icon: "las la-user-plus" },
        { title: "Atendimentos", to: { name: "recepcao-historico" }, icon: "las la-user-check" },
        { title: "Clientes", to: { name: "lista-clientes" }, icon: "las la-user-friends" },
      ],
    },
    {
      // Chamava-se "Laboratório", e não é: é a recepção a despachar os pedidos
      // que o médico fez. O laboratório tem menu próprio, com outro conteúdo.
      titulo: "Exames",
      itens: [
        { title: "Pedidos do médico", to: { name: "lista-exames" }, icon: "las la-flask" },
        { title: "Histórico de pedidos", to: { name: "historico-pedidos-exame" }, icon: "las la-history" },
      ],
    },
    {
      titulo: "Enfermaria",
      itens: [
        { title: "Pedidos da enfermaria", to: { name: "pedidos-enfermaria" }, icon: "las la-notes-medical" },
      ],
    },
    {
      titulo: "Facturação",
      itens: [
        { title: "Emitir documento", to: { name: "emitir-documento" }, icon: "las la-file-invoice" },
        { title: "Documentos", to: { name: "documentos-emitidos" }, icon: "las la-file-alt" },
        { title: "Preçário", to: { name: "precario" }, icon: "las la-money-bill-wave" },
      ],
    },
    {
      titulo: "Relatórios",
      itens: [
        { title: "Diário", to: { name: "report-daily" }, icon: "las la-chart-bar" },
        { title: "Por área", to: { name: "relatorios-areas" }, icon: "las la-chart-pie" },
      ],
    },
  ],

  nurse: [
    {
      titulo: "Triagem",
      itens: [
        { title: "Por triar", to: { name: "lista-triagem" }, icon: "las la-notes-medical" },
        { title: "Histórico", to: { name: "historico-triagem" }, icon: "las la-clipboard-list" },
      ],
    },
    {
      titulo: "Procedimentos",
      itens: [
        { title: "Observação", to: { name: "lista-observacao" }, icon: "las la-eye" },
        { title: "Ambulatório", to: { name: "lista-ambulatorio" }, icon: "las la-walking" },
        { title: "Pequenas cirurgias", to: { name: "lista-cirurgias" }, icon: "las la-user-injured" },
        { title: "Administração de fármacos", to: { name: "administracao-farmacos" }, icon: "las la-pills" },
        { title: "Vacinas", to: { name: "ordens-vacinas" }, icon: "las la-syringe" },
      ],
    },
    {
      titulo: "Internamento",
      itens: [
        { title: "Internados", to: { name: "lista-internamento" }, icon: "las la-procedures" },
      ],
    },
    RELATORIOS_AREA,
  ],

  doctor: [
    {
      titulo: "Consultas",
      itens: [
        { title: "Em espera", to: { name: "medico-lista-atendimento" }, icon: "las la-user-clock" },
        // Chamava-se "Consultas a decorrer" e aponta para a lista de
        // resultados de exame. O nome dizia uma coisa e a página mostrava outra.
        { title: "Resultados de exames", to: { name: "medico-lista-resultado-exames" }, icon: "las la-vial" },
        { title: "Histórico", to: { name: "medico-historico" }, icon: "las la-stethoscope" },
      ],
    },
    {
      // Um médico não conseguia procurar um doente a partir do menu.
      titulo: "Doentes",
      itens: [
        { title: "Clientes", to: { name: "lista-clientes" }, icon: "las la-user-friends" },
        { title: "Internados", to: { name: "lista-internamento" }, icon: "las la-procedures" },
      ],
    },
    RELATORIOS_AREA,
  ],

  financial: [FACTURACAO, TESOURARIA, RELATORIOS_GESTAO],

  inventory: [INVENTARIO, ARTIGOS, COMPRAS],
};

// Enfermeiro e técnico de enfermagem fazem o mesmo trabalho no sistema.
MENUS.techNursian = MENUS.nurse;

// Analista, técnico e chefe de laboratório partilhavam três listas idênticas
// carácter a carácter. Partilham uma.
const MENU_LAB = [LABORATORIO, RELATORIOS_AREA];
MENUS.analyst = MENU_LAB;
MENUS.techLab = MENU_LAB;
MENUS.chiefLab = MENU_LAB;

/** O menu de um papel, em grupos. Papel desconhecido não vê menu nenhum. */
export function menuParaPapel(role) {
  return MENUS[role] ?? [];
}

/** Achata os grupos numa lista pesquisável de destinos. */
export function destinosPesquisaveis(grupos) {
  const saida = [];
  for (const g of grupos ?? []) {
    for (const item of g.itens) {
      if (item.children) {
        for (const f of item.children) {
          saida.push({ ...f, grupo: g.titulo ? `${g.titulo} › ${item.title}` : item.title });
        }
      } else {
        saida.push({ ...item, grupo: g.titulo ?? "" });
      }
    }
  }
  return saida;
}
