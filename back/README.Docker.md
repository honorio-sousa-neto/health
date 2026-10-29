# Docker no monorepo

A configuração está na raiz: [README](../README.md#docker) e
[compose.yaml](../compose.yaml). Executar `docker compose up -d --build` na raiz.
O Dockerfile do backend usa o contexto da raiz e o lockfile unificado.
