# Testes dos utilizadores e do atendimento — 20/10/2026

## Ambiente e limites

Testes com autenticação real, API Express real e PostgreSQL isolado em `127.0.0.1:55482`, base `health_journey_e2e`. A API de teste usa a porta `18020`; o navegador usa a porta `19008`. Foram criados pacientes, documentos, stock e dez contas sintéticas, uma por papel. As contas e os dados clínicos da base configurada para utilização normal não foram alterados pelos testes.

A cobertura representa todos os **papéis**, não o início de sessão em cada conta real da clínica. A navegação pelos menus verifica carregamento, erros JavaScript e respostas HTTP de erro; não equivale a testar todas as operações possíveis em cada ecrã. Internamento, cirurgias, administração de tratamentos e impressão física não tiveram percursos completos nesta execução.

## Cobertura por papel

| Papel | Verificação |
| --- | --- |
| Administrador (`admin`) | Login, menus, utilizadores e configuração; bloqueio de promoção de utilizadores pelos restantes papéis. |
| Recepcionista (`attendant`) | Paciente, atendimento, autoria, cobrança, marcação de exames pagos, exames externos e acompanhamento do estado até conclusão. |
| Enfermeiro (`nurse`) | Fila, início e conclusão de triagem, persistência dos sinais vitais, dispensa e prevenção de dupla dispensa. Formulário de triagem no navegador. |
| Técnico de enfermagem (`techNursian`) | Login, menus, conclusão de triagem sem todos os sinais vitais opcionais e criação da consulta associada. |
| Médico (`doctor`) | Fila, início, pedido e leitura de exames, prescrição, diagnóstico e conclusão. Formulário de consulta no navegador. |
| Analista (`analyst`) | Atribuição e gravação de resultados, consumo de material e devolução integral em caso de falta de stock. |
| Técnico de laboratório (`techLab`) | Atribuição e gravação de exame pago; bloqueio de exame por pagar. |
| Chefe de laboratório (`chiefLab`) | Atribuição e gravação de exame pago. |
| Financeiro (`financial`) | Documentos, clientes, pagamentos e liquidação permitida; alteração de diagnóstico recusada. |
| Inventário (`inventory`) | Login e carregamento de stock, artigos, materiais, compras e fornecedores; sem acesso de escrita clínica. |

## Percurso principal

1. Recepção cria paciente e atendimento, com triagem associada.
2. Emite a cobrança da consulta.
3. Enfermagem inicia a triagem, guarda sinais vitais e conclui.
4. A consulta surge para o médico, ligada ao atendimento; a recepção acompanha o estado.
5. Médico inicia a consulta e pede exame.
6. Recepção factura e marca os exames daquela consulta como pagos.
7. Laboratório assume o trabalho, grava resultados e desconta os consumíveis.
8. Médico consulta os resultados e prescreve.
9. Enfermagem dispensa; uma repetição é recusada.
10. Médico conclui e a recepção vê o atendimento concluído.

## Falhas corrigidas durante os testes

- Permissões que impediam a recepção de facturar exames e o laboratório de actualizar a fase da consulta. Foram abertas apenas as operações e os campos necessários.
- Estado do atendimento e ligação à consulta não acompanhavam o fluxo clínico.
- Autoria recebida do cliente podia substituir o profissional autenticado.
- Frequência respiratória era descartada na validação; sinais opcionais impediam certas triagens.
- Era possível reabrir uma triagem concluída ou prosseguir num atendimento cancelado.
- Marcar um exame como pago podia afectar outras consultas com o mesmo serviço.
- Resultados de exames por pagar eram aceites.
- Resultados e consumo laboratorial não eram atómicos; agora uma falta de stock desfaz ambos.
- Dispensa com vários medicamentos podia deixar movimentos parciais; agora a operação é transaccional e impede repetição concorrente.
- O médico não conseguia editar após resultados laboratoriais e a abertura do formulário podia reiniciar consultas encerradas.
- O formulário de facturação podia prosseguir com a marcação de serviços pagos após falha de emissão.
- A rota do histórico da farmácia era interpretada como identificador.
- Relatórios PDF falhavam ao importar as fontes após a migração das ferramentas.
- A fila médica devolvia erro 500 quando recebia `perPage` sem `page`; corrigido também o deslocamento entre páginas.

## Validação automatizada

Resultado final: **26/26 testes do atendimento, 11/11 de segurança e 6/6 de integração passaram**. No Chrome passaram os logins dos dez papéis, **101 verificações de páginas** e os dois formulários clínicos, sem erros JavaScript nem respostas HTTP de erro nas páginas verificadas. O navegador fez 13 logins ao todo, incluindo as trocas de profissional para o percurso.

- `back/tests/journey.test.cjs`: 26 testes de API com os dez papéis, percurso principal e casos negativos.
- `back/tests/security.test.cjs`: 11 testes de autenticação, autorização, respostas, uploads e sockets.
- `back/tests/integration.test.cjs`: seis testes PostgreSQL de concorrência, stock, facturação e recibos.
- `front/tests/migration.test.mjs`: verificações de router, Pinia e downloads autenticados.
- `front/tests/journey-browser.mjs`: Chrome sem interface, login real dos dez papéis, navegação dos menus e preenchimento dos formulários de triagem e consulta.
- TypeScript do backend e compilação SPA do frontend.

As credenciais sintéticas são geradas aleatoriamente por `back/tests/journey-server.cjs` e guardadas temporariamente em `/tmp/health-journey-fixture.json`, com acesso restrito. Não foram incluídas no repositório.

## Reexecução

Usar exclusivamente um PostgreSQL descartável na porta `55482`. Criar uma base com prefixo `health_journey_` e aplicar o esquema Prisma com `db push`. A protecção dos scripts recusa outros endereços para o percurso de atendimento.

Na pasta `back`, definir `JOURNEY_DATABASE_URL` para essa base e iniciar `node -r ts-node/register/transpile-only tests/journey-server.cjs`. Com a mesma variável, executar `node --test -r ts-node/register/transpile-only tests/journey.test.cjs`.

Na pasta `front`, compilar com `API_URL=http://127.0.0.1:18020/api npm run build -- --no-summary` e executar `node tests/journey-browser.mjs`. Recompilar sem essa variável ao terminar, para repor a configuração normal do artefacto. Encerrar os serviços de teste e remover o ficheiro temporário de credenciais.

## Ampliação por gravidade

A verificação foi posteriormente ampliada para os percursos normal, grave e muito grave. Os resultados, as correcções adicionais e as limitações estruturais estão em [Percursos operacionais por gravidade](percursos-operacionais-gravidade-2026-10-20.md).
