---
name: MedicManager — Clínica Alfavida
description: Sistema de gestão clínica em vidro sobre verde — base neutra, um só ponto de energia, controlos que recuam para os dados falarem.
colors:
  accent: "#32b989"
  accent-strong: "#1e8460"
  accent-soft: "rgba(50, 185, 137, 0.10)"
  accent-2: "#8b7cf6"
  danger: "#c53030"
  surface: "#ffffff"
  surface-2: "#fafbfc"
  surface-3: "#f7f8fc"
  page-bg: "#f7f8fc"
  border: "#f0f1f5"
  border-soft: "#f3f4f6"
  border-strong: "#e2e8f0"
  text: "#1a202c"
  text-2: "#2d3748"
  text-3: "#4a5568"
  text-muted: "#67758b"
  text-faint: "#68738a"
  text-disabled: "#d1d5db"
  chip-info: "#2b6cb0"
  chip-ok: "#276749"
  chip-warn: "#a8491b"
  chip-purple: "#553c9a"
  st-info: "#3182ce"
  st-info-text: "#2b6cb0"
  st-info-tint: "rgba(49, 130, 206, 0.10)"
  st-ok: "#1e8460"
  st-ok-text: "#276749"
  st-ok-tint: "rgba(50, 185, 137, 0.10)"
  st-warn: "#dd6b20"
  st-warn-text: "#a8491b"
  st-warn-tint: "rgba(221, 107, 32, 0.10)"
  st-danger: "#e53e3e"
  st-danger-text: "#c53030"
  st-danger-tint: "rgba(229, 62, 62, 0.10)"
  st-purple: "#805ad5"
  st-purple-text: "#553c9a"
  st-purple-tint: "rgba(128, 90, 213, 0.10)"
  st-teal: "#0d9488"
  st-teal-text: "#2c7a7b"
  st-teal-tint: "rgba(13, 148, 136, 0.10)"
  nav-active-bg: "#1e8460"
  nav-active-fg: "#ffffff"
typography:
  display:
    fontFamily: "Inter Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.3px"
  heading:
    fontFamily: "Inter Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.2px"
  title:
    fontFamily: "Inter Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Inter Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.6px"
  overline:
    fontFamily: "Inter Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "1.2px"
rounded:
  sm: "8px"
  control: "12px"
  panel: "14px"
  card: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.pill}"
    width: "36px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
  input:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "42px"
  input-search:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.card}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-3}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.nav-active-bg}"
    textColor: "{colors.nav-active-fg}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: "40px"
  table-header-cell:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-3}"
    typography: "{typography.label}"
    padding: "12px 16px"
  table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    typography: "{typography.body}"
    padding: "12px 16px"
  chip-status:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.chip-ok}"
    typography: "{typography.overline}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: MedicManager — Clínica Alfavida

## Overview

**Creative North Star: "Vidro sobre Verde"**

O sistema é uma base neutra atravessada por um único ponto de energia. A barra lateral flutua em vidro desfocado sobre um halo verde e roxo que vive no fundo da página; tudo o resto — cartões, tabelas, campos, botões — recua para branco, cinzento e contorno de 1px. A cor de marca não pinta superfícies grandes: aparece no anel de foco, na pílula da navegação activa e no botão que confirma. É o oposto de um painel colorido; é um painel calmo com um sinal.

A atmosfera é **calma mas viva**. Calma porque o sistema é lido durante turnos inteiros, em máquinas fracas, por dez papéis diferentes que não podem hesitar sobre o que estão a ver. Viva porque o fundo respira, o vidro deixa passar o que está por trás, e a pílula verde da navegação diz sem margem para dúvida onde se está. A vivacidade está no ambiente, não nos controlos.

Os componentes são **discretos e neutros**: recuam para os dados falarem. Os raios são generosos (18px em cartões, 12px em controlos, pílula na navegação e pesquisa), mas o tratamento é contido — preenchimentos quase inexistentes, contornos subtis, sem peso visual próprio. Um botão não compete com o número que está ao lado dele. O tema escuro não é uma folha de estilos paralela: é a mesma estrutura com os tokens trocados, e a paleta escura desvia os pretos ligeiramente para o verde para pertencer ao mesmo mundo.

**Key Characteristics:**
- Base neutra quase sem cor; o verde é o único acento e aparece pouco.
- Vidro desfocado como material de assinatura, hoje na barra lateral.
- Halo radial verde-e-roxo fixo por trás da página, para o desfoque ter o que apanhar.
- Contorno de 1px como principal separador — não sombra, não faixa de cor.
- Tema claro e escuro construídos sobre o mesmo conjunto de variáveis CSS.
- Corpo a 14px com entrelinha de 1,5, e piso absoluto de 12px: legibilidade acima de densidade.
- Etiquetas em caixa alta a 12px a estruturar listas e tabelas.

