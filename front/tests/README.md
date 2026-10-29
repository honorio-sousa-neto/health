# Verificações do frontend

Use uma versão Node compatível com `package.json` (22.22+, 24, 26, 28 ou 30).

```sh
npm ci
npm test
npm run build
npm run test:browser
```

`test:browser` requer Google Chrome. Abre um servidor apenas em `127.0.0.1` e um perfil temporário vazio; verifica o ecrã de login compilado sem autenticar contra a base da clínica. Encerra o servidor e elimina o perfil ao terminar.

Para verificar a distribuição Electron:

```sh
npm --prefix src-electron ci
npx quasar build -m electron
```

O empacotamento pode descarregar o runtime oficial Electron. As dependências específicas de Electron ficam em `src-electron/package.json` e têm lockfile próprio. Não publique a pasta `UnPackaged` como substituto de um executável empacotado.

Para repetir as auditorias completas:

```sh
npm audit
npm --prefix src-electron audit
```
