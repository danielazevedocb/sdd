# 002-cadastro-cliente

## Objetivo

Entregar o cadastro de usuário no módulo `auth`, com entidade, caso de uso `register-user`, persistência via Prisma e endpoint HTTP protegido por criptografia de senha com bcrypt.

## Contexto Técnico

- Módulo de negócio novo: `auth`, com agregado `user`.
- Persistência via Prisma; criptografia de senha via biblioteca `bcrypt`.
- Endpoint de registro exposto no backend via controller simples que instancia o caso de uso no corpo do método.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- As interfaces definidas no módulo `auth` (repositório de `user` e `crypto.provider.ts`) não podem ser alteradas pelas implementações.
- As implementações técnicas (repositório Prisma e provider bcrypt) devem ficar diretamente em `apps/backend/src/modules/auth`, sem subpasta.
- No `auth.controller.ts`, o caso de uso `register-user` deve ser instanciado no corpo do método, recebendo as implementações injetadas no próprio controller como parâmetro.

## Tasks

### Tasks - Módulo auth

- [x] Criar o módulo `auth` com a skill [config-new-module](../../../.claude/skills/config-new-module).
  > ✅ 2026-06-10 19:10 — Executado `node .claude/skills/config-new-module/scripts/create-module.js --module auth --namespace @sdd`. Script criou a estrutura `modules/auth`, arquivos NestJS em `apps/backend/src/modules/auth` e frontend em `apps/frontend/src/modules/auth`. Corrigido placeholder `@sdd/__package_name__` → `@sdd/auth` no `modules/auth/package.json` (bug no template). `npm install` e `npm run build` executados com sucesso. Testes do módulo passaram (1/1).

- [x] Criar o agregado `user` dentro do módulo `auth` com a skill [module-aggregate](../../../.claude/skills/module-aggregate), contendo apenas um caso de uso de exemplo.
  > ✅ 2026-06-10 19:12 — Executado `node .claude/skills/module-aggregate/scripts/create-aggregate.js --module auth --aggregate user --mode example`. Criada estrutura `modules/auth/src/user/` com `model/`, `provider/`, `usecase/` e seus `index.ts`. Verificado que todos os arquivos foram criados corretamente.

- [x] Implementar a entidade `user` com a skill [module-entity](../../../.claude/skills/module-entity), com os campos `id`, `name` (rule: person name), `email` (rule: email) e `password` (rule: hash pass).
  > ✅ 2026-06-10 19:15 — Implementado `modules/auth/src/user/model/user.entity.ts` com `UserState` (name, email, password) e validações: name → RequiredRule + MinLengthRule(2) + MaxLengthRule(120) + PersonNameRule; email → RequiredRule + EmailRule; password → RequiredRule + BcryptHashRule. Testes criados em `modules/auth/test/user/model/user.entity.test.ts` (21 testes). Cobertura 100% em todas as métricas.

- [x] Criar a interface `crypto.provider.ts` em `modules/auth/.../user/provider` com os métodos de criptografar senha e comparar senhas.
  > ✅ 2026-06-10 19:17 — Criado `modules/auth/src/user/provider/crypto.provider.ts` com interface `CryptoProvider` contendo `hashPassword(password: string): Promise<string>` e `comparePasswords(plain: string, hashed: string): Promise<boolean>`. Exportado em `modules/auth/src/user/provider/index.ts`.

- [x] Implementar o caso de uso `register-user` com a skill [module-use-case](../../../.claude/skills/module-use-case), cobrindo o fluxo: validar dados de entrada (`name`, `email`, `password`), validar se o usuário já está cadastrado, criptografar a senha, criar a entidade `user` e persistir via repositório. O retorno do caso de uso deve ser `void`.
  > ✅ 2026-06-10 19:20 — Adicionado `findByEmail(email: string): Promise<User | null>` à interface `UserRepository`. Criado `modules/auth/src/user/usecase/register-user.usecase.ts` com fluxo completo: validação de entrada (name, email, password plain text) → verificação de email duplicado (409) → hash via CryptoProvider → criação e validação da entidade User → persistência. Criados fakes `FakeUserRepository` e `FakeCryptoProvider` em `modules/auth/test/mock/`. Testes criados em `modules/auth/test/user/usecase/register-user.usecase.test.ts` (13 testes). Cobertura 100% em todas as métricas.

