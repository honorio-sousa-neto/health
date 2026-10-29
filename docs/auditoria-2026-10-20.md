# Revisão técnica e de segurança — 20/10/2026

Este documento regista o diagnóstico inicial. As correcções posteriores e a validação estão em [correccoes-seguranca-2026-10-20.md](correccoes-seguranca-2026-10-20.md).

## Âmbito e limites

Revisão do código local de `back/` e `front/`, do modelo Prisma, da configuração de execução e da documentação de produto. Foram seguidos os caminhos de autenticação, utilizadores, relatórios, uploads, notificações, facturação e stock. Não foram feitos pedidos a produção, alterações na base de dados ou testes destrutivos. Não foi feita uma auditoria exaustiva de todos os módulos, da infraestrutura ou das dependências contra bases de vulnerabilidades. As conclusões sobre exposição externa dependem de o serviço estar acessível e da configuração efectivamente instalada.

Existiam alterações prévias em `back/src/controllers/stock/index.ts` e `front/src/pages/inventario/TransferenciasPage.vue`, além de alterações na raiz. Foram preservadas. Nenhum código da aplicação foi alterado nesta revisão.

## O que o sistema faz

MedicManager é o sistema interno da Clínica Alfavida. Integra recepção e atendimento de pacientes, triagem, consultas, prescrição, exames, imagiologia, enfermagem, internamento e cirurgia com documentos de facturação, caixa, tesouraria, compras e inventário por localização e lote. Existem papéis clínicos, administrativos, financeiros e de inventário.

Frontend: Vue 3, Quasar, Pinia e Axios. Backend: Express com TypeScript, Prisma e PostgreSQL. Socket.IO actualiza filas e notificações. PDFMake e ExcelJS produzem documentos e mapas. Existe configuração Electron e configuração MongoDB antiga, embora o modelo relacional seja o caminho actual.

Há escolhas úteis: passwords com bcrypt, validação Zod em vários módulos, serviço central de stock e transacções em operações de inventário. A principal fragilidade é a aplicação incompleta dessas garantias nos limites entre módulos.

## Achados prioritários

### 1. Crítico — chave JWT fixa permite fabricar sessões

Evidência: `back/src/controllers/auth/login.ts:8` assina tokens com uma string fixa. `back/src/middlewares/token.ts:18` valida contra `JWT_SECRET`. A comparação local confirmou que a configuração contém a mesma chave, sem imprimir o seu valor. O middleware verifica apenas a assinatura e não confirma a existência ou o estado do utilizador.

Validação isolada: um token fabricado para um email fictício foi aceite pelo middleware com a configuração local carregada. Nenhum token foi enviado à API ou gravado em disco. Em instalações com outra chave, o login actual gera tokens incompatíveis, o que também é defeito de configuração.

Correcção: centralizar assinatura e validação, substituir a chave por segredo aleatório gerido no ambiente, invalidar sessões antigas, usar `sub` com ID único e verificar conta activa. Não reproduzir a chave antiga em documentação ou exemplos.

### 2. Crítico — gestão de utilizadores sem autorização por papel

Evidência: `back/src/routers/index.ts:57` exige apenas token em `/users`. `back/src/routers/user/index.ts` permite criar e actualizar utilizadores. `back/src/validator/user.validator.ts` aceita `role: admin` tanto na criação como na actualização. Não existe verificação administrativa neste percurso.

Impacto: uma conta com papel restrito pode criar uma conta administrativa ou alterar papéis. O problema afecta também a separação entre áreas clínicas, financeiras e inventário, cujas rotas em geral usam apenas o mesmo middleware de token. Esconder opções no menu não protege a API.

Correcção: matriz explícita de permissões no servidor, negação por omissão e verificações por operação e recurso. Reservar gestão de utilizadores a administradores. Testar que cada papel recebe 403 nas operações que lhe são vedadas.

### 3. Alto — relatórios e balanços sem autenticação

Evidência: `back/src/routers/index.ts:104-106` monta `/balances`, `/reports` e `/uploads` sem middleware. `back/src/routers/report/index.ts` disponibiliza documentos por ID e mapas mensais Excel; `back/src/routers/balance/index.ts` devolve balanços e relatórios.

Impacto: leitura de informação financeira sem sessão; documentos por ID podem revelar dados associados a clientes se o ID for conhecido. IDs difíceis de adivinhar não substituem autorização.

Correcção: autenticar e autorizar todos estes caminhos. Adaptar o frontend para obter ficheiros através de pedidos autenticados e blobs ou de ligações temporárias com âmbito restrito.

### 4. Alto — upload anónimo, sem limites, com ficheiros públicos

