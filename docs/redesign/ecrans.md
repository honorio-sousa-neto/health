# Ecrãs e rotas — MedicManager

Levantamento completo das rotas da aplicação, extraído de
`front/src/router/routes.js` avaliando o ficheiro e percorrendo a árvore de
rotas aninhadas — não por inspecção da árvore de ficheiros, que não diz o que
está de facto ligado.

**138 ecrãs** em 137 caminhos distintos (há uma colisão, ver o fim do
documento). Não estão aqui os 36 nós que são apenas invólucros de layout
(`MainLayout`, `InnerLayout`) ou redireccionamentos sem componente próprio.

## Como está classificada a densidade

A classificação segue o acto principal do ecrã, não o seu tamanho:

- **Leitura densa** — o utilizador está sobretudo a *ler* conteúdo clínico ou
  financeiro: consulta, resultados de exame, histórico, fichas de doente,
  relatórios, balanço, saldo de stock, doses a administrar.
- **Navegação** — o utilizador está sobretudo a *encontrar* ou a *introduzir*:
  listagens, filas de espera, pesquisa, formulários de criação e edição,
  configuração.

Uma fila de espera onde só se escolhe um doente é navegação; uma lista onde se
lê a dose prescrita antes de a administrar é leitura densa. Os casos em que
esta distinção é discutível estão assinalados no fim.

**35 de leitura densa · 103 de navegação.**

## Recepção e atendimento

*9 ecrãs — 4 de leitura densa, 5 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/attending/Form.vue` | `/atendimento/:id` | Atendimento — formulário | Navegação |
| `front/src/pages/atendimento/reception/ViewPage.vue` | `/atendimento/recepcao/atendimento/:id` | Recepção — ficha do atendimento | Leitura densa |
| `front/src/pages/atendimento/reception/IndexPage.vue` | `/atendimento/recepcao/historico` | Recepção — histórico de atendimentos | Leitura densa |
| `front/src/pages/atendimento/attendant/ExamHistoryPage.vue` | `/atendimento/recepcao/historico-pedidos` | Recepção — histórico de pedidos de exame | Leitura densa |
| `front/src/pages/atendimento/reception/AddPage.vue` | `/atendimento/recepcao/lista` | Recepção — abrir atendimento | Navegação |
| `front/src/pages/atendimento/attendant/ScreeningRequests.vue` | `/atendimento/recepcao/pedidos-enfermaria` | Recepção — pedidos para a enfermaria | Navegação |
| `front/src/pages/atendimento/attendant/ExamPage.vue` | `/atendimento/recepcao/pedidos-exame` | Recepção — pedidos de exame | Navegação |
| `front/src/pages/attending/attendance/AskExam.vue` | `/atendimento/recepcao/pedidos-exame` | Recepção — pedir exame (rota inalcançável) | Navegação |
| `front/src/pages/atendimento/attendant/Report.vue` | `/atendimento/recepcao/relatorios` | Recepção — relatório do dia | Leitura densa |

## Triagem e enfermaria

*11 ecrãs — 5 de leitura densa, 6 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/atendimento/triagem/AdministrationMedicaments.vue` | `/atendimento/enfermaria/administracao-farmacos/lista` | Enfermaria — administração de fármacos | Leitura densa |
| `front/src/pages/atendimento/triagem/AmbulatoryDetail.vue` | `/atendimento/enfermaria/ambulatorio/:planId` | Enfermaria — detalhe do plano de ambulatório | Leitura densa |
| `front/src/pages/atendimento/triagem/AmbulatoryPage.vue` | `/atendimento/enfermaria/ambulatorio/lista` | Enfermaria — planos de ambulatório | Navegação |
| `front/src/pages/atendimento/triagem/SurgeryPage.vue` | `/atendimento/enfermaria/cirurgia/lista` | Enfermaria — cirurgias | Navegação |
| `front/src/pages/atendimento/triagem/AddObservacao.vue` | `/atendimento/enfermaria/observacao/adicionar` | Enfermaria — nova observação | Navegação |
| `front/src/pages/atendimento/triagem/ObservationPage.vue` | `/atendimento/enfermaria/observacao/lista` | Enfermaria — doentes em observação | Leitura densa |
| `front/src/pages/atendimento/triagem/EditPage.vue` | `/atendimento/enfermaria/triagem/:consultationId?` | Triagem — sinais vitais | Navegação |
| `front/src/pages/atendimento/triagem/ListPage.vue` | `/atendimento/enfermaria/triagem/historico` | Triagem — histórico | Leitura densa |
| `front/src/pages/atendimento/triagem/IndexPage.vue` | `/atendimento/enfermaria/triagem/lista` | Triagem — fila de espera | Navegação |
| `front/src/pages/atendimento/triagem/ViewPage.vue` | `/atendimento/enfermaria/triagem/ver/:id` | Triagem — ver triagem | Leitura densa |
| `front/src/pages/atendimento/triagem/VaccineOrders.vue` | `/atendimento/enfermaria/vacinas/lista` | Enfermaria — ordens de vacinação | Navegação |

