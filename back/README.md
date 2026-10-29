# Clínica Alfavida — Backend

API REST para o sistema de gestão clínica, construída com Node.js + Express + Prisma.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js (TypeScript) |
| Framework | Express |
| ORM | Prisma |
| Base de dados | PostgreSQL |
| Autenticação | JWT (Bearer token) |
| Validação | Zod |
| Tempo real | Socket.IO |
| Upload de ficheiros | Multer |
| Relatórios | ExcelJS · PDFMake |
| Passwords | bcrypt |

## Pré-requisitos

- Node.js ≥ 18
- PostgreSQL em execução
- Ficheiro `.env` configurado

## Configuração

```bash
# Instalar dependências
npm install

# Copiar e editar variáveis de ambiente
cp .env.example .env

# Sincronizar schema com a base de dados
npx prisma db push

# Gerar cliente Prisma
npx prisma generate
```

### Variáveis de ambiente

```env
PORT=8020
DATABASE_URL=postgresql://user:password@localhost:5432/alfavida
JWT_SECRET=chave_secreta
```

## Scripts

```bash
# Desenvolvimento (hot-reload com nodemon)
npm run start:dev

# Build para produção (TypeScript → JavaScript)
npm run build

# Iniciar em produção
npm start
```

## Estrutura do projecto

```
src/
├── index.ts              # Entrada — Express + Socket.IO
├── config/               # Configuração global
├── database/             # Inicialização do cliente Prisma
├── middlewares/          # Verificação JWT
├── routers/              # Registo de rotas (56+ módulos)
├── controllers/          # Lógica de negócio
├── repositories/         # Acesso a dados via Prisma
├── validator/            # Schemas de validação com Zod
├── utils/                # Helpers (geração de usernames, referências, etc.)
└── types/                # Tipos TypeScript partilhados
prisma/
└── schema.prisma         # Schema da base de dados
```

## Autenticação

Todas as rotas (excepto `/api/auth`, `/api/balances` e `/api/reports`) são protegidas por JWT. O token deve ser enviado no header de cada pedido:

```
Authorization: Bearer <token>
```

## Rotas principais

| Domínio | Rota base |
|---|---|
| Autenticação | `/api/auth` |
| Utilizadores | `/api/users` |
| Pacientes | `/api/customers` |
| Atendimentos | `/api/attendances` |
| Triagem | `/api/screenings` |
| Consultas médicas | `/api/consultations` |
| Exames | `/api/exams` |
| Serviços / Produtos | `/api/services` |
| Categorias | `/api/categories` |
| Faturas | `/api/invoices` |
| Pagamentos | `/api/payments` |
| Caixa / Fluxo | `/api/cashiers` |
| Balanço | `/api/balances` |
| Stocks | `/api/stocks` |
| Fornecedores | `/api/suppliers` |
| Compras | `/api/purchases` |
| Protocolos | `/api/protocols` |
| Seguros externos | `/api/insurances` |
| Seguros internos | `/api/interns` |
| Parceiros | `/api/partners` |

## Tempo real (Socket.IO)

O servidor emite eventos para actualalizações clínicas em tempo real. O frontend subscreve via `socket.io-client` na mesma base URL.

| Evento | Descrição |
|---|---|
| `screening:create` | Nova triagem registada |
| `screening:update` | Triagem actualizada (status ou sinais vitais) |

## Modelos da base de dados

O schema Prisma cobre mais de 60 modelos. Os principais:

`User` · `Customer` · `Attendance` · `Screening` · `MedicalConsultation` · `Consultation` · `RequestExams` · `Exam` · `ExamResult` · `Prescription` · `Surgery` · `Internment` · `Observation` · `Service` · `Category` · `Invoice` · `InvoiceItem` · `Payment` · `Protocol` · `Insurance` · `Partner` · `Supplier` · `Purchase` · `Stock` · `Material`
