# Health — monorepo

Aplicação clínica com workspaces npm: `back/` (Express, TypeScript e Prisma),
`front/` (Vue e Quasar), `docs/` (documentação) e `docker/` (proxy Nginx).
O `package-lock.json` da raiz é a fonte única das dependências das aplicações.
O pacote Electron em `front/src-electron/` é gerido pelo Quasar e não é um serviço Docker.

## Deploy no servidor com um comando

Após actualizar o repositório, executar na raiz:

```sh
bash scripts/deploy.sh
```

O servidor precisa apenas de Bash, Docker Engine com Docker Compose v2 e `flock`
(util-linux), com acesso ao daemon Docker e à Internet para construir as imagens.
Não precisa de Node ou npm instalados. O comando também pode ser executado como
`npm run deploy` em máquinas com npm.

Na primeira instalação, o comando cria `.env` com segredos aleatórios, configura
PostgreSQL, aplica as migrações e prepara os catálogos e um único administrador.
As credenciais ficam em `private/deploy/health/initial-admin.txt`, com acesso
restrito. Alterar a palavra-passe após o primeiro acesso. Se já existirem
utilizadores, a preparação inicial é ignorada, preservando utilizadores e catálogos.

Por omissão, uma instalação nova publica a porta 8080 em todas as interfaces.
Para definir o domínio e a porta no primeiro deploy:

```sh
APP_URL=https://clinica.exemplo WEB_PORT=8081 bash scripts/deploy.sh
```

O HTTPS é terminado pelo proxy do servidor, encaminhando para essa porta.
`APP_URL` configura a origem permitida; não configura DNS nem emite certificados.
Sem domínio, usar o endereço HTTP do servidor em `APP_URL`. Para publicar apenas
localmente atrás de um proxy, acrescentar `WEB_BIND=127.0.0.1` ao primeiro comando.
Nas execuções seguintes, `.env` é preservado: alterar esse ficheiro para mudar
porta, endereço ou origens. Nesta máquina, a configuração existente usa 8081.
Guardar `.env` fora do repositório: os segredos não são regenerados nas actualizações.

Cada deploy constrói as imagens antes de interromper o serviço, suspende a API e
o frontend, cria um backup da base e dos uploads em
`private/backups/deploy/health/<data>/`, executa migrações e verifica a saúde dos
serviços, a página inicial, o proxy da API e os sockets. Existe uma interrupção
breve durante o backup e a actualização. Os backups permanecem no servidor;
copiá-los para armazenamento externo e gerir a sua retenção.

Se o build falhar, os serviços existentes continuam a funcionar. Se o backup
falhar, o comando tenta reactivar os containers anteriores. Se as migrações
falharem, a aplicação permanece parada e o comando termina com erro; consultar
`docker compose logs --tail=100 migrate api web` e resolver a migração antes de
repetir o mesmo comando. Não existe rollback automático da base de dados.
O deploy não elimina volumes nem executa seeds sobre instalações existentes.
Uma segunda execução repete o processo e mantém os mesmos dados e segredos.
O antigo comando de deploy do backend também encaminha para este fluxo único.

Um servidor novo começa com uma base nova. Para levar os dados actuais da
`alfavida` para outro servidor, é necessário transferir e restaurar o backup da
base e dos uploads uma vez; os dados clínicos não são incluídos no Git ou nas imagens.

Os testes de orquestração do deploy correm sem Docker ou dados reais:
`python3 -m unittest discover -s scripts/tests -v`. O fluxo foi também validado
com uma primeira instalação Docker, um segundo deploy que preservou dados,
segredos e uploads, e restauração dos backups numa base temporária.

## Desenvolvimento local

Requisitos: Node 22.22+ ou 24 e npm 11.

```sh
npm ci
cp back/.env.example back/.env
# Configurar DATABASE_URL e JWT_SECRET em back/.env.
npm run db:generate
npm run db:migrate
npm run dev:api
# Noutro terminal:
npm run dev:web
```

O frontend de desenvolvimento abre em http://localhost:9008 e usa a API em
http://localhost:8020/api. A variável `API_URL` permite alterar o destino no build.
`npm run build` compila as duas aplicações; `npm test` executa os testes unitários
e de segurança existentes. Os testes de integração exigem uma base isolada e
podem ser executados com `npm run test:integration --workspace=back`.

## Docker

```sh
cp .env.example .env
# Preencher POSTGRES_PASSWORD e JWT_SECRET com valores distintos:
openssl rand -hex 48
openssl rand -hex 48
npm run docker:up
```

Abrir http://localhost:8080. O Compose inicia PostgreSQL, aplica as migrações
Prisma num serviço temporário, inicia a API e serve o frontend com Nginx.
O arranque é interrompido se as migrações falharem. Foram acrescentadas duas
migrações que completam o histórico: criação de `StockLocation` antes da sua
utilização e estruturas já usadas pela aplicação (atendimento, notificações,
planos ambulatórios e movimentos de stock). Mantêm colunas e enums legados;
os sinais vitais são convertidos para texto conservando os valores. Rever estas
migrações antes de actualizar uma base existente. Os seeds são explícitos:

```sh
docker compose exec api npm run seed -- --skip-users
# Consultar opções para preparar os utilizadores da instalação:
docker compose exec api npm run seed:list
```

Apenas o frontend publica uma porta, por omissão em `127.0.0.1:8080`.
Para acesso na rede, definir `WEB_BIND=0.0.0.0` e actualizar `ALLOWED_ORIGINS`
com a origem exacta utilizada pelos browsers. Para produção, configurar HTTPS
no proxy de entrada. Alterar `WEB_PORT` exige também actualizar a origem.
A API e os sockets passam pelo Nginx, sem endereços internos no browser.

```sh
npm run docker:logs
docker compose ps
npm run docker:down
```

Os volumes `postgres_data` e `uploads` persistem entre reinícios e `down`.
`docker compose down -v` elimina esses dados. A base Docker começa vazia;
não importa automaticamente a base local nem os ficheiros antigos.
Antes de migrar uma instalação existente, guardar a base e os uploads,
restaurá-los nos volumes e verificar o histórico Prisma (uma base sem histórico
pode exigir baseline). Os uploads ficam em `/app/back/private/uploads`.
Os dados legados de `back/database/` e os comprovativos de `back/public/`
permanecem locais e estão excluídos do Git e das imagens. O importador de
demonstração `prisma/seed.js` depende desses dados e não faz parte do arranque.
Nunca copiar `.env`, certificados ou comprovativos para as imagens.

O serviço `/healthz` da API verifica a resposta HTTP; a disponibilidade inicial
é coordenada com a saúde do PostgreSQL e o sucesso das migrações.

## Migração dos repositórios

`back/` e `front/` passam a pertencer ao Git da raiz, com as alterações locais
preservadas. Os metadados dos antigos repositórios estão guardados localmente em
`.legacy-git/back` e `.legacy-git/front`, ignorados pelo Git e pelo Docker.
O histórico antigo não foi reescrito nem incorporado no histórico da raiz.
Para o consultar: `git --git-dir=.legacy-git/back --work-tree=back log`
(ou substituir `back` por `front`). Guardar `.legacy-git` separadamente se for
necessário conservar esses históricos fora desta máquina.

## Validação da migração para monorepo

Validado com instalação limpa (`npm ci`), builds das duas aplicações e
15 testes. As imagens Docker foram construídas e arrancadas com volumes vazios;
as 80 migrações passaram, todos os modelos Prisma foram consultados e foram
verificados o frontend, healthcheck, API protegida e handshake Socket.IO pelo
Nginx. Os containers e volumes temporários foram removidos após a validação.
