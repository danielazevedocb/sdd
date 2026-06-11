# 001-criar-projeto

## Objetivo

Criar a base do projeto monorepo com backend, frontend, pacote compartilhado, Prisma e a infraestrutura de autenticação e tratamento de erros do backend.

## Contexto Técnico

- Monorepo Turbo com `apps/frontend` (Next.js na porta 3000) e `apps/backend` (NestJS na porta 4000).
- Namespace npm do workspace: `@sdd`.
- Persistência via Prisma, com schema modular por domínio.
- Autenticação baseada em JWT no backend, com tratamento de erros centralizado.
- Esta spec entrega apenas a base técnica. Módulos de negócio (ex.: `auth`/cadastro de usuário) são criados em specs posteriores.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- Nenhum módulo de domínio deve ser criado nesta spec; foco exclusivo em infraestrutura compartilhada.

## Tasks

### Tasks - Configuração

- [x] Criar a estrutura base do monorepo com a skill [config-project-fullstack](../../../.claude/skills/config-project-fullstack) usando o namespace `@sdd`.
  > ✅ 2026-06-10 21:15 — Backend `@sdd/backend` (NestJS, porta 4000, CORS, ConfigModule) já existia corretamente. Frontend criado via `create-next-app` em dir temporário e copiado para `apps/frontend`, renomeado para `@sdd/frontend`, porta 3000. Workspaces `modules/*` adicionados ao `package.json` raiz. O script `create-project.js` encontrou conflito de entradas no diretório atual (workspace parcialmente existente), por isso o frontend foi criado manualmente seguindo o mesmo resultado final. `npm install` executado na raiz para sincronizar lockfile.

- [x] Configurar a infraestrutura do Prisma no backend com a skill [config-prisma](../../../.claude/skills/config-prisma).
  > ✅ 2026-06-10 21:18 — Script `init-prisma-backend.js --apply --install` executado com sucesso. Criados: `prisma/schema.prisma`, `prisma.config.ts`, `prisma/models/bootstrap.model.prisma`, `prisma/seed/main.ts`, `docker-compose.yml`, `src/db/prisma.service.ts`, `src/db/db.module.ts`. DbModule importado no `app.module.ts`. Dependências Prisma instaladas (prisma, @prisma/client, @prisma/adapter-pg, tsx). Docker Compose iniciado (`db:start`), `prisma:generate` executado com sucesso gerando Prisma Client v7.8.0.

- [x] Criar o pacote compartilhado com a skill [config-package-shared](../../../.claude/skills/config-package-shared) usando o namespace `@sdd`.
  > ✅ 2026-06-10 21:20 — `packages/shared` já existia com estrutura correta (`src/db`, `src/error`, `src/model`, `src/usecase`, `src/validation`). Template da skill tinha `@sdd/shared` indevidamente (deve ser `@temp/shared`), corrigido antes da execução. Script `rebuild-shared.js --force` executado: detectou scope `@sdd`, recriou `packages/shared` com nome final `@sdd/shared`, build validado via `turbo run build --filter=@sdd/shared`, `dist/` gerado com sucesso.

- [x] Configurar a base de tratamento de erros e autenticação JWT no backend com a skill [backend-nest-config](../../../.claude/skills/backend-nest-config).
  > ✅ 2026-06-10 21:22 — Script `apply-backend-shared.js` executado com sucesso. Instaladas dependências: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@sdd/shared`, `@types/passport-jwt`. Criada estrutura `apps/backend/src/shared/` (auth, decorators, errors, types). `app.module.ts` reescrito com `ConfigModule`, `JwtAuthModule`, `ApiExceptionFilter` e `JwtAuthGuard` globais. `app.controller.ts` reescrito com `@Public()`. `.env` e `.env.example` atualizados com `JWT_SECRET` e `JWT_EXPIRES_IN`. Build do backend validado com sucesso.

## Resultado Esperado

- Monorepo funcional com `apps/backend` (NestJS, porta 4000) e `apps/frontend` (Next.js, porta 3000) sob o namespace `@sdd`.
- Prisma configurado com schema modular e infraestrutura (`DbModule`, `PrismaService`, seed técnico, docker compose) pronta para receber models de módulos.
- Pacote compartilhado disponível para backend, frontend e módulos de negócio.
- Backend com tratamento de erros centralizado e base de autenticação JWT prontos para serem consumidos por módulos futuros.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
