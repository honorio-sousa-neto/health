# Proposta de migração das ferramentas do frontend

O `npm audit` autorizado identificou vulnerabilidades de desenvolvimento cuja correcção exige substituir `@quasar/app-vite` 1.x. A revisão automática bloqueou a migração por risco de compatibilidade e compilação. O utilizador autorizou a migração e as auditorias completas em 20/10/2026. A migração foi aplicada e validada: testes do frontend, SPA, Chrome e empacotamento Electron Linux passaram. As auditorias completas do backend, frontend e Electron terminaram sem avisos. A validação final está registada no relatório de correcções.

Alterações propostas:

1. `front/package.json`: actualizar `@quasar/app-vite` para `^3.10.3` e `vue-router` para `^5.0.6`, com Pinia 3 para compatibilidade; acrescentar comandos `dev` e `build`.
2. `front/quasar.config.js`: usar `defineConfig` do novo CLI; conservar explicitamente os aliases actuais (`src`, `pages`, `components`, etc.); activar `vueOptionsAPI`; actualizar o alvo Node para 22 e usar `build.defineEnv.APP_API_URL`.
3. `front/src/boot/{axios,theme}.js`, `front/src/router/index.js` e `front/src/stores/index.js`: actualizar wrappers para `#q-app` e constantes de ambiente para `import.meta.env`. Preservar as rotas e a lógica de negócio.
4. Mover as dependências Electron para `front/src-electron/package.json`, conforme o modelo do novo CLI, substituindo o pacote descontinuado `electron-packager` pelo sucessor oficial `@electron/packager` 20.3.x (a auditoria ainda identificou falhas em 19.x). Adaptar o arranque Electron à API actual sem activar acesso Node no renderer.
5. Actualizar os lockfiles, compilar novamente a SPA e executar os testes de segurança. Confirmar o estado dos avisos npm depois da migração.

Riscos concretos: mudanças de API do router/CLI, resolução de aliases e configuração do empacotamento Electron. A validação da compilação cobre a SPA; o empacotamento Electron requer uma verificação adicional. A migração não será publicada nem instalada em produção automaticamente.

Fontes: [guia oficial Quasar](https://quasar.dev/quasar-cli-vite/upgrade-guide/) e [versões do empacotador Electron](https://github.com/electron/packager/releases).
