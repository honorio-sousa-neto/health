# Correcções de segurança — 20/10/2026

As alterações estão nos repositórios locais `back/` e `front/`. Não foi feito deploy nem alterada a base de dados da clínica. As alterações que já existiam no controlador de stock e no ecrã de transferências foram preservadas.

## Correcções implementadas

| Achado da auditoria | Alteração |
|---|---|
| Chave JWT exposta | Assinatura centralizada, chave antiga recusada, chave local substituída, HS256/issuer/audience explícitos e identidade por `sub`. |
| Falta de autorização | Middleware central com permissões por módulo, operação e papel; gestão de utilizadores reservada a administradores; rotas desconhecidas negadas por omissão para outros papéis. |
| Contas desactivadas e identidade por email | Conta activa consultada por ID em cada pedido; notificações usam a mesma identidade; movimentos recebem `req.userId` do servidor. |
| Relatórios públicos | Balanços, relatórios e comprovativos exigem sessão e papel autorizado. Impressão e exportação no frontend passam por Axios autenticado e blobs. |
| Uploads anónimos e ilimitados | Acesso administrativo/inventário, limite de 10 MB, uma entrada de ficheiro por pedido, verificação de assinatura PDF/PNG/JPEG e armazenamento privado com nomes UUID. |
| Alteração de compras pelo upload | Compra validada antes de guardar; ficheiro novo eliminado se a actualização falhar. Download apenas de nomes associados a uma compra e com autorização. |
| Socket.IO sem sessão | Autenticação no handshake, salas atribuídas pelo servidor, papel enviado pelo cliente ignorado, expiração de ligação e revalidação periódica da conta. Dados clínicos deixam de ser emitidos globalmente. |
| Hashes de passwords nas respostas | DTOs de utilizador sem password e filtragem adicional das respostas JSON e dos eventos clínicos, incluindo relações Prisma aninhadas. |
| XSS nas notificações | Texto de notificações mostrado sem interpretação HTML. |
| Operações financeiras parciais | Documento, itens, caixa, regularização do documento de origem e saídas de stock na mesma transacção PostgreSQL. Corrigida a duplicação de caixa no caso de internamento. |
| Repetição de pedidos | `Idempotency-Key` gerada no cliente e preservada durante tentativas; identidade determinística no ID da factura e digest do pedido; repetir a chave com outro conteúdo é recusado. |
| Concorrência na numeração | Bloqueio transaccional para emissão e escolha da referência; não depende apenas de uma contagem concorrente. |
| Valores inválidos e autoria forjada | Zod no limite de emissão, quantidades inteiras positivas, valores finitos, descontos limitados e autoria obtida da sessão. Totais são recalculados com aritmética decimal. |
| Preços manipulados | Recepção deve respeitar preços/descontos resolvidos no servidor; alterações de preço são reservadas a administradores e financeiros. Benefícios são conferidos contra o paciente; recibos herdam os dados do documento de origem. |
| Edição directa de documentos | PATCH de factura recusado; recebimentos e correcções usam documentos associados. |
| Concorrência de stock | Bloqueio da linha do produto até ao fim da transacção e decrementos de lote condicionados ao saldo. Todas as saídas verificam disponibilidade. |
| Dispensa de lotes expirados | Validade verificada no fuso de Angola; lotes expirados não podem ser consumidos como remanescente sem lote. O abate explícito continua permitido. |
| Falhas assíncronas Express 4 | Router comum encaminha rejeições dos handlers assíncronos para o tratamento de erros. Erros Zod e de tamanho de upload dão respostas controladas. |
| Tentativas de login | Limitação de tentativas por IP, respostas uniformes e comparação bcrypt também quando a conta não existe. Logins bem sucedidos não esgotam o limite. |
| Configuração insegura antiga | Docker passa a PostgreSQL e Node 22, processo sem privilégios root, armazenamento privado persistente e porta HTTP apenas em loopback. CORS usa origens explícitas. |

`hash64` passa a conter o digest canónico do pedido de emissão para detectar reutilização de uma chave com dados diferentes; não é apresentado como assinatura fiscal. Não foi alterado o rodapé de certificação dos documentos.

## Dependências

Foram actualizados Express, Multer, bcrypt, Mongoose, Socket.IO, Axios e dependências transitivas, além de Vue e Quasar dentro das versões compatíveis. O observador nodemon foi substituído por `node --watch`. As correcções transitivas de ExcelJS usam `uuid` compatível com CommonJS; a exportação/importação de um workbook foi verificada.

