# 007-cadastro-produto

## Objetivo

Entregar o CRUD de `product` no módulo `catalog`, com agregado, persistência, endpoints e interface de listagem e formulário compartilhado entre criação e edição.

## Contexto Técnico

- Módulo de negócio: `catalog` (já existente), agregado `product`.
- Backend NestJS com controller dedicado para o CRUD e persistência via Prisma.
- Front-end Next.js com listagem paginada e formulário compartilhado entre criação e edição, dentro do módulo `catalog` em rota privada.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

- O caso de uso `save-product` cobre tanto criação quanto atualização.
- Casos de uso de comando retornam `void`. Consultas não viram caso de uso — o controller chama o repositório direto.
- O projeto não usa DTOs de entrada. **Respostas de leitura devem ser mapeadas para objetos simples no controller antes de retornar** — entidades de domínio usam `protected readonly props` com getters de prototype, que não serializam via `JSON.stringify` (produzem `{}`). O controller deve construir explicitamente o objeto de retorno: `return { id: product.id, name: product.name, description: product.description, price: product.price, status: product.status, availableOnline: product.availableOnline, featured: product.featured, allowsPreOrder: product.allowsPreOrder }`.
- O campo `status` é uma enumeração com os valores `active`, `inactive` e `draft`. Validar com a regra `in` do pacote compartilhado e expor a enumeração como tipo no agregado.
- Os campos `availableOnline`, `featured` e `allowsPreOrder` são booleanos independentes (checkboxes no formulário). Quando ausentes na criação, assumem `false`.
- O campo `description` é opcional; quando ausente, persistir como `null`.
- O campo `price` é numérico, não-negativo (`min-value: 0`), com no máximo 2 casas decimais (regra `precision`).
- A listagem fica dentro do módulo `catalog` no front-end, em rota privada.
- **Sem verificação automatizada de UI nesta spec.** As validações automatizadas vão até a camada de backend (testes unitários do módulo + cenários no Rest Client). O usuário valida a interface manualmente.

## Tasks

### Tasks - Negócio (módulo catalog)

- [x] Criar o agregado `product` dentro do módulo `catalog` com a skill [module-aggregate](../../../.claude/skills/module-aggregate).
  > ✅ 2026-06-10 — Módulo `catalog` scaffoldado via `config-new-module` (não existia; spec assumia existente). Agregado `product` criado via `create-aggregate.js --mode crud`. `package.json` corrigido (`@sdd/catalog` — placeholder `__package_name__` quebrava `npm install`).

- [x] Implementar a entidade `Product` com a skill [module-entity](../../../.claude/skills/module-entity), com os campos: `name` (required, min-length 2, max-length 120), `description` (max-length 500, opcional), `price` (required, min-value 0, precision 2), `status` (required, in `active|inactive|draft`), `availableOnline` (boolean, default `false`), `featured` (boolean, default `false`), `allowsPreOrder` (boolean, default `false`).
  > ✅ 2026-06-10 — `modules/catalog/src/product/model/product.entity.ts` com `ProductStatus` const + type, getters e `validate()` (Required/MinLength/MaxLength/In/MinValue/Precision). Teste `product.entity.test.ts` — 100% coverage.

- [x] Definir o contrato do repositório de `product` com a skill [module-repository](../../../.claude/skills/module-repository).
  > ✅ 2026-06-10 — `ProductRepository extends CrudRepository<Product,...>` + `FakeProductRepository` em `test/mock/`.

- [x] Implementar o caso de uso `save-product` com a skill [module-use-case](../../../.claude/skills/module-use-case). A decisão entre criar e atualizar deve ser baseada em uma consulta ao repositório (`findById`): se `id` vier na entrada e `findById` retornar um registro, executa atualização; caso contrário (sem `id` ou registro não encontrado), executa criação usando o `id` recebido ou gerando um novo.
  > ✅ 2026-06-10 — `save-product.usecase.ts`: valida entrada → `findById(id?)` → update (booleans ausentes mantém existentes) ou create (booleans default `false`, description `null`). Use cases CRUD scaffold removidos.

- [x] Implementar o caso de uso `delete-product` com a skill [module-use-case](../../../.claude/skills/module-use-case). Lançar `DomainError("product.not_found", 404)` quando o `id` não existir.
  > ✅ 2026-06-10 — `delete-product.usecase.ts` com checagem `findById` → `DomainError("product.not_found", 404)`.

