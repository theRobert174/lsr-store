import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('abre el resumen, conserva los importes y permite elegir la forma de pago', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/seller/catalog');
  const add = page.getByRole('button', { name: 'Agregar Harry Potter y la piedra filosofal' });
  await add.click();
  await add.click();
  await page.getByRole('button', { name: 'Abrir carrito, 2 artículos' }).click();
  const dialog = page.getByRole('dialog', { name: 'Carrito de compra' });
  const back = await dialog.getByRole('button', { name: 'Seguir explorando' }).boundingBox();
  const pay = dialog.getByRole('button', { name: 'Pagar', exact: true });
  const payBox = await pay.boundingBox();
  expect(payBox!.x).toBeGreaterThan(back!.x);
  await expect(dialog.getByText('$246.90').last()).toBeVisible();
  await pay.click();
  await expect(page).toHaveURL('/seller/checkout');
  await expect(page.getByRole('heading', { name: 'Resumen de compra', exact: true })).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('app-root')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(
    page.getByRole('heading', { name: 'Harry Potter y la piedra filosofal' }),
  ).toBeVisible();
  await expect(page.getByText('2 artículos', { exact: true })).toBeVisible();
  const totals = page.getByRole('complementary', { name: 'Total de tu compra' });
  await expect(totals.getByText('$246.90 MXN')).toBeVisible();
  const cash = page.getByRole('spinbutton', { name: 'Importe recibido (MXN)' });
  await cash.fill('200');
  await expect(page.getByText('Importe pendiente')).toBeVisible();
  await expect(page.getByText('$46.90', { exact: true })).toBeVisible();
  await cash.fill('300');
  await expect(page.getByText('Cambio a entregar')).toBeVisible();
  await expect(page.getByText('$53.10', { exact: true })).toBeVisible();
  await cash.fill('-1');
  await expect(cash).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Ingresa un importe válido igual o mayor que cero.')).toBeVisible();
  await cash.fill('246.90');
  await expect(page.getByText('$0.00', { exact: true })).toBeVisible();

  const scan = async () => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(result.violations).toEqual([]);
  };
  await scan();
  await page.getByRole('radio', { name: 'Tarjeta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pago con tarjeta' })).toBeVisible();
  await scan();
  await page.getByRole('radio', { name: 'Tarjeta', exact: true }).press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Transferencia', exact: true })).toBeChecked();
  await expect(page.getByRole('heading', { name: 'Transferencia bancaria' })).toBeVisible();
  await scan();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/tmp/checkout-${test.info().project.name}.png`, fullPage: true });
  await totals.getByRole('link', { name: 'Seguir comprando' }).click();
  await expect(page).toHaveURL('/seller/catalog');
  await expect(page.getByRole('button', { name: 'Abrir carrito, 2 artículos' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('muestra un estado vacío y no permite pagar sin artículos', async ({ page }) => {
  await page.goto('/seller/checkout');
  await expect(page.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeVisible();
  await expect(page.getByRole('radiogroup')).toHaveCount(0);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole('link', { name: 'Explorar libros' }).click();
  await page.getByRole('button', { name: 'Abrir carrito, 0 artículos' }).click();
  await expect(page.getByRole('button', { name: 'Pagar', exact: true })).toHaveCount(0);
});
