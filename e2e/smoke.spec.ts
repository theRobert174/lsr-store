import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Intentionally uses the real stock.json instead of the test inventory.
test('carga el catálogo real, agrega resultados y resuelve rutas directas al recargar', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Avoid a third-party image service affecting functional / accessibility checks.
  await page.route('https://covers.openlibrary.org/**', (route) => route.abort());
  const response = await request.get('/stock.json');
  expect(response.ok()).toBe(true);
  const books: unknown = await response.json();
  expect(Array.isArray(books)).toBe(true);
  if (!Array.isArray(books)) throw new Error('Expected an inventory array');
  expect(books).toHaveLength(100);
  const direct = await page.goto('/seller/catalog');
  expect(direct?.status()).toBe(200);
  await expect(page.locator('book-cover')).toHaveCount(24);
  await page.getByRole('button', { name: 'Cargar más', exact: true }).click();
  await expect(page.locator('book-cover')).toHaveCount(48);
  await expect(page.locator('#catalog-books > li').nth(24)).toBeFocused();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.reload();
  await expect(page.locator('book-cover')).toHaveCount(24);
  await page.goto('/seller/checkout');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeVisible();
  await page.goto('/seller/receipt/not-found');
  await expect(page.getByRole('heading', { name: 'Ticket no disponible' })).toBeVisible();
  expect(errors).toEqual([]);
});