## Colors

Uma base quase acromática — brancos, cinzentos-azulados e um azul-carvão para texto — atravessada por um único verde de menta e, num segundo plano, um roxo que só serve dados.

### Primary
- **Verde Menta Clínico** (`accent`): a cor da marca e do sinal. Vive no anel de foco dos campos, no botão que confirma, no ícone do selector de vista activo e no halo do fundo. Nunca preenche áreas grandes nem carrega texto branco.
- **Verde Menta Profundo** (`accent-strong`): a variante para superfícies sólidas com texto branco por cima — pílula de navegação activa no tema claro, e qualquer sólido verde que precise de contraste. Existe por necessidade de contraste, não por gosto: é a única das duas que passa AA com branco.
- **Verde Menta Velado** (`accent-soft`): tinta translúcida a 10% para fundos de estado positivo e realce de item seleccionado em listas.

### Secondary
- **Roxo Sereno** (`accent-2`): a segunda série dos gráficos e a segunda mancha do halo de fundo. Não é uma cor de interface — não pinta botões, contornos nem estados.

### Tertiary — a escala de estado

Seis famílias (`info`, `ok`, `warn`, `danger`, `purple`, `teal`), cada uma com **três degraus**, porque os três papéis têm requisitos de contraste diferentes e um só valor não serve os três:

- **`--st-{família}-text`** — texto sobre superfície. Verificado ≥4,5:1 nos dois temas.
- **`--st-{família}`** — gráfico: ícone, barra, contorno de 1px, ponto de estado. Verificado ≥3:1.
- **`--st-{família}-tint`** — fundo tingido translúcido (0,10 no claro, 0,14 no escuro).

Os `--chip-*` são o degrau de texto desta escala e continuam válidos como alias.

**Porque existe:** antes só havia o degrau de texto. As páginas resolviam os outros dois com literais — e o resultado foi o inverso do pretendido, com os valores gráficos a pintar texto. Cerca de 180 usos reprovavam AA, `#32b989` a 2,49:1 à cabeça. Os sólidos desta escala são os próprios literais que as páginas já usavam: não estavam errados, estavam no papel errado.

Os quatro tons de estado clássicos, no seu degrau de texto:
- **Azul Registo** (`chip-info`): em curso, em triagem, em consulta.
- **Verde Fechado** (`chip-ok`): concluído, pago, validado.
- **Âmbar Atenção** (`chip-warn`): consumo, stock baixo, pendente.
- **Roxo Marcador** (`chip-purple`): lote, referência, marcação auxiliar.
- **Vermelho Recusa** (`danger`): erro, anulação, terminar sessão.

### Neutral
- **Branco Superfície** (`surface`): cartões, gavetas, cabeçalho, corpo de tabela.
- **Branco Elevado** (`surface-2`): a camada meio-tom — cabeçalhos de tabela.
- **Névoa Fria** (`surface-3`) e **Fundo Névoa** (`page-bg`): campos, hover, fundo da aplicação. São o mesmo valor no tema claro e separam-se no escuro, onde o fundo passa a ser a camada mais escura de todas.
- **Contorno Ténue** (`border`), **Contorno Fantasma** (`border-soft`), **Contorno Firme** (`border-strong`): a escada de separação — `border` desenha o cartão, `border-soft` separa linhas dentro dele, `border-strong` desenha campos e é o único que se afirma.
- **Carvão Azulado** (`text`) → **Cinzento Ardósia** (`text-2`) → (`text-3`) → (`text-muted`) → **Cinzento Legível** (`text-faint`) → (`text-disabled`): seis degraus de texto, do título ao desactivado.

### Named Rules

**A Regra dos Dois Verdes.** O verde da marca (`accent`) nunca carrega texto branco: dá 2,5:1 e reprova AA. Sólidos verdes com texto branco usam sempre `accent-strong` (4,6:1). Esta separação não é estilística — é a razão de o segundo verde existir.

**A Regra do Verde Escasso.** O acento ocupa no máximo ~10% de qualquer ecrã: foco, estado activo, acção primária. A sua raridade é o que o torna legível como sinal. Um ecrã onde o verde apareça em cinco sítios perdeu a regra.

**A Regra do Token Único.** Nenhuma cor entra num ficheiro `.vue` como literal. Toda a cor vem de uma variável CSS, porque o tema escuro é uma troca de valores — um hex fixo numa página é um ecrã que deixa de ter tema escuro.

