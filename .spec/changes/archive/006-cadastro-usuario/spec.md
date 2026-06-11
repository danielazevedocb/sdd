# 006-cadastro-usuario

## Objetivo

Entregar o CRUD de usuário no módulo `auth`, servindo de referência para os próximos cadastros da aplicação.

## Contexto Técnico

- Módulo de negócio: `auth`, agregado `user` (já existente).
- Backend NestJS com controller dedicado para o CRUD.
- Front-end Next.js com listagem paginada e formulário compartilhado entre criação e edição, dentro do módulo `auth`.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- O caso de uso `save-user` cobre tanto criação quanto atualização e é **distinto** de `register-user`. Não fundir nem substituir o `register-user` existente.
- Casos de uso de comando retornam `void`. Consultas não viram caso de uso — o controller chama o repositório direto.
- Confirmação de senha é responsabilidade do front-end. Backend recebe apenas `password`.
- Em edição, se `password` vier vazio, a senha atual é mantida.
- O projeto não usa DTOs de entrada. **Respostas de leitura devem ser mapeadas para objetos simples no controller antes de retornar** — entidades de domínio usam `protected readonly props` com getters de prototype, que não serializam via `JSON.stringify` (produzem `{}`). O controller deve construir explicitamente o objeto de retorno: `return { id: user.id, name: user.name, email: user.email }`.
- A listagem fica dentro do módulo `auth` no front-end, em rota privada.
- **Sem verificação automatizada de UI nesta spec.** Não acionar `mcp__Claude_Preview` nem `mcp__Claude_in_Chrome`. As validações automatizadas vão até a camada de backend (testes unitários do módulo + cenários no Rest Client). O usuário valida a interface manualmente.

## Tasks

### Tasks - Negócio (módulo auth)

- [x] Implementar o caso de uso `save-user` com a skill [module-use-case](../../../.claude/skills/module-use-case). A decisão entre criar e atualizar deve ser baseada em uma consulta ao repositório (`findById`): se `id` vier na entrada e `findById` retornar um usuário, executa atualização; caso contrário (sem `id` ou usuário não encontrado no banco), executa criação usando o `id` recebido ou gerando um novo. Em edição sem `password` (ausente ou vazio), manter o hash atual sem re-hashear.
  > ✅ 2026-06-10 — Criado `modules/auth/src/user/usecase/save-user.usecase.ts`. Fluxo: valida name/email → `findById(id?)` → update (senha vazia/ausente mantém hash; nova senha passa por `StrongPasswordRule` + hash) ou create (senha obrigatória + hash). Checagem de e-mail duplicado em create/update. Export em `usecase/index.ts`. `register-user` e `login-user` intactos.

- [x] Implementar o caso de uso `delete-user` com a skill [module-use-case](../../../.claude/skills/module-use-case).
  > ✅ 2026-06-10 — Criado `modules/auth/src/user/usecase/delete-user.usecase.ts` delegando a `userRepository.delete(id)`. Retorno `void`.

- [x] Cobrir os dois casos de uso com testes unitários, reaproveitando os fakes existentes (`FakeUserRepository`, `FakeCryptoProvider`).
  > ✅ 2026-06-10 — Testes em `modules/auth/test/user/usecase/save-user.usecase.test.ts` (20 casos) e `delete-user.usecase.test.ts` (2 casos). Cobertura 100% em `save-user.usecase.ts` e `delete-user.usecase.ts`. Suite completa `@sdd/auth`: 66/66 passando.

### Tasks - Back-end

- [x] Criar `apps/backend/src/modules/auth/user.controller.ts` com a skill [backend-nest-controller](../../../.claude/skills/backend-nest-controller), expondo o CRUD em `/users` (criar, atualizar, excluir, obter por id e listar paginado). Endpoints autenticados. Consultas chamam o repositório direto; comandos instanciam o caso de uso correspondente.
  > ✅ 2026-06-10 — Criado `UserController` com `GET /users`, `GET /users/:id`, `POST /users` (201), `PUT /users/:id` (204), `DELETE /users/:id` (204). Respostas de leitura mapeadas via `mapUser()`. Guard JWT global (sem `@Public()`). Registrado em `auth.module.ts`. `npm run build --workspace apps/backend` OK.

- [x] Criar `apps/backend/src/modules/auth/user.integration.http` (Rest Client) cobrindo os fluxos do CRUD, incluindo os principais casos de erro. Validar manualmente com o backend rodando.
  > ✅ 2026-06-10 — Criado `user.integration.http` com fluxo autenticado (register+login → token), list/create/update/delete, erros 401/404/409/422. Execução manual pendente com backend em `localhost:4000` (conforme spec).

### Tasks - Front-end