Evidência: `back/src/routers/upload/index.ts:5` aceita ficheiros e actualiza `purchase.invoice` pelo ID recebido. `back/src/config/multer.ts:15` não configura limite de tamanho nem filtro de tipo; a extensão deriva do MIME informado pelo cliente. `back/src/index.ts:24` serve a pasta de uploads publicamente.

Impacto: alteração do comprovativo de uma compra por quem conhece o ID, consumo de disco e acesso directo a comprovativos. Conteúdo activo também pode ser servido, dependendo do tipo enviado e da forma de abertura.

Correcção: autorização sobre a compra, limites de tamanho e quota, validação do conteúdo real, nomes aleatórios, armazenamento privado e download autenticado. Limpar ficheiros quando a actualização falhar e ao substituir comprovativos.

### 5. Alto — Socket.IO expõe dados clínicos sem sessão

Evidência: `back/src/index.ts:15-37` não autentica a ligação e aceita o papel escolhido pelo cliente em `join:role`. `back/src/controllers/screening/index.ts:165-176` inclui o paciente e emite `screening:create` globalmente. Existem outras emissões globais de triagem e consulta.

Impacto: um cliente ligado ao socket pode receber dados clínicos sem autenticação; escolher `admin` permite entrar nas salas de notificações de todos os sectores definidos. Autenticar apenas as rotas HTTP não resolve este canal.

Correcção: middleware de autenticação no handshake, papel obtido da conta no servidor, salas autorizadas e payloads mínimos. Substituir emissões globais de dados clínicos por destinatários autorizados.

### 6. Alto — respostas da API incluem hashes de passwords

Evidência: `back/src/repositories/user/index.ts` usa consultas Prisma sem projecção de campos. `back/src/controllers/user/index.ts` devolve directamente os objectos em listagem, detalhe, criação e actualização. O modelo `User` contém `password`. O login remove esse campo, mas os restantes caminhos não o fazem.

Impacto: utilizadores autenticados podem obter hashes bcrypt de outras contas e tentar descobrir passwords fora do sistema.

Correcção: projecção explícita dos campos públicos no repositório e DTOs de resposta. Adicionar uma verificação que rejeite respostas contendo `password` em qualquer operação de utilizadores.

### 7. Alto — factura, caixa e stock não formam uma operação atómica

Evidência: `back/src/controllers/invoice/invoice.ts:240-329` grava a factura, depois movimentos de caixa e, mais tarde, abre uma transacção apenas para as saídas de stock.

Impacto: se uma etapa posterior falhar, etapas anteriores permanecem gravadas apesar da resposta de erro. Uma repetição pode duplicar documentos ou movimentos. Na criação de FR, o caminho de caixa contém ainda uma segunda entrada para o primeiro serviço com nome contendo `internamento`, mesmo quando a primeira entrada já ocorreu; verificar este cenário com os dados reais.

Correcção: uma transacção para documento, itens, caixa e stock; chave de idempotência por operação; notificações apenas após confirmação. Testar falhas injectadas entre as etapas e repetições do mesmo pedido.

### 8. Alto — valores de facturação e autoria controlados pelo pedido

Evidência: `back/src/routers/invoice/invoice.ts` passa `req.body` directamente ao controlador. O caminho de criação não executa o schema Zod. `back/src/controllers/invoice/utils.ts:3-8` calcula com preço, desconto e quantidade recebidos. `back/src/controllers/invoice/invoice.ts:262` usa o `userId` fornecido pelo cliente.

Validação isolada: quantidade -2 e preço 100 produziram total -200. Isto confirma ausência de defesa na função de cálculo; a persistência desta combinação não foi testada.

Impacto: valores inválidos ou preços manipulados podem chegar à gravação e a autoria pode ser atribuída a outro utilizador. O schema existente também não impõe limites positivos nesses campos.

Correcção: validar no início da operação, obter autoria da sessão, resolver preços e descontos autorizados no servidor e conferir totais. Definir regras distintas para documentos de correcção e devoluções.

### 9. Alto — stock vulnerável a concorrência e consumo de lotes expirados

Evidência: `back/src/services/stock/stock-service.ts:205-247` lê saldo e lotes antes de os decrementar, sem condição de saldo na escrita. As transacções inspeccionadas em `back/src/controllers/stock/index.ts` não definem isolamento serializável ou bloqueio explícito. O filtro de lotes exige quantidade positiva, mas não exclui validade expirada. Na venda por factura, `stockExit` é chamado sem `enforceAvailability`.

Impacto: pedidos simultâneos podem aprovar o mesmo saldo e tornar lotes negativos; uma venda pode registar saída superior ao disponível. FEFO, por si só, também selecciona primeiro lotes já expirados. Os cenários de concorrência não foram executados contra a base de dados.

Correcção: bloqueio por produto/localização ou isolamento serializável com repetição controlada, decremento condicional e invariantes na base de dados. Excluir lotes expirados da dispensa normal e conservar caminhos próprios para abate.

