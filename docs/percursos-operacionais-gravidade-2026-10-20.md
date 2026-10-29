# Percursos operacionais por gravidade — 20/10/2026

## Resultado final

Passaram **53/53 testes de atendimento e regressão** (27 testes operacionais adicionais e 26 do percurso anterior), **11/11 testes de segurança** e **6/6 testes de integração PostgreSQL**. Passaram também a verificação TypeScript, as verificações existentes de router/Pinia/downloads e a compilação SPA.

No Chrome passaram os **seis formulários** (triagem e consulta para cada gravidade), a ordenação **emergência → urgência → não urgente** e a protecção da gravação automática ao trocar de paciente. A execução fez 147 pedidos à API isolada, sem excepções JavaScript registadas. Não se detectaram falhas nos testes finais; as limitações estruturais abaixo continuam por implementar.

## O que foi verificado

Foram executados percursos com pacientes sintéticos normais, graves e muito graves, usando os rótulos existentes no sistema: **Não urgente**, **Urgência** e **Emergência**. Esta verificação testa o comportamento do software, não valida o algoritmo como protocolo de classificação clínica.

Os testes usam o mesmo servidor Express da aplicação, autenticação real dos dez papéis e PostgreSQL descartável (`health_journey_severity`, porta `55482`). A API de teste usa `18020`; o Chrome usa `19008`. Nenhum paciente real foi usado ou alterado.

| Percurso | Normal | Grave | Muito grave |
| --- | --- | --- | --- |
| Recepção, paciente e triagem associada | Testado | Testado | Testado |
| Sinais vitais e classificação no formulário | Testado no Chrome | Testado no Chrome | Testado no Chrome |
| Início e conclusão de consulta | Testado | Testado | Testado |
| Encaminhamento obrigatório existente | Não exigido | Observação | Observação de emergência ou opção de internamento |
| Observação, soro, cobrança, execução e conclusão | Ramo opcional | Testado | Testado |
| Exames ligados à observação, resultados e consumo de material | Exames da consulta cobertos pela regressão | Testado | Testado |
| Cirurgia: pedido, cobrança, execução e histórico | Testado | Testado | Testado |
| Administração e vacinação: pedido, cobrança, execução e paciente | Testado | Testado | Testado |
| Declaração explícita de consumo associada ao atendimento | Testado | Testado | Testado |
| Prescrição e dispensa farmacêutica | Testado | Mecanismo comum coberto pela regressão | Mecanismo comum coberto pela regressão |
| Ambulatório com quatro sessões em dois dias | Testado | Verificado bloqueio sem encaminhamento | Usa o mesmo mecanismo; não houve um plano completo específico deste nível |
| Opção de internamento | Não aplicável ao cenário | Ramo opcional | Pedido, cobrança e execução no registo de observação existentes |

A conclusão da **consulta** e do respectivo atendimento não significa alta de internamento nem conclusão automática de todos os tratamentos. O sistema permite terminar a consulta depois de registar o encaminhamento; essa é a regra já presente no formulário e agora protegida também pela API.

## Correcções realizadas

1. Exames pedidos em observação mantêm o paciente e a ligação à consulta através da observação. A gravação dos resultados resolve essa relação correctamente, sem aceitar uma consulta alheia. Mantém-se a possibilidade de repetir na observação um exame já pedido na consulta.
2. Observação e seus pedidos de exame são criados na mesma transacção. Uma falha desfaz o conjunto.
3. A API passa a aplicar a exigência de encaminhamento já existente no ecrã para pontuações superiores a cinco. O ambulatório não pode contornar essa exigência.
4. Observações concluídas não podem ser reabertas nem ter indicações clínicas sobrescritas. A conclusão actualiza também `isCompleted`.
5. Um plano de ambulatório recusa a prescrição de outro paciente ou de outro tipo. A conclusão actualiza também o atendimento; as sessões registam o profissional autenticado e impedem dupla conclusão concorrente.
6. O diagnóstico passa a poder ser registado durante a consulta normal: o campo estava escondido até existir uma observação concluída. Ao mudar directamente entre consultas, o ecrã médico recarrega o paciente e recria o formulário. Uma gravação automática pendente mantém o identificador da consulta de origem, mesmo após a troca de paciente. O encaminhamento persistido continua reconhecido ao reabrir a consulta.
7. Resultados parciais deixam os exames pendentes na fila do laboratório. Só se marca a fase de resultados prontos quando todos os pedidos activos têm resultado; um pedido directo para antecipar essa fase é recusado.
8. Admissões simultâneas deixam de disputar a mesma referência. Atendimento e triagem passam a ser criados atomicamente.