## Typography

**Family:** Inter Variable, auto-hospedada via `@fontsource-variable/inter` e carregada no arranque (`src/boot/theme.js`). Uma só família para tudo — sem par display/corpo, sem monoespaçada.

**Character:** neutra e funcional por escolha, não por defeito: a hierarquia vem do peso, do tamanho e da caixa, nunca do contraste entre duas famílias. Numa interface com dez papéis e sessenta domínios, uma segunda voz tipográfica seria ruído.

### Hierarchy

Seis degraus, todos tokens (`--fs-*`), sem meios-pixels e com **piso absoluto de 12px**:

- **Display** (700, 24px, `--fs-display`): números de destaque.
- **Heading** (700, 20px, `--fs-heading`, -0.2px): título de página.
- **Section** (600, 18px, `--fs-section`): subtítulos de página.
- **Title** (600, 16px, `--fs-title`): nomes em cartões, títulos de secção dentro de painéis.
- **Body** (500, 14px, `--fs-body`): o tamanho de trabalho — células de tabela, navegação, campos, menus.
- **Label** (400–700, 12px, `--fs-label`): rótulos, cabeçalhos de tabela, metadados, chips, pílulas de categoria. Em caixa alta leva espaçamento de letra (0,6px a 1,2px).

**Entrelinha:** `--lh-tight` (1,3) em rótulos e títulos, `--lh-body` (1,5) em corpo e células. Antes estava declarada em 4% das regras com `font-size`; o resto herdava o que o Quasar desse.

### Named Rules

**A Regra da Caixa Alta Curta.** Caixa alta só existe a 10px e 11px, e sempre com espaçamento de letra (1,2px e 0,6px). Nunca em corpo, nunca em títulos, nunca em botões — o `text-transform: none` global nos botões é deliberado e não se reverte.

**A Regra do Piso de Doze.** Nada abaixo de 12px, em lado nenhum. O corpo é 14px. Um ecrã que precise de descer abaixo disso para caber está a pedir menos colunas, não menos tamanho — e num sistema onde se lê uma dose, texto pequeno é risco clínico, não densidade.

**A Regra do Tamanho em Token.** Nenhum `font-size` em px literal. Seis degraus cobrem tudo; um sétimo valor é sedimento, como os 16 tamanhos entre 9px e 20px que existiam antes.

## Layout

O invólucro é fixo e o conteúdo é que corre: barra de topo de 64px (`--header-h`) e barra lateral colapsável ao lado dela (Quasar `view="Lhh"`), com o conteúdo em `calc(100vh - var(--header-h))` e o seu próprio scroll. A página nunca cresce além do ecrã — a janela não faz scroll, o painel de conteúdo faz.

O ritmo de espaçamento é 4/8/12/16/20/28. O padding padrão do conteúdo é 16px; páginas de dados abrem para 20px nas margens do cabeçalho e da tabela; cartões de formulário respiram a 28px. Os intervalos entre elementos ficam entre 8px e 14px.

Dois modelos de página dominam:
- **Página de dados:** cabeçalho com título, subtítulo e acções → barra de filtros → tabela em contentor arredondado com scroll horizontal próprio (`overflow-x: auto`). Quando há vista de grelha, é `repeat(auto-fill, minmax(180px, 1fr))` com 14px de intervalo.
- **Página de formulário:** coluna centrada de 680px no máximo, num cartão único, com grelha interna de duas colunas (`1fr 1fr`, 16px) e acções alinhadas à direita sobre um contorno superior.

A barra lateral tem modo mini: os cabeçalhos de grupo dão lugar a um traço de 1px e os itens centram-se em 44px de altura.

**Comportamento responsivo:** o sistema apoia-se nos breakpoints do Quasar e quase não declara os seus próprios — só há uma consulta de média própria (900px). Densidade e scroll horizontal fazem o trabalho que noutros sistemas seria feito por reflow. *Isto é observação, não prescrição: a cobertura responsiva é o ponto mais fino do sistema actual.*

### Named Rules

**A Regra dos 64px.** Qualquer contentor de altura total desconta `var(--header-h)`. `100vh` cru põe a página 64px mais alta que o ecrã, faz aparecer scroll na janela e deixa o cabeçalho deslizar sobre o conteúdo.

## Elevation & Depth

*Registado como estado actual, não como doutrina — o dono do produto marcou esta camada como por decidir.*