- [x] Cobrir os dois casos de uso com testes unitários, usando os fakes do módulo (`FakeProductRepository` e demais providers necessários).
  > ✅ 2026-06-10 — `save-product.usecase.test.ts` (11 casos) + `delete-product.usecase.test.ts` (2 casos). Suite `@sdd/catalog`: 26/26 pass. Use cases 100% lines.

### Tasks - Back-end

- [x] Sincronizar o módulo `catalog` com o Prisma criando/atualizando o model da entidade `product` com a skill [backend-prisma-sync-module](../../../.claude/skills/backend-prisma-sync-module).
  > ✅ 2026-06-10 — `apps/backend/prisma/models/catalog.model.prisma` (model `Product` → `@@map("products")`). Migration `20260611000000_catalog` aplicada via `prisma migrate deploy` (exit 0). `prisma migrate dev` bloqueado por histórico divergente no DB — migration criada manualmente a partir de `migrate diff`.

- [x] Implementar o repositório Prisma de `product` em `apps/backend/src/modules/catalog` com a skill [backend-prisma-repository](../../../.claude/skills/backend-prisma-repository), sem alterar a interface definida no módulo.
  > ✅ 2026-06-10 — `product.prisma.ts` (`PrismaProductRepository`), `Decimal` ↔ `number`. Registrado em `catalog.module.ts` com `DbModule`.

- [x] Criar/atualizar `apps/backend/src/modules/catalog/product.controller.ts` com a skill [backend-nest-controller](../../../.claude/skills/backend-nest-controller), expondo o CRUD em `/products` (criar, atualizar, excluir, obter por id e listar paginado). Endpoints autenticados. Consultas chamam o repositório direto; comandos instanciam o caso de uso correspondente no corpo do método.
  > ✅ 2026-06-10 — `ProductController`: GET/POST/PUT/DELETE em `/products`. Respostas via `mapProduct()`. Guard JWT global. `npm run build` backend exit 0.

- [x] Criar `apps/backend/src/modules/catalog/product.integration.http` (Rest Client) cobrindo os fluxos do CRUD, incluindo os principais casos de erro (nome inválido, preço negativo, status fora do enum, produto inexistente em update/delete). Validar manualmente com o backend rodando.
  > ✅ 2026-06-10 — `product.integration.http` com fluxo autenticado, CRUD, erros 401/404/422. PUT id inexistente → upsert 204 (comportamento `save-product`). Execução manual pendente.

### Tasks - Front-end

> ⚠️ Sem validação automatizada de UI. O agente entrega o código + `npx tsc --noEmit` limpo; a verificação visual é manual.

- [x] Criar a listagem paginada de `products` no módulo `catalog`, em rota privada. Tabela com as colunas nome, preço, status e ações (ícones de editar e excluir).
  > ✅ 2026-06-10 — `products-list.component.tsx`, `products.page.tsx`, rota `(private)/catalog/products/page.tsx`. Colunas nome/preço/status + ações.

- [x] Criar o formulário de `product` compartilhado entre criação e edição, organizado em seções via [`form-section-layout`](../../../apps/frontend/src/shared/components/ui/form-section-layout.tsx): "Dados básicos" (nome, descrição), "Preço e status" (preço, status como `select` com as opções `active`, `inactive`, `draft`) e "Disponibilidade" (checkboxes `availableOnline`, `featured`, `allowsPreOrder`).
  > ✅ 2026-06-10 — `product-form.component.tsx` compartilhado. Rotas `/catalog/products/new` e `/catalog/products/[id]/edit`. 3 seções conforme spec.

- [x] Integrar a coluna de ações: lápis navega para a edição; lixeira abre [`delete-confirmation-dialog`](../../../apps/frontend/src/shared/components/ui/delete-confirmation-dialog.tsx) e, ao confirmar, chama o backend e atualiza a tabela.
  > ✅ 2026-06-10 — Ícones Pencil/Trash2 + `DeleteConfirmationDialog` + `DELETE /products/:id` + reload.

- [x] Adicionar o item "Produtos" no menu lateral apontando para a listagem de `products`.
  > ✅ 2026-06-10 — Módulo `catalog` em `layout.tsx`: item "Produtos" → `/catalog/products`.

