import { test, expect, type Page } from '@playwright/test';

async function capture(page: Page, path: string): Promise<void> {
  await expect(page.locator('main')).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
  await page.screenshot({ path, animations: 'disabled' });
}

test('capturas de portafolio', async ({ page }) => {
  test.skip(
    !process.env['UPDATE_SCREENSHOTS'],
    'Run pnpm screenshots to update documentation assets',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/auth');
  await expect(page.getByRole('heading', { name: 'Explora LSR Librería' })).toBeVisible();
  await capture(page, 'docs/screenshots/auth-desktop.png');
  await page.getByRole('button', { name: 'Explorar demo', exact: true }).click();
  await expect(page.locator('book-cover')).toHaveCount(24);
  await expect(page.locator('book-cover img').first()).toBeVisible();
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), undefined, {
      timeout: 15_000,
    })
    .catch(() => undefined);
  await capture(page, 'docs/screenshots/catalog-desktop.png');
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto('/auth');
  await expect(page.getByRole('heading', { name: 'Explora LSR Librería' })).toBeVisible();
  await capture(page, 'public/images/social-preview.png');
  await page.setViewportSize({ width: 390, height: 1100 });
  await page.goto('/seller/catalog');
  await expect(page.locator('book-cover')).toHaveCount(24);
  await expect(page.getByRole('heading', { name: 'Catálogo de libros' })).toBeVisible();
  await expect(page.locator('book-cover').first()).toBeVisible();
  await expect(page.locator('book-cover img').first()).toBeVisible();
  for (const index of [0, 1]) {
    await expect(page.locator('book-cover img').nth(index)).not.toHaveClass(/image-pending/, {
      timeout: 15_000,
    });
  }
  await capture(page, 'docs/screenshots/catalog-mobile.png');
  const add = page.getByRole('button', { name: 'Agregar The Fellowship of the Ring', exact: true });
  await add.click();
  await page.getByRole('button', { name: 'Abrir carrito, 1 artículos' }).click();
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();
  await page.getByRole('radio', { name: 'Tarjeta', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await capture(page, 'docs/screenshots/checkout-desktop.png');
  await page.getByRole('button', { name: 'Confirmar venta simulada' }).click();
  await expect(page.getByRole('heading', { name: 'Venta simulada completada' })).toBeVisible();
  await capture(page, 'docs/screenshots/receipt-desktop.png');
});
