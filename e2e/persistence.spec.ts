import { expect, test } from './fixtures/test';

for (const raw of [
  '{broken',
  '{"version":9,"data":[]}',
  '{"version":1,"data":[{"quantity":999}]}',
]) {
  test(`recupera el carrito local inválido: ${raw}`, async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate((data) => localStorage.setItem('lsr-demo:v1:cart', data), raw);
    await page.goto('/seller/catalog');
    await expect(page.getByRole('button', { name: 'Abrir carrito, 0 artículos' })).toBeVisible();
    await expect(page.getByText(/Se restablecieron datos locales/)).toBeVisible();
  });
}

test('permite vender cuando el navegador bloquea localStorage', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/seller/catalog');
  await expect(page.getByText(/El navegador no permite guardar datos/)).toBeVisible();
  await page.getByRole('button', { name: 'Agregar Harry Potter y la piedra filosofal' }).click();
  await page.getByRole('button', { name: 'Abrir carrito, 1 artículos' }).click();
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();
  await page.getByRole('radio', { name: 'Tarjeta', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar venta simulada' }).click();
  await expect(page.getByRole('heading', { name: 'Venta simulada completada' })).toBeVisible();
});