## Consulta médica

*9 ecrãs — 7 de leitura densa, 2 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/atendimento/medico/ViewPage.vue` | `/atendimento/consulta/:id` | Consulta — ficha da consulta | Leitura densa |
| `front/src/pages/atendimento/medico/ListPage.vue` | `/atendimento/consulta/historico` | Consulta — histórico de consultas | Leitura densa |
| `front/src/pages/atendimento/medico/EditPage.vue` | `/atendimento/consulta/iniciar/:consultationId` | Consulta médica | Leitura densa |
| `front/src/pages/atendimento/medico/IndexPage.vue` | `/atendimento/consulta/lista` | Consulta — fila de doentes | Navegação |
| `front/src/pages/atendimento/medico/ExamList.vue` | `/atendimento/consulta/resultado-exames` | Consulta — resultados dos exames pedidos | Leitura densa |
| `front/src/pages/atendimento/medico/ViewResult.vue` | `/atendimento/consulta/ver-exame/:consultationId` | Consulta — leitura do resultado de exame | Leitura densa |
| `front/src/pages/attending/medic/Exams.vue` | `/atendimento/medico/exames/lista` | Médico — lista de exames | Navegação |
| `front/src/pages/attending/medic/ViewAndEdit.vue` | `/atendimento/medico/exames/ver/:id` | Médico — ver exame | Leitura densa |
| `front/src/pages/attending/medic/ReportMedic.vue` | `/atendimento/medico/relatório` | Médico — relatório de actividade | Leitura densa |

## Laboratório e exames

*13 ecrãs — 5 de leitura densa, 8 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/attending/analyst/Historic.vue` | `/atendimento/historico` | Exames — histórico de pedidos | Leitura densa |
| `front/src/pages/atendimento/exam/EditPage.vue` | `/atendimento/laboratorio/:medicalConsultationId` | Laboratório — lançar resultados | Leitura densa |
| `front/src/pages/atendimento/exam/EditPageExternal.vue` | `/atendimento/laboratorio/externo/:customerId` | Laboratório — lançar resultados de exame externo | Leitura densa |
| `front/src/pages/atendimento/exam/ListPage.vue` | `/atendimento/laboratorio/historico` | Laboratório — histórico de exames | Leitura densa |
| `front/src/pages/atendimento/exam/IndexPage.vue` | `/atendimento/laboratorio/pedidos-exame` | Laboratório — fila de pedidos | Navegação |
| `front/src/pages/atendimento/exam/ViewPage.vue` | `/atendimento/laboratorio/ver/:id` | Laboratório — ver resultado | Leitura densa |
| `front/src/pages/attending/analyst/ViewAndEdit.vue` | `/atendimento/ver-exames/:id` | Exames — lançar e rever pedido | Navegação |
| `front/src/pages/exames/edit.vue` | `/exames/:id?` | Exame — editar (versão antiga) | Navegação |
| `front/src/pages/exames/index.vue` | `/exames/lista` | Exames (versão antiga) | Navegação |
| `front/src/pages/section/AddPage.vue` | `/laboratorio/adicionar` | Laboratório — nova secção | Navegação |
| `front/src/pages/section/ViewPageExam.vue` | `/laboratorio/seccao-exames/:id?` | Laboratório — criar exame | Navegação |
| `front/src/pages/section/ViewPage.vue` | `/laboratorio/seccao/:id` | Laboratório — exames e parâmetros da secção | Navegação |
| `front/src/pages/section/IndexPage.vue` | `/laboratorio/seccao/lista` | Laboratório — secções | Navegação |

