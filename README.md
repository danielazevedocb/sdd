# SDD — Specification-Driven Development

Monorepo fullstack orientado por especificações. **Todo o desenvolvimento deste repositório segue SDD**: cada entrega começa em uma spec em `.spec/`, é executada com evidências registradas e, ao concluir, vai para o arquivo.

O projeto implementa **Cadastro Base** — um sistema web para organizar cadastros de um pequeno negócio — com Next.js no front, NestJS no back, Prisma + PostgreSQL na persistência e regras de negócio isoladas em módulos de domínio.

## O que é SDD neste projeto

**SDD (Specification-Driven Development)** significa que a spec é a fonte da verdade. Código, testes e interface existem para cumprir o que está escrito na mudança — não o contrário.

Fluxo padrão:

1. **Ler a spec** — objetivo, contexto técnico e tasks na ordem definida.
2. **Executar** — implementar seguindo as convenções do repositório e as skills em `.claude/skills/` quando indicadas.
3. **Registrar evidência** — marcar cada checkbox e documentar o que foi feito, no formato de [`.spec/shared/como-executar.md`](.spec/shared/como-executar.md).
4. **Arquivar** — mover a spec concluída de `.spec/changes/` para `.spec/changes/archive/`.

Regras que valem para qualquer spec:

- Nunca remover tasks.
- Só considerar concluída quando todos os checkboxes estiverem marcados com evidência.
- Se algo não puder ser executado, registrar o motivo na evidência.
- Desvios do plano devem ser explícitos na evidência.

## Estrutura do repositório

```text
.spec/
  changes/              # specs ativas (em andamento)
  changes/archive/      # specs concluídas
  memory/               # contexto global (produto, stack, estrutura)
  shared/               # convenções reutilizáveis entre specs
  templates/            # modelos para novas mudanças
apps/
  frontend/             # Next.js — telas, formulários, integração com API
  backend/              # NestJS — controllers, Prisma, infraestrutura
modules/
  auth/                 # autenticação e usuários
  catalog/              # catálogo de produtos
packages/
  shared/               # contratos, erros, validações e utilitários compartilhados
  ui/                   # componentes React compartilhados
  eslint-config/        # configuração ESLint do monorepo
  typescript-config/    # tsconfigs compartilhados
.claude/skills/         # automações e padrões para execução das specs
```

### Responsabilidades por camada

| Camada | Papel |
| --- | --- |
| `.spec/` | Define **o que** entregar, **como** executar e **quando** está pronto |
| `modules/<domínio>/` | Regras de negócio: entidades, casos de uso, contratos de repositório |
| `apps/backend/` | API REST, persistência Prisma, autenticação JWT, tratamento de erros |
| `apps/frontend/` | Interface web, rotas públicas/privadas, consumo da API |
| `packages/shared/` | Contratos e validações usados por front, back e módulos |

O front-end não conhece banco de dados. O back-end expõe casos de uso via API. A spec descreve a mudança **antes** da implementação.

## Stack

- **TypeScript** em todo o monorepo
- **Turborepo** para orquestrar build, dev, lint e testes
- **Next.js 16** (`apps/frontend`, porta `3000`)
- **NestJS 11** (`apps/backend`, porta `4000`)
- **Prisma 7** + **PostgreSQL** (via Docker Compose)
- **JWT** para autenticação
- Namespace npm do workspace: `@sdd`

## Pré-requisitos

- Node.js >= 18
- npm 11 (gerenciador definido no projeto)
- Docker (para o banco PostgreSQL local)

## Configuração inicial

```sh
# Na raiz do repositório
npm install

# Backend — variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
# Edite JWT_SECRET e demais valores se necessário

# Subir o banco
npm run db:start --workspace=@sdd/backend

# Gerar client e aplicar migrations
npm run prisma:generate --workspace=@sdd/backend
npm run prisma:migrate:dev --workspace=@sdd/backend
```

Variáveis principais (`apps/backend/.env`):

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL |
| `PORT` | Porta da API (padrão `4000`) |
| `JWT_SECRET` | Segredo para assinatura dos tokens |
| `JWT_EXPIRES_IN` | Validade do token (padrão `1d`) |

## Como executar

### Desenvolvimento (front + back)

```sh
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### Comandos por workspace

```sh
# Apenas frontend
npm run dev --workspace=@sdd/frontend

# Apenas backend
npm run dev --workspace=@sdd/backend

# Banco de dados
npm run db:start --workspace=@sdd/backend
npm run db:stop --workspace=@sdd/backend
npm run prisma:studio --workspace=@sdd/backend
```

### Build, lint e testes

```sh
npm run build          # build de todos os workspaces
npm run lint           # lint em todo o monorepo
npm run test           # testes unitários (módulos e shared)
npm run check-types    # verificação de tipos

# E2E do frontend (Playwright)
npm run test:e2e --workspace=@sdd/frontend
```

Para filtrar um pacote específico com Turbo:

```sh
npx turbo build --filter=@sdd/backend
npx turbo dev --filter=@sdd/frontend
```

## Como trabalhar com specs

### Onde começar

1. Leia o contexto global em [`.spec/memory/`](.spec/memory/).
2. Veja a spec ativa em [`.spec/changes/`](.spec/changes/).
3. Siga as regras de [`.spec/shared/como-executar.md`](.spec/shared/como-executar.md).

### Criar uma nova mudança

1. Copie um template de [`.spec/templates/`](.spec/templates/):
   - [`modelo-base.md`](.spec/templates/modelo-base.md) — mudanças gerais
   - [`modelo-crud.md`](.spec/templates/modelo-crud.md) — CRUD de entidade em módulo existente
2. Crie a pasta `.spec/changes/NNN-descricao-da-mudanca/` com `spec.md`.
3. Preencha objetivo, contexto, tasks e resultado esperado.
4. Execute na ordem, registre evidências e arquive ao concluir.

Convenções de nomenclatura: [`.spec/shared/regras-de-nomenclatura.md`](.spec/shared/regras-de-nomenclatura.md).

### Histórico de entregas

| Spec | Status | Entrega |
| --- | --- | --- |
| `001-criar-projeto` | arquivada | Monorepo, Prisma, auth base, tratamento de erros |
| `002-cadastro-cliente` | arquivada | Domínio de clientes (backend) |
| `003-configurar-frontend` | arquivada | Estrutura Next.js, rotas, shared |
| `004-cadastro-cliente-frontend` | arquivada | Interface de clientes |
| `005-login-usuario` | arquivada | Login e sessão JWT |
| `006-cadastro-usuario` | arquivada | CRUD de usuários |
| `007-cadastro-produto` | **ativa** | CRUD de produtos no módulo `catalog` |

## Módulos implementados

### `auth`

- Registro e login de usuários (`/join` no front)
- CRUD de usuários em rota privada (`/auth/users`)
- JWT, hash de senha, endpoints REST no backend

### `catalog`

- CRUD de produtos (`/catalog/products`)
- Campos: nome, descrição, preço, status (`active` / `inactive` / `draft`), flags de disponibilidade

## Referências úteis

- [Como executar specs](.spec/shared/como-executar.md)
- [Contexto técnico global](.spec/memory/contexto-tecnico.md)
- [Estrutura e limites entre camadas](.spec/memory/estrutura.md)
- [Visão do produto](.spec/memory/produto.md)
- [Turborepo — documentação](https://turborepo.dev/docs)