### Tasks - Back-end

- [x] Sincronizar o módulo `auth` com o Prisma criando o model da entidade `user` com a skill [backend-prisma-sync-module](../../../.claude/skills/backend-prisma-sync-module).
  > ✅ 2026-06-10 19:25 — Criado `apps/backend/prisma/models/auth.model.prisma` com model `User` (id, name, email, password, createdAt, updatedAt, deletedAt, `@@map("users")`). Removido `bootstrap.model.prisma` pois o primeiro model real foi introduzido. DB tinha drift com migrações antigas; usado `prisma db push --accept-data-loss` para sincronizar, depois `prisma migrate diff` para gerar SQL e criado manualmente `prisma/migrations/20260610000000_auth/migration.sql`, marcado como aplicado via `prisma migrate resolve --applied`. Executado `prisma:generate` com sucesso.

- [x] Implementar o repositório Prisma de `user` diretamente em `apps/backend/src/modules/auth` (sem subpasta) com a skill [backend-prisma-repository](../../../.claude/skills/backend-prisma-repository), sem alterar a interface definida no módulo `auth`.
  > ✅ 2026-06-10 19:28 — Criado `apps/backend/src/modules/auth/user.prisma.ts` com classe `PrismaUserRepository implements UserRepository`. Implementa todos os métodos do contrato (create, update, delete, findById, findByEmail, findPage) usando `PrismaService`. Atualizado `auth.module.ts` com import de `DbModule` e registro de `PrismaUserRepository` em providers. Interface de repositório não foi alterada.

- [x] Instalar `bcrypt` no backend e implementar `crypto.provider.ts` diretamente em `apps/backend/src/modules/auth` (sem subpasta) usando bcrypt, sem alterar a interface definida no módulo `auth`.
  > ✅ 2026-06-10 19:30 — Instalados `bcrypt` e `@types/bcrypt` via `npm install --workspace apps/backend bcrypt @types/bcrypt`. Criado `apps/backend/src/modules/auth/crypto.provider.ts` com `BcryptCryptoProvider implements CryptoProvider` usando `bcrypt.hash` (saltRounds=10) e `bcrypt.compare`. Registrado em `auth.module.ts`. Interface `CryptoProvider` não foi alterada.

- [x] Criar `auth.controller.ts` no backend com a skill [backend-nest-controller](../../../.claude/skills/backend-nest-controller) expondo o endpoint de registrar usuário: injetar repositório e `crypto.provider` diretamente no controller, instanciar o caso de uso `register-user` no corpo do método e passar as dependências via parâmetro.
  > ✅ 2026-06-10 19:33 — Criado `apps/backend/src/modules/auth/auth.controller.ts` com endpoint `POST /auth/register` decorado com `@Public()` (sem JWT guard) e `@HttpCode(201)`. `PrismaUserRepository` e `BcryptCryptoProvider` injetados no constructor. `RegisterUser` instanciado no corpo do método `register()` recebendo as implementações. `AuthModule` registrado em `AppModule`. Build compilou com sucesso (correção aplicada: `import type { RegisterUserIn }` para compatibilidade com `emitDecoratorMetadata`).

- [x] Criar os testes de integração HTTP em `auth.integration.http` (Rest Client) cobrindo o fluxo de registro de usuário.
  > ✅ 2026-06-10 19:35 — Criado `apps/backend/src/modules/auth/auth.integration.http` cobrindo: registro com sucesso (201), email duplicado (409), nome inválido (422), email inválido (422), senha fraca (422). Usa variável `@scenarioVersion = {{$timestamp}}` para evitar colisão entre execuções.

## Resultado Esperado

- Módulo `auth` com agregado `user`, entidade validada e caso de uso `register-user` implementado e testado.
- Model `user` sincronizado no Prisma com migration aplicada.
- Endpoint de cadastro de usuário exposto no backend, com senha armazenada criptografada via bcrypt.
- Testes de integração em `auth.integration.http` executando com sucesso.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