## Farmácia

*2 ecrãs — 2 de leitura densa, 0 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/farmacia/DispensarPage.vue` | `/farmacia/dispensar` | Farmácia — dispensar receita | Leitura densa |
| `front/src/pages/farmacia/HistoricoPage.vue` | `/farmacia/historico` | Farmácia — histórico de dispensas | Leitura densa |

## Inventário e lotes

*10 ecrãs — 3 de leitura densa, 7 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/inventario/ConsumosPage.vue` | `/inventario/consumos` | Inventário — saídas (consumo) | Navegação |
| `front/src/pages/inventario/LocaisPage.vue` | `/inventario/departamentos` | Inventário — departamentos | Navegação |
| `front/src/pages/inventario/EntradasPage.vue` | `/inventario/entradas` | Inventário — entradas | Navegação |
| `front/src/pages/inventario/MovimentosPage.vue` | `/inventario/historico` | Inventário — histórico de movimentos | Leitura densa |
| `front/src/pages/inventario/RelatorioPage.vue` | `/inventario/relatorio` | Inventário — relatório | Leitura densa |
| `front/src/pages/inventario/SaldoPage.vue` | `/inventario/saldo` | Inventário — saldo por local e lote | Leitura densa |
| `front/src/pages/inventario/TransferenciasPage.vue` | `/inventario/transferencias` | Inventário — transferências | Navegação |
| `front/src/pages/batches/IndexPage.vue` | `/lotes/lista` | Lotes | Navegação |
| `front/src/pages/stock-control/edit.vue` | `/stock-control/:id?` | Controlo de stock — editar (versão antiga) | Navegação |
| `front/src/pages/stock-control/index.vue` | `/stock-control/lista` | Controlo de stock (versão antiga) | Navegação |

## Artigos e preçário

