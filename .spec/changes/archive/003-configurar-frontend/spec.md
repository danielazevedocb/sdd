# 003-configurar-frontend

## Objetivo

Configurar os componentes básicos da aplicação front-end, estabelecendo a estrutura compartilhada e as rotas Next.js para as áreas pública e privada.

## Contexto Técnico

- Skill única de execução: [frontend-next-config](../../../.claude/skills/frontend-next-config).
- A skill detecta automaticamente o projeto frontend existente e aplica a configuração padronizada.
- Não há decisões de negócio envolvidas — é uma tarefa exclusivamente de infraestrutura de front-end.

## Referências de Projeto

- [Produto](../../memory/produto.md)
- [Contexto técnico global](../../memory/contexto-tecnico.md)
- [Estrutura do projeto](../../memory/estrutura.md)

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

## Observações Locais

Nenhuma regra específica além do que a skill já encapsula.

## Tasks

### Tasks - Front-end

- [x] Executar a skill [frontend-next-config](../../../.claude/skills/frontend-next-config) para configurar a estrutura compartilhada (`shared/`) e as rotas Next.js com grupos public/private e sidebar de navegação.
  > ✅ 2026-06-10 19:45 — Skill executada em todas as 9 fases. `shared/` criada com componentes UI, context, hooks, i18n, lib, template, types e navigation. Rotas `(public)` e `(private)` configuradas com `layout.tsx` e sidebar. Dependências instaladas via npm workspaces (hoist para root). Dois erros de compatibilidade com `react-day-picker` v10 corrigidos automaticamente: `caption` → `month_caption` em `calendar.tsx` e remoção de `initialFocus` em `date-picker-input.tsx`. Build OK após 2 correções automáticas (`✓ Compiled successfully`, 7 páginas geradas).

## Resultado Esperado

- Pasta `shared/` criada com os componentes e utilitários base do front-end.
- Grupos de rotas `(public)` e `(private)` configurados no Next.js com sidebar de navegação funcional.
- Aplicação front-end inicializa sem erros após a configuração.

## Encerramento

Esta spec termina apenas quando todos os itens estiverem marcados e com evidência registrada, no formato definido em [Como executar](../../shared/como-executar.md).