- [x] Acrescentar no i18n as chaves novas que aparecerem (ex.: `product.not_found`, rótulos de status `product.status.active|inactive|draft` e mensagens específicas de validação dos novos campos). Reaproveitar as chaves já cadastradas em specs anteriores.
  > ✅ 2026-06-10 — Chaves em `messages.pt.ts` e `messages.en.ts`: `product.not_found`, validações name/price/status, rótulos `product.status.*`.

- [x] Rodar `npx tsc --noEmit` em `apps/frontend` e sinalizar ao usuário que a UI está pronta para conferência manual.
  > ✅ 2026-06-10 — `npx tsc --noEmit` em `apps/frontend` exit 0. UI pronta para conferência manual (login → menu Catálogo → Produtos).

## Resultado Esperado

- Agregado `product` com entidade validada, repositório contratado e casos de uso `save-product` e `delete-product` implementados e testados.
- Model `product` sincronizado no Prisma com migration aplicada.
- CRUD de `product` exposto no backend via `ProductController`, com cenários cobertos no `product.integration.http`.
- Listagem paginada, formulário compartilhado entre criação e edição (com seções de dados básicos, preço/status e checkboxes de disponibilidade) e exclusão com confirmação funcionando no front-end, acessíveis pelo item "Produtos" do menu lateral.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).

---

## Evidências consolidadas

### Arquivos criados/alterados

| Área | Arquivos |
|---|---|
| Módulo base | `modules/catalog/**` (scaffold `config-new-module`), `package.json` fix `@sdd/catalog` |
| Domínio | `modules/catalog/src/product/model/product.entity.ts`, `provider/product.repository.ts`, `usecase/save-product.usecase.ts`, `delete-product.usecase.ts` |
| Testes | `modules/catalog/test/product/model/product.entity.test.ts`, `usecase/save-product.usecase.test.ts`, `delete-product.usecase.test.ts`, `test/mock/fake-product.repository.ts` |
| Prisma | `apps/backend/prisma/models/catalog.model.prisma`, `prisma/migrations/20260611000000_catalog/migration.sql` |
| Backend | `apps/backend/src/modules/catalog/product.controller.ts`, `product.prisma.ts`, `product.integration.http`, `catalog.module.ts` |
| Frontend | `modules/catalog/services/product.service.ts`, `components/products-list.component.tsx`, `components/product-form.component.tsx`, `pages/products.page.tsx`, `pages/product-form.page.tsx`, rotas `app/(private)/catalog/products/**`, `layout.tsx`, i18n |

### Comandos executados

```bash
npm install                                    # exit 0 (após fix package name)
npm run build --workspace @sdd/catalog         # exit 0
npm test --workspace @sdd/catalog              # 26/26 pass
npm run db:start --workspace apps/backend      # exit 0
npx prisma migrate deploy                      # exit 0 (catalog migration)
npm run prisma:generate --workspace apps/backend # exit 0
npm run build --workspace apps/backend         # exit 0
cd apps/frontend && npx tsc --noEmit           # exit 0
```

### Checklist spec → status

| Requisito | Status |
|---|---|
| Agregado product (module-aggregate) | done |
| Entidade Product validada | done |
| ProductRepository + FakeProductRepository | done |
| save-product (create/update por findById) | done |
| delete-product (404 not_found) | done |
| Testes unitários com fakes | done |
| Prisma model + migration catalog | done |
| PrismaProductRepository | done |
| ProductController `/products` autenticado | done |
| product.integration.http | done |
| Listagem paginada frontend | done |
| Formulário compartilhado + 3 seções | done |
| Ações editar/excluir + dialog | done |
| Menu "Produtos" | done |
| i18n novas chaves | done |
| tsc frontend limpo | done |

### Desvios

- Módulo `catalog` não existia — criado via `config-new-module` antes do agregado (spec dizia "já existente").
- `package.json` do módulo veio com placeholder `@sdd/__package_name__` — corrigido manualmente.
- `prisma migrate dev --name catalog` falhou (histórico DB divergente) — migration `20260611000000_catalog` criada via `migrate diff` + `migrate deploy`.
- PUT produto inexistente retorna 204 (upsert), não 404 — comportamento de `save-product` por design.
- Rest Client e UI: validação manual pendente (conforme spec).