*32 ecrãs — 0 de leitura densa, 32 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/category/EditPage.vue` | `/categorias/:id/editar` | Editar categoria | Navegação |
| `front/src/pages/category/AddPage.vue` | `/categorias/adicionar` | Nova categoria | Navegação |
| `front/src/pages/category/IndexPage.vue` | `/categorias/lista` | Categorias | Navegação |
| `front/src/pages/material/EditPage.vue` | `/materials/:id/editar` | Editar consumível | Navegação |
| `front/src/pages/material/AddStock.vue` | `/materials/:id/stock` | Consumível — entrada de stock | Navegação |
| `front/src/pages/material/AddPage.vue` | `/materials/adicionar` | Novo consumível | Navegação |
| `front/src/pages/material/IndexPage.vue` | `/materials/lista` | Consumíveis | Navegação |
| `front/src/pages/unit-of-measure/IndexPage.vue` | `/materials/unidades-de-medida` | Unidades de medida | Navegação |
| `front/src/pages/unit-of-measure/EditPage.vue` | `/materials/unidades-de-medida/:id/editar` | Editar unidade de medida | Navegação |
| `front/src/pages/unit-of-measure/AddPage.vue` | `/materials/unidades-de-medida/nova` | Nova unidade de medida | Navegação |
| `front/src/pages/medicamentos/EditPage.vue` | `/medicamentos/:id/editar` | Editar medicamento | Navegação |
| `front/src/pages/medicamentos/AddPage.vue` | `/medicamentos/adicionar` | Novo medicamento | Navegação |
| `front/src/pages/medicamentos/IndexPage.vue` | `/medicamentos/lista` | Medicamentos | Navegação |
| `front/src/pages/precario/IndexPage.vue` | `/precario/lista` | Preçário | Navegação |
| `front/src/pages/products/EditPage.vue` | `/produtos/:id/editar` | Editar produto | Navegação |
| `front/src/pages/products/AttachMaterial.vue` | `/produtos/:id/mapear-insumo` | Produto — mapear consumíveis | Navegação |
| `front/src/pages/products/AddPage.vue` | `/produtos/adicionar` | Novo produto | Navegação |
| `front/src/pages/products/IndexPage.vue` | `/produtos/lista` | Produtos | Navegação |
| `front/src/pages/imagiologia/EditPage.vue` | `/servicos-clinicos/imagiologia/:id/editar` | Editar tipo de imagiologia | Navegação |
| `front/src/pages/imagiologia/AddPage.vue` | `/servicos-clinicos/imagiologia/adicionar` | Novo tipo de imagiologia | Navegação |
| `front/src/pages/imagiologia/IndexPage.vue` | `/servicos-clinicos/imagiologia/lista` | Imagiologia — tipos | Navegação |
| `front/src/pages/hospitalization/EditPage.vue` | `/servicos-clinicos/internamento/:id/editar` | Editar tipo de internamento | Navegação |
| `front/src/pages/hospitalization/AddPage.vue` | `/servicos-clinicos/internamento/adicionar` | Novo tipo de internamento | Navegação |
| `front/src/pages/hospitalization/IndexPage.vue` | `/servicos-clinicos/internamento/lista` | Internamento — tipos | Navegação |
| `front/src/pages/treatment-observation/EditPage.vue` | `/servicos-clinicos/tratamento-observacao/:id/editar` | Editar tipo de tratamento em observação | Navegação |
| `front/src/pages/treatment-observation/AddPage.vue` | `/servicos-clinicos/tratamento-observacao/adicionar` | Novo tipo de tratamento em observação | Navegação |
| `front/src/pages/treatment-observation/IndexPage.vue` | `/servicos-clinicos/tratamento-observacao/lista` | Tratamento em observação — tipos | Navegação |
| `front/src/pages/services/EditPage.vue` | `/servicos/:id/editar` | Editar serviço | Navegação |
| `front/src/pages/services/AttachMaterial.vue` | `/servicos/:id/mapear-insumo` | Serviço — mapear consumíveis | Navegação |
| `front/src/pages/services/edit.vue` | `/servicos/:id?` | Serviço — editar (versão antiga) | Navegação |
| `front/src/pages/services/AddPage.vue` | `/servicos/adicionar` | Novo serviço | Navegação |
| `front/src/pages/services/IndexPage.vue` | `/servicos/lista` | Serviços | Navegação |

## Compras e fornecedores

*5 ecrãs — 0 de leitura densa, 5 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/compras/EditPage.vue` | `/compras/:id?` | Compra — registo e recepção | Navegação |
| `front/src/pages/compras/IndexPage.vue` | `/compras/lista` | Compras | Navegação |
| `front/src/pages/suppliers/EditPage.vue` | `/fornecedores/:id/editar` | Editar fornecedor | Navegação |
| `front/src/pages/suppliers/AddPage.vue` | `/fornecedores/adicionar` | Novo fornecedor | Navegação |
| `front/src/pages/suppliers/IndexPage.vue` | `/fornecedores/lista` | Fornecedores | Navegação |

## Vendas e documentos