A auditoria npm **completa**, incluindo dependências de desenvolvimento, terminou com **zero avisos no backend, no frontend e no pacote Electron**. Isto é o resultado do registo consultado nesta data, não uma garantia de ausência de vulnerabilidades.

O backend passa a usar um único lockfile npm; o lockfile Yarn antigo foi removido para impedir a reinstalação das versões transitivas vulneráveis. O frontend foi migrado para Quasar CLI 3.10.3, Vite 8.3.4, Vue Router 5.4 e Pinia 3. A configuração e os wrappers usam as APIs actuais, os aliases existentes foram conservados e as dependências Electron passaram para `front/src-electron/`. O empacotador foi substituído por `@electron/packager` 20.3. O frontend requer Node 22.22+ ou as versões pares posteriores declaradas em `package.json`.

## Validação

- Backend: TypeScript compilado sem emissão de ficheiros.
- Frontend: build SPA concluído depois da migração; sem publicação. Permanecem avisos de tamanho de bundles e de duração de callbacks de compilação.
- 11 testes de segurança HTTP/Socket.IO: sessões falsas, contas desactivadas, acesso anónimo, escalada de privilégios, respostas sem hashes, upload inválido, valores negativos, stock expirado, idempotência e limitação de login.
- 6 testes com PostgreSQL 16 temporário e dados sintéticos: saídas simultâneas do mesmo lote, cinco emissões simultâneas com a mesma chave, rollback completo quando falta stock, referências distintas, exclusão de lotes expirados e herança segura de dados no recibo.
- 3 testes do frontend: navegação autenticada/anónima, reactividade Pinia e downloads autenticados com recusa de origens externas.
- Chrome headless com perfil temporário: ecrã de login renderizado, campo de password presente, scripts e estilos carregados.
- Electron: compilação de main/preload/UI e empacotamento completo para Linux x64 concluídos.
- Exportação e importação Excel verificadas após a actualização transitiva.
- `docker compose config --quiet` passou com valores sintéticos.

A base temporária de testes é independente da configuração `.env` do projecto. Os testes de integração recusam outro destino que não `127.0.0.1:55482`. Não foi realizado teste interactivo de todos os ecrãs. O empacotamento Electron para Linux x64 terminou com sucesso (`front/dist/electron/Packaged/MedicManager-linux-x64/MedicManager`). Não foi feito teste interactivo da aplicação desktop.

## Aplicação na instalação real

1. Instalar dependências com `npm ci` e recompilar os dois lados. As alterações de autenticação e emissão exigem actualizar backend e frontend em conjunto.
2. Definir uma **nova** `JWT_SECRET` aleatória em cada instalação e as origens reais em `ALLOWED_ORIGINS`. A chave antiga e os tokens antigos deixam de ser aceites; os utilizadores terão de iniciar sessão novamente. A chave local foi substituída sem ser mostrada no relatório.
3. Manter HTTPS no proxy de produção. O Docker publicado em loopback exige esse encaminhamento externo.
4. Preservar os comprovativos antigos no armazenamento privado ao trocar de contentor. O endpoint de download consegue ler ficheiros legados no processo local, mas `public/` deixa de ser servido e não é incluído na imagem.
5. Rever a matriz de permissões com a operação da clínica antes da publicação; ela restringe escritas clínicas por papel e preços personalizados à área financeira/administração.

Não foram criadas migrações de schema para estas correcções. A persistência existente de valores monetários em `Float` continua a ser dívida técnica; o novo cálculo arredonda em decimal antes da gravação. Também permanece necessária a verificação operacional de backups, restauros e configuração efectiva de HTTPS.

## Migração e auditorias concluídas

A migração maior e as auditorias completas foram explicitamente autorizadas pelo utilizador em 20/10/2026. Não existem consultas de auditoria bloqueadas. A proposta original está conservada em [proposta-migracao-seguranca-frontend.md](proposta-migracao-seguranca-frontend.md).

Fontes consultadas para as actualizações: [Multer — avisos oficiais](https://github.com/expressjs/multer/security/advisories), [bcrypt — versões oficiais](https://github.com/kelektiv/node.bcrypt.js/releases) e [Quasar — guia de migração](https://quasar.dev/quasar-cli-vite/upgrade-guide/).
