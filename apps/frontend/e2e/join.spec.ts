import { test, expect } from '@playwright/test';

const REGISTER_URL = '**/auth/register';

test.describe('/join', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
  });

  test('alterna entre os modos cadastro e login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cadastro Base' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();

    await page.getByRole('button', { name: /Já tem conta/i }).click();

    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Não tem conta/i })).toBeVisible();

    await page.getByRole('button', { name: /Não tem conta/i }).click();

    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  });

  test('cadastro com dados válidos → toast de sucesso', async ({ page }) => {
    await page.route(REGISTER_URL, (route) =>
      route.fulfill({ status: 201, body: '' }),
    );

    await page.getByLabel('Nome completo').fill('João da Silva');
    await page.getByLabel('E-mail').first().fill('joao@exemplo.com');
    await page.getByLabel('Senha').first().fill('Senha@123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Cadastro realizado com sucesso!')).toBeVisible();
  });

  test('e-mail já cadastrado → toast com mensagem de e-mail duplicado (409)', async ({ page }) => {
    await page.route(REGISTER_URL, (route) =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ errors: ['Email already registered'] }),
      }),
    );

    await page.getByLabel('Nome completo').fill('João da Silva');
    await page.getByLabel('E-mail').first().fill('duplicado@exemplo.com');
    await page.getByLabel('Senha').first().fill('Senha@123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('E-mail já cadastrado.')).toBeVisible();
  });

  test('senha fraca → toast com mensagem de senha inválida (422)', async ({ page }) => {
    await page.route(REGISTER_URL, (route) =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ errors: ['user.password.strong.password'] }),
      }),
    );

    await page.getByLabel('Nome completo').fill('João da Silva');
    await page.getByLabel('E-mail').first().fill('joao@exemplo.com');
    await page.getByLabel('Senha').first().fill('fraca');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(
      page.getByText('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'),
    ).toBeVisible();
  });

  test('múltiplos erros → um toaster individual por erro', async ({ page }) => {
    await page.route(REGISTER_URL, (route) =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            'user.name.person.name',
            'user.email.invalid.email',
            'user.password.strong.password',
          ],
        }),
      }),
    );

    await page.getByLabel('Nome completo').fill('x');
    await page.getByLabel('E-mail').first().fill('invalido@x');
    await page.getByLabel('Senha').first().fill('fraca');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Informe o nome completo (nome e sobrenome).')).toBeVisible();
    await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
    await expect(
      page.getByText('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'),
    ).toBeVisible();
  });
});
