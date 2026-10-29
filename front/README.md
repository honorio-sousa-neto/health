# Clínica Alfavida — Frontend

Interface web para o sistema de gestão clínica, construída com Vue 3 + Quasar.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Vue 3 (Composition API) |
| UI | Quasar Framework v2 |
| Estado | Pinia |
| Routing | Vue Router v4 |
| HTTP | Axios |
| Tempo real | Socket.IO Client |
| Gráficos | ApexCharts |
| PDF | PDFMake |
| Build | Quasar CLI (Vite) |
| Desktop | Electron |

## Pré-requisitos

- Node.js ≥ 18
- Quasar CLI instalado globalmente: `npm install -g @quasar/cli`
- Backend em execução em `http://localhost:8020`

## Configuração

```bash
# Instalar dependências
npm install
```

A URL base da API está configurada em `src/boot/axios.js`. Ajustar conforme o ambiente.

## Scripts

```bash
# Desenvolvimento (hot-reload)
quasar dev

# Build para produção (SPA)
quasar build

# Build para desktop (Electron)
quasar build -m electron
```

## Estrutura do projecto

```
src/
├── pages/          # Páginas organizadas por domínio
├── components/     # Componentes reutilizáveis
│   ├── common/     # Botões, tabelas, paginação, inputs
│   └── global/     # Componentes globais (invoice, links)
├── stores/         # Estado com Pinia (45+ stores)
├── composables/    # Lógica reutilizável (api, auth, crud)
├── router/         # Rotas + guard de autenticação
├── layouts/        # Templates de layout
├── boot/           # Inicialização do Axios e outros plugins
├── css/            # Estilos globais (SCSS)
└── utils/          # Helpers (formatação, colunas, notificações)
```

## Módulos principais

| Módulo | Caminho |
|---|---|
| Login | `pages/login` |
| Dashboard | `pages/dashboard` |
| Recepção / Atendimentos | `pages/atendimento/reception` |
| Triagem | `pages/atendimento/triagem` |
| Consulta médica | `pages/atendimento/medico` |
| Exames de laboratório | `pages/atendimento/exam` |
| Pacientes | `pages/clientes` |
| Utilizadores | `pages/users` |
| Emissão de documentos | `pages/documents` |
| Caixa | `pages/caixa` |
| Balanço | `pages/balance` |
| Serviços / Produtos | `pages/servicos` |
| Precário | `pages/precario` |
| Categorias | `pages/category` |
| Stocks | `pages/stock-control` |
| Compras | `pages/compras` |
| Fornecedores | `pages/suppliers` |
| Protocolos | `pages/protocolos` |
| Seguros externos | `pages/seguradoras` |
| Seguros internos | `pages/seguradoras-internas` |
| Parceiros | `pages/parceiros` |
| Grupos | `pages/grupos` |

## Autenticação

O guard de router verifica a presença do utilizador no `SessionStorage` (`alfavida_user`). Utilizadores não autenticados são redireccionados para `/login`.

O Axios inclui automaticamente o token JWT em todos os pedidos e redireciona para `/login` em caso de resposta `401`.

## Estado (Pinia)

Cada domínio tem a sua própria store em `src/stores/`. As stores de maior uso:

| Store | Ficheiro |
|---|---|
| Faturas | `stores/invoice.js` |
| Autenticação | `stores/auth.js` |
| Pacientes | `stores/customer.js` |
| Triagem | `stores/screening.js` |
| Serviços | `stores/service.js` |
| Dashboard | `stores/dashboard.js` |
| Protocolos | `stores/protocol.js` |

## Tempo real

O cliente Socket.IO liga à mesma base URL do backend. Utilizado nas páginas de triagem e atendimento para receber actualizações sem necessidade de refresh.

```js
import io from 'socket.io-client'
const socket = io(api.defaults.baseURL.slice(0, -4))
socket.on('screening:create', (data) => { /* ... */ })
```