> ⚠️ Sem validação automatizada de UI. O agente entrega o código + `npx tsc --noEmit` limpo; a verificação visual é manual.

- [x] Criar a listagem paginada de usuários no módulo `auth`, em rota privada. Tabela com colunas de nome, e-mail e ações (ícones de editar e excluir).
  > ✅ 2026-06-10 — `users-list.component.tsx`, `users.page.tsx`, rota `(private)/auth/users/page.tsx`. Tabela + `PaginationControls` (10/página) + `TableCard`.

- [x] Criar o formulário de usuário compartilhado entre criação e edição, organizado em seções via [`form-section-layout`](../../../apps/frontend/src/shared/components/ui/form-section-layout.tsx): "Dados básicos" (nome, e-mail) e "Senha" (senha + confirmação).
  > ✅ 2026-06-10 — `user-form.component.tsx` compartilhado. Rotas `/auth/users/new` e `/auth/users/[id]/edit`. Seções "Dados básicos" e "Senha". Serviço `user.service.ts` com fetch autenticado.

- [x] Integrar a coluna de ações: lápis navega para a edição; lixeira abre [`delete-confirmation-dialog`](../../../apps/frontend/src/shared/components/ui/delete-confirmation-dialog.tsx) e, ao confirmar, chama o backend e atualiza a tabela.
  > ✅ 2026-06-10 — Ícones `Pencil`/`Trash2` na listagem. Dialog de confirmação + `DELETE /users/:id` + reload da página atual.

- [x] Adicionar o item "Usuários" no menu lateral apontando para a listagem.
  > ✅ 2026-06-10 — Módulo `auth` adicionado em `app/(private)/layout.tsx` com item "Usuários" → `/auth/users`.

- [x] Acrescentar no i18n as chaves novas que aparecerem (ex.: `user.not_found`, mensagem de senha e confirmação divergentes). Reaproveitar as chaves já cadastradas em specs anteriores.
  > ✅ 2026-06-10 — Chaves adicionadas em `messages.pt.ts` e `messages.en.ts`: `user.not_found`, `user.password.confirmation.mismatch`. Demais erros reutilizam chaves existentes de register/login.

- [x] Rodar `npx tsc --noEmit` em `apps/frontend` e sinalizar ao usuário que a UI está pronta para conferência manual.
  > ✅ 2026-06-10 — `npx tsc --noEmit` em `apps/frontend` saiu código 0. UI pronta para conferência manual no navegador (login → menu Auth → Usuários).

## Resultado Esperado

- Casos de uso `save-user` e `delete-user` implementados e testados, sem alterar `register-user` nem `login-user`.
- CRUD de usuário exposto no backend via `UserController`, com cenários cobertos no `user.integration.http`.
- Listagem paginada, formulário compartilhado e exclusão com confirmação funcionando no front-end.
- Spec serve de referência para os próximos cadastros do projeto.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).

---

## Evidências consolidadas

### Arquivos criados/alterados

| Área | Arquivos |
|---|---|
| Domínio | `modules/auth/src/user/usecase/save-user.usecase.ts`, `delete-user.usecase.ts`, `usecase/index.ts` |
| Testes | `modules/auth/test/user/usecase/save-user.usecase.test.ts`, `delete-user.usecase.test.ts` |
| Backend | `apps/backend/src/modules/auth/user.controller.ts`, `user.integration.http`, `auth.module.ts` |
| Frontend | `modules/auth/services/user.service.ts`, `components/users-list.component.tsx`, `components/user-form.component.tsx`, `pages/users.page.tsx`, `pages/user-form.page.tsx`, rotas em `app/(private)/auth/users/**`, `app/(private)/layout.tsx`, i18n |

### Comandos executados

```bash
npm run build --workspace @sdd/auth          # exit 0
npm test --workspace @sdd/auth             # 66/66 pass, save/delete 100% coverage
npm run build --workspace apps/backend       # exit 0
cd apps/frontend && npx tsc --noEmit         # exit 0
```

### Checklist spec → status

| Requisito | Status |
|---|---|
| save-user (create/update por findById) | done |
| delete-user | done |
| Testes unitários com fakes | done |
| UserController `/users` autenticado | done |
| user.integration.http | done |
| Listagem paginada frontend | done |
| Formulário compartilhado + seções | done |
| Ações editar/excluir | done |
| Menu "Usuários" | done |
| i18n novas chaves | done |
| tsc frontend limpo | done |

### Desvios

- Rest Client (`user.integration.http`) não executado automaticamente nesta sessão — requer backend+DB rodando localmente; cenários documentados e prontos para execução manual.
- UI validada via `tsc` apenas; conferência visual manual conforme spec.
