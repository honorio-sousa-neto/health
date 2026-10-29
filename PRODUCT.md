# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O sistema serve uma equipa clínica inteira, e **nenhum papel foi eleito como prioritário** — o design tem de servir todos os intervenientes do percurso do paciente e do dinheiro.

Os papéis são explícitos no modelo de dados (`enum Role`, `back/prisma/schema.prisma`):

| Papel | Trabalho que faz no sistema |
|---|---|
| `attendant` | Recebe o paciente, abre o atendimento, gere a fila de espera |
| `nurse` · `techNursian` | Triagem, sinais vitais, administração de medicamentos, vacinação |
| `doctor` | Consulta médica, prescrição, pedido de exames, leitura de resultados |
| `analyst` · `techLab` · `chiefLab` | Execução e validação de exames de laboratório e imagiologia |
| `financial` | Emissão de documentos, pagamentos, caixa, fluxo, depósitos, balanço |
| `inventory` | Stock por local e lote, entradas/saídas/transferências, compras, fornecedores |
| `admin` | Configuração, utilizadores, preçário, relatórios, visão do negócio |

O menu já reflecte esta separação: `menuParaPapel()` em `front/src/config/menu.js` entrega ao papel `inventory` apenas os grupos Inventário, Artigos e Compras; `admin` vê tudo. Os restantes papéis operam sobretudo nas áreas clínicas (`pages/atendimento/*`).

## Product Purpose

Sistema de gestão da **Clínica Alfavida**: cobre o percurso completo de um paciente — recepção, triagem, consulta, exames, prescrição, dispensa em farmácia, internamento e cirurgia — e liga esse percurso directamente à facturação, tesouraria e ao stock consumido.

Sucesso é o atendimento correr de ponta a ponta dentro do sistema, sem papel paralelo: o que foi feito ao paciente é o que é facturado, e o que foi facturado é o que sai do stock.

## Positioning

Software interno feito à medida de **uma clínica concreta**, não produto multi-clínica. O design pode assumir os fluxos, o vocabulário e a equipa reais da Alfavida, sem os generalizar para configurações hipotéticas de outros clientes.

O que o distingue de um ERP genérico ou de um prontuário isolado: o percurso clínico, a facturação fiscal angolana e o consumo de stock são o mesmo sistema, não três integrados. Um serviço prescrito na consulta gera o item facturável e o movimento de stock a partir do mesmo acto.

## Operating Context

- **Angola.** Moeda AOA (`front/src/utils/format.js`), interface em português (`lang: "pt"` em `quasar.config.js`), ortografia pré-acordo no produto ("facturação", "actualizar").
- **Documentos fiscais angolanos:** `FT`, `FR`, `RC`, `ND`, `NC`, `PP` (`enum InvoiceType`), com rodapé de programa validado pela AGT impresso nos documentos.
- **Tempo real:** Socket.IO emite `screening:create` e `screening:update`; as páginas de triagem e atendimento actualizam a fila sem refresh.
- **Ligação instável.** Confirmado como condição real: quedas de rede e ligação lenta acontecem durante o turno. Estados de erro, reconexão e risco de perda de dados em formulários longos são preocupação de produto, não hipótese.
- **Máquinas e ecrãs fracos.** Confirmado: portáteis antigos, ecrãs pequenos ou de baixa resolução, pouca memória. Peso de página, densidade de informação e custo de render contam.
- **Acesso por browser (SPA).** É assim que a equipa usa o sistema. Existe um build Electron em `front/src-electron/`, mas não é o caminho real dos utilizadores.
- **Sessão:** utilizador em `SessionStorage` (`alfavida_user`), JWT injectado pelo Axios, `401` redirecciona para `/login`.

## Capabilities and Constraints

**Stack (já decidida pelo código existente):** Vue 3 (Composition API) + Quasar v2 + Vite (Quasar CLI 3), Pinia 3 (45+ stores), Vue Router 5, Axios, Socket.IO, ApexCharts, PDFMake. Backend Node/TypeScript + Express + Prisma + PostgreSQL, validação Zod, relatórios ExcelJS/PDFMake.