### 10. Médio — auditoria de autoria inconsistente

Evidência: `back/src/middlewares/token.ts:26` preenche `req.user`, enquanto as operações de stock em `back/src/routers/stock/index.ts` lêem `req.userId`, que não é preenchido neste percurso. O JWT contém email opcional; `User.email` não é único no schema e o módulo de notificações resolve identidade com `findFirst({ email })`.

Impacto: movimentos podem ficar sem autor; emails partilhados podem resolver a conta errada no módulo de notificações. Contas com `deletedAt` também não são recusadas no login inspeccionado.

Correcção: identidade única por `sub`, carregamento centralizado da conta activa e contexto autenticado tipado utilizado em todas as operações. Registar autor, instante, recurso e alterações sem copiar dados clínicos desnecessários para logs.

## Outras melhorias

- Dinheiro: preços, totais e valores financeiros usam `Float` no schema. Migrar de forma controlada para decimal com precisão definida ou unidades mínimas inteiras e uma política de arredondamento comum.
- Numeração: `back/src/controllers/invoice/utils.ts:22` usa contagem + 1 para referências; pedidos concorrentes podem obter o mesmo número. Usar contador transaccional por série/tipo e restrição única apropriada. Os campos chamados hashes são strings geradas por `Math.random`; não fornecem prova de integridade. Confirmar o requisito funcional antes de substituir o mecanismo.
- Login: respostas distintas permitem distinguir utilizador inexistente de password errada, e não há limitação de tentativas no caminho inspeccionado. Uniformizar respostas e aplicar controlo de abuso.
- Paginação: limitar `perPage`, corrigir cálculos de `skip` como os de utilizadores e facturas — actualmente `page - 1`, quando seria `(page - 1) * perPage` — e evitar listagens ilimitadas por omissão.
- Rede: URL da API está fixa em `front/src/boot/axios.js`. Centralizar configuração e assegurar HTTPS na instalação real. CORS está aberto; restringir origens como defesa adicional depois de corrigir autorização.
- Execução: `back/compose.yaml` descreve MongoDB exposto sem autenticação, enquanto o modelo actual usa PostgreSQL; o Dockerfile não compila TypeScript. Actualizar estes artefactos para uma instalação reproduzível e evitar execução acidental da configuração antiga.
- Qualidade: o `test` do frontend apenas imprime que não existem testes; não há comando de testes no backend. Criar testes de integração para permissões, respostas sem passwords, transacções, concorrência e idempotência. Não confundir compilação com validação funcional.
- Dependências: inventariar versões efectivamente resolvidas, executar auditoria de dependências e escolher um único lockfile no backend. Não foi atribuída nenhuma CVE nesta revisão.
- Operação: verificar backups com ensaios de restauro, retenção de dados clínicos, permissões de base de dados e terminação TLS na infraestrutura; não há evidência suficiente nesta revisão para afirmar que estes controlos existem ou faltam em produção.
- Frontend: o levantamento de código morto e duplicações em `PRODUCT.md` merece validação e remoção incremental. Priorizar erros visíveis, preservação de formulários e confirmação de operações após reconexão. A idempotência tem de existir no servidor antes de introduzir repetição automática de escritas.

## Ordem de execução sugerida

1. Trocar a chave JWT e revogar sessões; proteger gestão de utilizadores, relatórios, uploads e Socket.IO; retirar passwords das respostas.
2. Unificar identidade e autorização, validar pedidos financeiros e corrigir autoria.
3. Tornar facturação/caixa/stock atómicos e idempotentes; proteger concorrência e validade dos lotes.
4. Corrigir valores monetários, numeração, configuração de instalação, observabilidade e cobertura de testes.

Critérios de aceitação prioritários: cliente anónimo recebe 401 em recursos sensíveis; conta sem permissão recebe 403; socket anónimo é recusado; nenhuma resposta expõe password; falhas de escrita não deixam operações parciais; dois pedidos concorrentes não consomem o mesmo saldo; repetir um pedido não duplica documento ou caixa.

## Verificações realizadas

- Compilação do backend: `./node_modules/.bin/tsc --noEmit --project tsconfig.json` terminou com código 0.
- Comparação booleana entre chave fixa e configuração local: coincide; nenhum segredo foi impresso pela comparação.
- Execução isolada do middleware com token fabricado e configuração local: aceite, incluindo email inexistente.
- Execução isolada de `calculateAmountItems` com quantidade negativa: devolveu -200.
- Restantes achados: análise dos caminhos de código indicados; sem exploração em produção ou alterações na base de dados.

Referências para os controlos propostos: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) e [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html). Estas referências apoiam as recomendações; as evidências dos problemas são os ficheiros locais identificados acima.