*14 ecrãs — 2 de leitura densa, 12 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/clients/EditPage.vue` | `/clientes/:id/editar` | Editar cliente | Navegação |
| `front/src/pages/clients/ViewInvoices.vue` | `/clientes/:id/ver-contas` | Cliente — contas e documentos | Leitura densa |
| `front/src/pages/clients/AddPage.vue` | `/clientes/adicionar` | Novo cliente | Navegação |
| `front/src/pages/clients/IndexPage.vue` | `/clientes/lista` | Clientes | Navegação |
| `front/src/pages/documents/IndexPage.vue` | `/documentos-emitidos/lista` | Documentos emitidos | Navegação |
| `front/src/pages/documents/CreateDocument.vue` | `/emitir-documento/emitir/:medicalConsultationId?/:surgeryId…` | Emitir documento (FT, FR, RC) | Navegação |
| `front/src/pages/protocolos/EditPage.vue` | `/protocolos/:id/editar` | Editar protocolo | Navegação |
| `front/src/pages/protocolos/AddPage.vue` | `/protocolos/adicionar` | Novo protocolo | Navegação |
| `front/src/pages/protocolos/IndexPage.vue` | `/protocolos/lista` | Protocolos | Navegação |
| `front/src/pages/seguradoras/ViewDocuments.vue` | `/seguradoras/:id/contas` | Seguradora — contas | Leitura densa |
| `front/src/pages/seguradoras/EditPage.vue` | `/seguradoras/:id/editar` | Editar seguradora | Navegação |
| `front/src/pages/seguradoras/AddPage.vue` | `/seguradoras/adicionar` | Nova seguradora | Navegação |
| `front/src/pages/seguradoras/CustomersPages.vue` | `/seguradoras/clientes/:id` | Seguradora — clientes | Navegação |
| `front/src/pages/seguradoras/IndexPage.vue` | `/seguradoras/lista` | Seguradoras | Navegação |

## Financeiro

*17 ecrãs — 6 de leitura densa, 11 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/balance/IndexPage.vue` | `/balanco` | Balanço | Leitura densa |
| `front/src/pages/balance/index.vue` | `/balanco/relatorio` | Balanço (versão antiga) | Leitura densa |
| `front/src/pages/balance/ViewPage.vue` | `/balanco/view/:category` | Balanço — detalhe por categoria | Leitura densa |
| `front/src/pages/caixa/IndexPage.vue` | `/caixa` | Fluxo de caixa | Leitura densa |
| `front/src/pages/caixa/index.vue` | `/caixa/lista` | Caixa — sessões | Navegação |
| `front/src/pages/deposit/EditPage.vue` | `/depositos/:id/editar` | Editar depósito | Navegação |
| `front/src/pages/deposit/edit.vue` | `/depositos/:id?` | Depósito — editar (versão antiga) | Navegação |
| `front/src/pages/deposit/AddPage.vue` | `/depositos/adicionar` | Novo depósito | Navegação |
| `front/src/pages/deposit/index.vue` | `/depositos/list` | Depósitos (versão antiga) | Navegação |
| `front/src/pages/deposit/IndexPage.vue` | `/depositos/lista` | Depósitos | Navegação |
| `front/src/pages/financial/IndexPage.vue` | `/financeiro/relatorio` | Relatório financeiro | Leitura densa |
| `front/src/pages/payments/EditPage.vue` | `/forma-pagamentos/:id/editar` | Editar forma de pagamento | Navegação |
| `front/src/pages/payments/edit.vue` | `/forma-pagamentos/:id?` | Forma de pagamento — editar (versão antiga) | Navegação |
| `front/src/pages/payments/AddPage.vue` | `/forma-pagamentos/adicionar` | Nova forma de pagamento | Navegação |
| `front/src/pages/payments/index.vue` | `/forma-pagamentos/list` | Formas de pagamento (versão antiga) | Navegação |
| `front/src/pages/payments/IndexPage.vue` | `/forma-pagamentos/lista` | Formas de pagamento | Navegação |
| `front/src/pages/reports/AreasPage.vue` | `/relatorios/areas` | Relatórios por área | Leitura densa |

## Configuração