**Domínios cobertos:** atendimento (recepção, triagem, médico, exames, imagiologia, vacinação, cirurgia, internamento, observação, ambulatório), pacientes, utilizadores, emissão de documentos, caixa, fluxo, depósitos, balanço, serviços, produtos, consumíveis, categorias, preçário, inventário (saldo, entradas, saídas, transferências, histórico, lotes, departamentos), compras, fornecedores, protocolos, seguradoras externas e internas, parceiros, grupos, relatórios por área e financeiros.

**Escala do domínio:** ~60 modelos Prisma, 56+ módulos de rotas no backend, **138 ecrãs roteados** no frontend (medido em 2026-09-11 avaliando `front/src/router/routes.js` e percorrendo a árvore de rotas aninhadas). Qualquer decisão de design tem de sobreviver a esta superfície — padrões que só funcionam em três ecrãs não servem.

**Superfície real vs. ficheiros — há código morto, e é para remover.** `front/src/pages/` tem 393 ficheiros `.vue`, mas só 227 são alcançáveis a partir de rotas ou layouts: **166 (42%) não têm caminho nenhum até eles.** Descartado como explicação: zero `defineAsyncComponent`, zero `import()` dinâmico fora do router, zero registo global de componentes, e o único `<component :is>` está ele próprio num ficheiro órfão. Existem ainda 10 ecrãs em duplicado, distinguidos apenas pela capitalização (`IndexPage.vue` / `index.vue`, `EditPage.vue` / `edit.vue`), e uma colisão de rota em `/atendimento/recepcao/pedidos-exame`, declarada por dois componentes — o segundo nunca é alcançável por URL.

Confirmado pelo dono do produto em 2026-09-11: **é código morto e removê-lo é trabalho legítimo.** O que conta como superfície do produto são os 138 ecrãs roteados, não os 393 ficheiros. Qualquer estimativa de esforço de redesenho parte dos 138.

**Inventário:** todo o stock passa por um serviço central — FEFO/lote por local, custo médio, anulação de compra. Movimentos são `MovimentationStock` sobre `StockLocation` e `BatchProduct`.

**Constrangimentos duros:**
- O rodapé de certificação AGT é texto legal, não copy de design. Não pode ser reescrito, encurtado nem estilizado para caber.
- Documentos fiscais emitidos são imutáveis; o desenho não pode sugerir edição depois de finalizados.
- A terminologia clínica e fiscal em uso (triagem, precário, atendimento, FT/FR/RC) é vocabulário da casa e das finanças angolanas — não é substituível por sinónimos "mais claros".

## Brand Commitments

**O verde é compromisso.** Confirmado pelo dono do produto em 2026-09-11, revendo a posição anterior: a paleta adoptada deixa de ser substituível e trabalho futuro parte dela em vez de a reabrir. São dois valores, com papéis que não se trocam:

- `#32b989` — o verde da marca. Contornos, anéis de foco, ícones e tintas translúcidas. Dá 2,49:1 com branco, por isso **nunca carrega texto branco**.
- `#1e8460` — a variante para sólidos com texto branco por cima (4,64:1). É `$primary` do Quasar em `front/src/css/quasar.variables.scss`.

**O logo continua não vinculativo.** `front/src/assets/logo.png` e `logo.jpg` são estado de implementação, não promessa; trabalho de identidade pode substituí-los. Esta decisão não foi reaberta em 2026-09-11 — mantém-se como estava registada.

O nome **Clínica Alfavida** e o nome de produto **MedicManager** (`front/package.json`) são os que estão em uso. A língua do produto é português de Angola.

## Evidence on Hand