Hoje o sistema é híbrido. No tema claro a profundidade vem de sombras ambientes muito suaves: cartões a `0 2px 10px` sobre 7% de preto, barras e cartões de formulário a `0 1px 4px` sobre 4%, e sombras maiores apenas em camadas flutuantes — menus a `0 12px 32px`, notificações a `0 8px 24px`, popups de selecção a `0 10px 30px`. No tema escuro as superfícies separam-se sobretudo por luminância (fundo `#0d1211` → cartão `#151b19` → elevado `#1a221f` → campo `#202a26`), com uma sombra residual e um realce interior de 3% no topo do cartão.

Há dois brilhos coloridos, ambos ligados ao acento: a pílula de navegação activa projecta `0 4px 14px` do verde a 30%, e o anel de foco é `0 0 0 3px` do verde a 18% (25% no escuro).

**Em aberto:** se a direcção é reduzir ainda mais a sombra no tema claro — superfícies planas por omissão, sombra só como resposta a estado — essa decisão ainda não foi tomada. Até lá, seguir os valores acima em vez de inventar novos.

## Shapes

Cinco raios, e só cinco: **8px** (`--r-sm`) em elementos pequenos — botões densos, pílulas de categoria, células destacadas; **12px** em controlos (botões, campos, inputs nativos); **14px** em painéis e menus; **18px** em cartões, diálogos e contentores de tabela; e **pílula** (999px) na navegação, na pesquisa, em chips e em botões de ícone redondos.

`--r-sm` foi acrescentado depois de o código o desmentir: 8px era o raio mais usado da aplicação (159 ocorrências nas páginas, mais do que qualquer outro) sem nunca ter sido token. Os 6px, 7px e 10px avulsos resolvem-se todos nele, e o 20px dos chips era pílula na prática — todos os elementos que o usavam tinham 16–22px de altura.

A separação é feita por contorno de 1px, não por sombra nem por mudança de fundo. É o mesmo gesto em toda a aplicação: cartão com `border`, linhas internas com `border-soft`, campos com `border-strong`. Os campos abandonam o traço inferior do Material (`.q-field__control::before/::after` desligados) — a caixa fechada substitui-o por completo.

O material de assinatura é o **vidro**: `backdrop-filter: blur(18px) saturate(150%)` sobre um fundo a 72% de opacidade, atrás do qual vive um halo radial fixo de verde a 18% e roxo a 14%. Está aplicado à barra lateral.

### Named Rules

**A Regra dos Cinco Raios.** Nenhum sexto valor de raio. Um `border-radius` em px literal numa página é drift, não decisão — resolve-se para o token mais próximo. As páginas estão a zero literais: 8px, 12px, 14px, 18px e pílula cobrem tudo.

**A Regra do Vidro Deliberado.** O vidro é vocabulário do sistema e pode sair da barra lateral — cabeçalhos fixos e diálogos são candidatos legítimos. O que não pode é alastrar por omissão: cada uso é uma decisão individual, aplicada a um elemento, com o halo por trás a justificá-lo. Uma tentativa anterior espalhou-o por dezenas de contentores e teve de ser revertida.

## Components

Carácter transversal: **discretos e neutros**. Nenhum controlo tem peso visual próprio; a hierarquia é feita pelos dados.

### Buttons
- **Forma:** cantos suaves (12px, `--r-control`); variantes redonda e arredondada passam a pílula. Sem caixa alta, sem espaçamento de letra, peso 600.
- **Primário:** verde de marca sólido com texto branco, sem elevação (`unelevated`). *Nota: por causa d'A Regra dos Dois Verdes, o sólido devia usar `accent-strong`; hoje usa `accent` via a paleta do Quasar.*
- **Fantasma / ícone:** 36px quadrados em pílula, transparentes, ícone em `text-muted`; ao passar o rato ganham `surface-3` e o ícone sobe para `text-2`. É a variante dominante na barra de topo e nas acções de linha.
- **Terminar sessão:** botão de largura total em pílula, contorno `border`, texto `text-muted`; ao passar o rato tinge-se de vermelho a 10% com contorno a 35%.
- **Transição:** 0,15–0,18s em `ease` sobre fundo, cor e contorno.

### Inputs / Fields
- **Estilo:** preenchimento `surface-3`, contorno `border-strong` de 1px, raio 12px, altura mínima 42px. O mesmo aspecto para `outlined`, `filled`, `standout` e `borderless` — a variante do Quasar não altera o desenho.
- **Foco:** contorno passa a verde de marca e ganha anel de 3px a 18%. É o momento de cor mais forte de um formulário.
- **Erro:** contorno vermelho com anel vermelho a 16%.
- **Pesquisa:** mesma caixa em pílula com 14–16px de padding horizontal.