9. As filas passam a respeitar o estado: um diagnóstico provisório não retira uma consulta em curso; a triagem activa exclui concluídos, permite pesquisar o paciente e mantém esperas superiores a 24 horas. O carregamento inicial da fila médica não fica limitado à primeira página antes de ordenar por gravidade.

## Limitações confirmadas

### Internamento não tem um percurso próprio completo

O botão «Solicitar internamento» chama `POST /observations`, com um serviço cujo nome contém «Internamento». O paciente continua associado e o registo pode ser cobrado e executado pela enfermagem, mas isso **não cria um registo `Internment`**. O modelo `Hospitalization` e a rota `/hospitalizations` representam o catálogo de serviços, não uma admissão de paciente.

Não foram encontrados nesse percurso comandos próprios para atribuição de cama, transferência, evolução diária e alta de internamento. Portanto, o ramo de muito grave **não pode ser considerado um internamento completo**, apesar de o pedido aparecer na observação. A mensagem «Observação e Internamento obrigatórios» também não corresponde ao comportamento do selector, que aceita uma das opções.

### Indicar medicação não equivale a consumir stock

Guardar `serum` numa observação ou `drugs` numa administração e marcar o procedimento como concluído não gera, por si, a saída desses medicamentos. Exames laboratoriais e dispensa em farmácia têm consumo transaccional testado. O endpoint de declaração explícita de consumo também foi testado com ligação ao atendimento nos três níveis.

O componente `DeclararConsumo.vue` existe, mas não foi encontrado montado nos ecrãs destes procedimentos. Falta integrar a confirmação do consumo real no percurso e distinguir artigos da clínica dos trazidos pelo paciente. Não se introduziu desconto automático a partir de doses em texto livre.

### Cirurgia e administração não identificam a visita de origem

`Surgery` e `AdministrationMedicament` guardam o paciente, mas não possuem `consultationId` nem `attendanceId`. Os testes confirmaram o paciente, a cobrança e a execução; não existe um vínculo estrutural inequívoco a uma visita específica quando o mesmo paciente tem vários atendimentos. Esse vínculo precisa de implementação para fechar a rastreabilidade de ponta a ponta.

### Classificação e atendimento de emergência precisam de validação clínica

A classificação actual é uma soma simples dos campos da triagem, repetida em vários ecrãs. Campos em falta contribuem com zero; uma classificação individual vermelha não obriga, por si só, a classificação global vermelha. O formulário também não expõe actualmente todos os campos que a API suporta, incluindo a frequência respiratória.

Os testes preservaram os limiares existentes; não introduziram critérios médicos novos. A adequação dos critérios, o tratamento de sinais em falta, a reavaliação, a deterioração e os procedimentos de emergência requerem regras aprovadas pela equipa clínica. Os ecrãs de observação actuais bloqueiam o início enquanto não houver pagamento, inclusive em pedidos originados em emergência; essa política precisa igualmente de revisão clínica e operacional.

## Prioridades para completar os percursos

| Prioridade | Trabalho necessário |
| --- | --- |
| Crítica | Aprovar com a equipa clínica as regras de classificação, os dados obrigatórios, a reavaliação e o percurso de emergência, incluindo a política de pagamento antes do início. |
| Alta | Implementar admissão de internamento própria, ligada à consulta e ao atendimento, com cama, transferências, evolução e alta. |
| Alta | Ligar cirurgia e administração à visita de origem, com apresentação no histórico do atendimento. |
| Alta | Registar as quantidades efectivamente administradas, distinguir medicamentos da clínica dos externos e integrar consumo de stock transaccional e idempotente nos ecrãs de execução. |

## Testes e reprodução

- `back/tests/operational.test.cjs`: percursos por gravidade e ramificações, tentativas de contornar encaminhamento, integridade de paciente/profissional, resultados parciais, consumo declarado e admissões concorrentes.
- `back/tests/journey.test.cjs`: regressão dos dez papéis e do percurso principal anterior.
- `front/tests/operational-browser.mjs`: triagem e consulta nos três níveis, bloqueio anterior ao encaminhamento, pedido pelo formulário, persistência ao reabrir e conclusão.
- Compilação TypeScript e SPA, além dos testes de segurança e integração existentes.

Usar as instruções de preparação em `testes-utilizadores-atendimento-2026-10-20.md`, com a base descartável de prefixo `health_journey_`. Aguardar a mensagem de prontidão do servidor antes de iniciar os testes. Executar o novo teste de API com `node --test -r ts-node/register/transpile-only tests/operational.test.cjs`. Após compilar a SPA com a API isolada, executar `node tests/operational-browser.mjs` em `front`. Recompilar sem `API_URL` e remover as credenciais temporárias ao terminar.