*12 ecrãs — 0 de leitura densa, 12 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/consultation/EditPage.vue` | `/consulta/:id/editar` | Editar tipo de consulta | Navegação |
| `front/src/pages/consultation/AddPage.vue` | `/consulta/adicionar` | Novo tipo de consulta | Navegação |
| `front/src/pages/consultation/IndexPage.vue` | `/consulta/lista` | Tipos de consulta | Navegação |
| `front/src/pages/groups/EditPage.vue` | `/grupos/:id/editar` | Editar grupo | Navegação |
| `front/src/pages/groups/Subgroup.vue` | `/grupos/:id/subgrupos` | Subgrupos | Navegação |
| `front/src/pages/groups/SubGroupPage.vue` | `/grupos/:id/ver` | Grupo — subgrupos e serviços | Navegação |
| `front/src/pages/groups/AddPage.vue` | `/grupos/adicionar` | Novo grupo | Navegação |
| `front/src/pages/groups/IndexPage.vue` | `/grupos/lista` | Grupos | Navegação |
| `front/src/pages/about/EditPage.vue` | `/sobre-nos/info` | Dados da clínica | Navegação |
| `front/src/pages/users/EditPage.vue` | `/usuarios/:id/editar` | Editar utilizador | Navegação |
| `front/src/pages/users/AddPage.vue` | `/usuarios/adicionar` | Novo utilizador | Navegação |
| `front/src/pages/users/IndexPage.vue` | `/usuarios/lista` | Utilizadores | Navegação |

## Sistema

*4 ecrãs — 1 de leitura densa, 3 de navegação.*

| Ficheiro | Rota | Nome clínico | Densidade |
|---|---|---|---|
| `front/src/pages/ErrorNotFound.vue` | `/:catchAll(.*)*` | Página não encontrada | Navegação |
| `front/src/pages/Login.vue` | `/auth/login` | Início de sessão | Navegação |
| `front/src/pages/IndexPage.vue` | `/bem-vindo` | Ecrã de entrada | Navegação |
| `front/src/pages/dashboard/index.vue` | `/dashboard` | Painel geral da clínica | Leitura densa |

## Notas de levantamento

**Colisão de rota.** Duas rotas declaram o mesmo caminho
`/atendimento/recepcao/pedidos-exame`:
`pages/atendimento/attendant/ExamPage.vue` (nome `lista-exames`) e
`pages/attending/attendance/AskExam.vue` (nome `recepcao-pedido-exame`).
A segunda nunca é alcançada por URL — só por nome.

**Ecrãs em duplicado.** Dez rotas apontam para versões antigas que coexistem
com a substituta, distinguidas apenas pela capitalização do ficheiro —
`IndexPage.vue` / `index.vue`, `EditPage.vue` / `edit.vue`:

| Área | Versão antiga | Substituta |
|---|---|---|
| Balanço | `pages/balance/index.vue` | `pages/balance/IndexPage.vue` |
| Depósitos | `pages/deposit/index.vue`, `edit.vue` | `pages/deposit/IndexPage.vue`, `EditPage.vue` |
| Formas de pagamento | `pages/payments/index.vue`, `edit.vue` | `pages/payments/IndexPage.vue`, `EditPage.vue` |
| Serviços | `pages/services/edit.vue` | `pages/services/EditPage.vue` |
| Exames | `pages/exames/index.vue`, `edit.vue` | secção de laboratório (`pages/section/*`) |
| Controlo de stock | `pages/stock-control/index.vue`, `edit.vue` | inventário (`pages/inventario/*`) |

Estão assinalados no nome com "(versão antiga)" e são candidatos a remoção
antes de qualquer redesenho — cada um é superfície que teria de ser
redesenhada duas vezes.

A caixa **não** é um destes casos: `pages/caixa/IndexPage.vue` (fluxo) e
`pages/caixa/index.vue` (sessões) são ecrãs distintos, apesar do par de nomes.

**Casos de fronteira na classificação.**

- *Emitir documento* é um formulário — e por isso navegação — mas é o maior
  ecrã de entrada de dados da aplicação (2260 linhas agregadas, 18 campos).
  Se o redesenho tratar densidade por tamanho, este pertence ao outro grupo.
- *Enfermaria — administração de fármacos* e *Farmácia — dispensar receita*
  são listagens pela forma, mas o que lá se lê é a dose. Ficaram em leitura
  densa por isso.
- *Inventário — saldo* tem 17 campos em diálogos de entrada, mas o ecrã existe
  para se ler o saldo por local e lote.
- *Laboratório — exames e parâmetros da secção* tem nove tabelas e 1046 linhas,
  mas é configuração, não leitura clínica.

**Rotas com parâmetros.** Os caminhos mais longos foram truncados na tabela
para não a alargarem; o mais extenso é o de emissão de documento, que aceita
seis parâmetros opcionais de origem (consulta, cirurgia, administração,
prescrição, farmácia, observação).