### Tables
Dois modos com o mesmo aspecto: `q-table` do Quasar e tabelas construídas à mão (`.tbl`, `.prod-table`, `.inv-table`).
- **Contentor:** raio 18px, contorno `border`, sem sombra, `overflow: hidden`.
- **Cabeçalho:** `surface-2`, caixa alta a 11px/700 com 0,6px de espaçamento, cor `text-3`.
- **Linhas:** células a 13px, separadas por `border-soft`, última sem contorno; realce a `surface-3` ao passar o rato, em 0,14s.
- **Alinhamento:** quantidades à direita, estado ao centro, nomes à esquerda com truncagem por reticências.

### Cards / Containers
- **Cartão de dados:** raio 14px, contorno `border`, sobe 2px e ganha `0 8px 28px` ao passar o rato. Avatar circular de 54px com gradiente verde no topo, nome a 13px/600, subtítulo a 12px em `text-faint`, e uma barra de acções separada por `border-soft`.
- **Cartão genérico (`q-card`):** raio 18px, contorno `border`, sombra ambiente suave.

### Navigation
- **Itens:** pílula de 40px, texto 13px/500 em `text-3`, ícone 19px em `text-faint`. Ao passar o rato ganham fundo `surface-3` e o ícone desloca-se 1px para a direita.
- **Activo:** pílula sólida em `accent-strong` (verde de marca no tema escuro), texto branco a peso 600, com brilho verde por baixo. O ícone não se desloca — o item activo está imóvel.
- **Estrutura:** grupos com etiqueta em caixa alta de 10px seguida de uma linha decorativa que ocupa o espaço restante.
- **Modo mini:** ícones centrados a 44px; as etiquetas de grupo tornam-se um traço de 1px.

### Chips / Status
Pílulas de 10px em caixa alta sobre tinta translúcida da própria cor a 10–14%, com o texto no tom escuro correspondente (`chip-*`). Nunca preenchimento sólido — é o que permite ao mesmo chip funcionar nos dois temas.

### Notifications
Cartão de 300–380px, raio 12px, sombra `0 8px 24px`, mensagem a 13px/600 e barra de progresso de 3px na cor do estado.

## Do's and Don'ts

### Do:
- **Do** ler toda a cor, raio e altura de cabeçalho das variáveis CSS de `app.scss`. São o contrato entre os dois temas.
- **Do** escolher o degrau certo da escala de estado pelo papel, não pela cor: `-text` para texto, o nome cru para ícones e contornos, `-tint` para fundos. Usar o degrau gráfico em texto é como os ~180 casos de AA reprovada apareceram.
- **Do** usar `--accent-strong` (`#1e8460`) sempre que houver texto branco sobre verde sólido, e `--accent` (`#32b989`) apenas para contornos, anéis, ícones e tintas translúcidas.
- **Do** separar com contorno de 1px antes de considerar sombra.
- **Do** descontar `var(--header-h)` em qualquer contentor de altura total.
- **Do** manter a caixa alta confinada a 10px e 11px, sempre com espaçamento de letra.
- **Do** dar `overflow-x: auto` próprio a cada tabela larga, em vez de deixar a página fazer scroll horizontal.

### Don't:
- **Don't** usar barra de acento lateral (`border-left: 3–4px solid`) para marcar estado num cartão ou linha. É o padrão mais reconhecível de interface gerada por IA. As 15 ocorrências que existiam (12 laterais e 3 superiores) foram removidas no passe de polish de 2026-09-10; o código está a zero e assim deve ficar. Estado marca-se com chip, com o contorno inteiro a 1px, ou com a própria cor do texto.
- **Don't** escrever hex literais em ficheiros `.vue`. As páginas passaram de 720 literais de cor para 211 no passe de extract de 2026-09-10; o que resta são gradientes, fundos sólidos que carregam texto, e a paleta categórica de `AreasPage`. Nenhum caso novo se justifica.
- **Don't** pintar fundos de linha com literais claros — `.row-low { background: #fffbeb !important }` e `.row-zero { background: #fff5f5 !important }` produzem faixas quase brancas sobre o tema escuro. Estado de linha usa tinta translúcida da cor de estado.
- **Don't** introduzir um sexto raio, nem escrever px literal em `border-radius`.
- **Don't** alargar o vidro a mais do que um elemento de cada vez, e nunca sem o halo por trás — sem ele, o desfoque não tem o que apanhar e a barra lê-se como uma laje suja.
- **Don't** carregar uma segunda família tipográfica. Uma voz chega.
- **Don't** aumentar a sombra no tema escuro para simular elevação. As superfícies escuras separam-se por luminância.