- **Logo real:** `front/src/assets/logo.png` e `logo.jpg` (não vinculativos, mas reais).
- **Ilustrações existentes:** `front/src/assets/medics.svg`, `welcome.svg`.
- **Dados de preçário reais:** ficheiros `.xlsx` na raiz do repositório — `classificacao-servicos.xlsx` e as tabelas de receitas por área (ecografia, estomatologia, internamento, laboratório, observação, pequenas cirurgias, radiologia, serologia).
- **Certificação AGT confirmada:** «Processado por programa validado nº 355/AGT/2023 FacilitaSoft (3.1.1)». Está idêntico, carácter a carácter, no backend (`back/src/controllers/report-new/index.ts`) e no frontend (`front/src/utils/reports/print.js:78`). *O defeito aqui registado até 2026-09-11 — o frontend com «n31.1/AGT20 KambaSoft (1.0.1)» — está corrigido; verificado por comparação directa dos dois ficheiros.*
- **Levantamento de ecrãs:** `docs/redesign/ecrans.md` — os 138 ecrãs roteados com ficheiro, rota, nome clínico e classificação de densidade, extraído do router e não da árvore de ficheiros.
- **Ausências que não podem ser fabricadas:** não há testemunhos, casos de estudo, números de adopção, benchmarks, imprensa, preços de licenciamento nem promessas de SLA. Nenhum trabalho futuro pode inventá-los.

## Product Principles

1. **Nenhum papel é cidadão de segunda.** Não há utilizador prioritário; a triagem e o inventário merecem o mesmo cuidado que a consulta. Um padrão só está pronto quando serve o percurso inteiro.
2. **O acto clínico, a factura e o stock são a mesma verdade.** O desenho tem de tornar essa ligação legível, nunca deixar as três leituras divergirem no ecrã.
3. **Assumir a rede a falhar.** Estados de carregamento, erro, reconexão e trabalho não guardado são parte do desenho de cada ecrã, não um extra de robustez.
4. **Leve por obrigação.** Ecrãs fracos e máquinas antigas são o alvo real. Densidade útil e custo de render baixo ganham a expressão visual cara.
5. **O vocabulário da casa manda.** Termos clínicos e fiscais em uso pela equipa e pela AGT não se traduzem para linguagem "mais amigável".

## Accessibility & Inclusion

**WCAG 2.1 nível AA é requisito.** Decidido em 2026-09-11, fechando o que estava em aberto. A norma é agora o critério objectivo de quem trabalhar no sistema: contraste verificável em vez de julgamento caso a caso, nos dois temas.

A decisão é possível porque o trabalho já lá chegou em boa parte — a escala de estado tem três degraus precisamente para que texto, elemento gráfico e fundo tenham cada um o seu rácio, e os seis degraus de texto foram corrigidos para passar AA sobre superfície.

Dois requisitos de produto sustentam-na e valem por si, independentemente da norma:

- **O hardware é o alvo real.** O sistema é lido em ecrãs pequenos e de baixa resolução, em máquinas antigas. Contraste, tamanho mínimo de texto e alvos de toque/clique têm de aguentar essas condições — não por conformidade abstracta, mas porque é o hardware da clínica.
- **Texto pequeno é risco clínico, não densidade.** Existe um piso absoluto de 12px e o corpo trabalha a 14px. Um ecrã que precise de descer abaixo do piso para caber está a pedir menos colunas, não menos tamanho — num sistema onde se lê uma dose, isso não é negociável.

**Dívida conhecida contra esta norma:** restam 5 sítios onde o verde da marca (`#32b989`) é fundo sólido com texto branco, a 2,49:1. A correcção é trocar para `#1e8460`, e muda a aparência desses ecrãs. Está identificada, não corrigida.

## Restrições clínicas (não negociáveis)

- A distinção normal/alterado é sempre redundante: cor + peso + símbolo. Nunca só cor.
- Intervalos de referência visíveis junto ao valor, não em tooltip.
- Densidade é uma virtude. Nunca separar listas de parâmetros em cards espaçados.
- Alinhamento numérico à direita, tabular-nums, unidades em coluna própria.
- Sem motion não pedido pelo utilizador. Motion só para mostrar o que mudou.
- Português europeu em toda a interface.
- Sem dependências novas sem aprovação explícita.

## Direção
- Banda