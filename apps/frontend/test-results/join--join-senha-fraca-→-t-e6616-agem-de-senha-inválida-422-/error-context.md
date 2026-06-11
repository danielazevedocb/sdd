# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: join.spec.ts >> /join >> senha fraca → toast com mensagem de senha inválida (422)
- Location: e2e/join.spec.ts:54:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/join
Call log:
  - navigating to "http://localhost:3000/join", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const REGISTER_URL = '**/auth/register';
  4   | 
  5   | test.describe('/join', () => {
  6   |   test.beforeEach(async ({ page }) => {
> 7   |     await page.goto('/join');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/join
  8   |   });
  9   | 
  10  |   test('alterna entre os modos cadastro e login', async ({ page }) => {
  11  |     await expect(page.getByRole('heading', { name: 'Cadastro Base' })).toBeVisible();
  12  |     await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  13  | 
  14  |     await page.getByRole('button', { name: /Já tem conta/i }).click();
  15  | 
  16  |     await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  17  |     await expect(page.getByRole('button', { name: /Não tem conta/i })).toBeVisible();
  18  | 
  19  |     await page.getByRole('button', { name: /Não tem conta/i }).click();
  20  | 
  21  |     await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  22  |   });
  23  | 
  24  |   test('cadastro com dados válidos → toast de sucesso', async ({ page }) => {
  25  |     await page.route(REGISTER_URL, (route) =>
  26  |       route.fulfill({ status: 201, body: '' }),
  27  |     );
  28  | 
  29  |     await page.getByLabel('Nome completo').fill('João da Silva');
  30  |     await page.getByLabel('E-mail').first().fill('joao@exemplo.com');
  31  |     await page.getByLabel('Senha').first().fill('Senha@123');
  32  |     await page.getByRole('button', { name: 'Criar conta' }).click();
  33  | 
  34  |     await expect(page.getByText('Cadastro realizado com sucesso!')).toBeVisible();
  35  |   });
  36  | 
  37  |   test('e-mail já cadastrado → toast com mensagem de e-mail duplicado (409)', async ({ page }) => {
  38  |     await page.route(REGISTER_URL, (route) =>
  39  |       route.fulfill({
  40  |         status: 409,
  41  |         contentType: 'application/json',
  42  |         body: JSON.stringify({ errors: ['Email already registered'] }),
  43  |       }),
  44  |     );
  45  | 
  46  |     await page.getByLabel('Nome completo').fill('João da Silva');
  47  |     await page.getByLabel('E-mail').first().fill('duplicado@exemplo.com');
  48  |     await page.getByLabel('Senha').first().fill('Senha@123');
  49  |     await page.getByRole('button', { name: 'Criar conta' }).click();
  50  | 
  51  |     await expect(page.getByText('E-mail já cadastrado.')).toBeVisible();
  52  |   });
  53  | 
  54  |   test('senha fraca → toast com mensagem de senha inválida (422)', async ({ page }) => {
  55  |     await page.route(REGISTER_URL, (route) =>
  56  |       route.fulfill({
  57  |         status: 422,
  58  |         contentType: 'application/json',
  59  |         body: JSON.stringify({ errors: ['user.password.strong.password'] }),
  60  |       }),
  61  |     );
  62  | 
  63  |     await page.getByLabel('Nome completo').fill('João da Silva');
  64  |     await page.getByLabel('E-mail').first().fill('joao@exemplo.com');
  65  |     await page.getByLabel('Senha').first().fill('fraca');
  66  |     await page.getByRole('button', { name: 'Criar conta' }).click();
  67  | 
  68  |     await expect(
  69  |       page.getByText('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'),
  70  |     ).toBeVisible();
  71  |   });
  72  | 
  73  |   test('múltiplos erros → um toaster individual por erro', async ({ page }) => {
  74  |     await page.route(REGISTER_URL, (route) =>
  75  |       route.fulfill({
  76  |         status: 422,
  77  |         contentType: 'application/json',
  78  |         body: JSON.stringify({
  79  |           errors: [
  80  |             'user.name.person.name',
  81  |             'user.email.invalid.email',
  82  |             'user.password.strong.password',
  83  |           ],
  84  |         }),
  85  |       }),
  86  |     );
  87  | 
  88  |     await page.getByLabel('Nome completo').fill('x');
  89  |     await page.getByLabel('E-mail').first().fill('invalido@x');
  90  |     await page.getByLabel('Senha').first().fill('fraca');
  91  |     await page.getByRole('button', { name: 'Criar conta' }).click();
  92  | 
  93  |     await expect(page.getByText('Informe o nome completo (nome e sobrenome).')).toBeVisible();
  94  |     await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
  95  |     await expect(
  96  |       page.getByText('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'),
  97  |     ).toBeVisible();
  98  |   });
  99  | });
  100 | 
```