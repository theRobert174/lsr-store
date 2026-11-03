import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/seller/catalog');
  await expect(page.getByRole('heading', { name: 'Catálogo de libros' })).toBeAttached();
});

test('busca por autor sin acentos, limpia con el botón y con Escape', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Buscar por título, autor o ISBN' });
  await expect(page.locator('book-cover')).toHaveCount(3);
  await search.fill('garcia');
  await expect(page.locator('book-cover')).toHaveCount(1);
  await expect(page.locator('book-cover')).toHaveAttribute('aria-label', /Cien años/);
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(page.locator('book-cover')).toHaveCount(3);
  await search.fill('sin coincidencias');
  await expect(page.getByText('No encontramos libros para tu búsqueda.')).toBeVisible();
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(page.locator('book-cover')).toHaveCount(3);
});

test('actualiza el carrito, respeta las existencias y permite quitar libros', async ({ page }) => {
  const add = page.getByRole('button', { name: 'Agregar Harry Potter y la piedra filosofal' });
  await add.click();
  await add.click();
  const cart = page.getByRole('button', { name: 'Abrir carrito, 2 artículos' });
  await expect(cart).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agregar Cien años de soledad' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Agregar El principito' })).toBeDisabled();
  await expect(cart).toBeVisible();
  for (let i = 0; i < 3; i++) await add.click();
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: 'Abrir carrito, 5 artículos' }).click();
  const dialog = page.getByRole('dialog', { name: 'Carrito de compra' });
  await expect(dialog.getByText('Total: 5 artículos')).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Disminuir cantidad de Harry Potter y la piedra filosofal' })
    .click();
  await expect(dialog.getByText('Total: 4 artículos')).toBeVisible();
  const quantity = dialog.getByRole('spinbutton', {
    name: 'Cantidad de Harry Potter y la piedra filosofal',
  });
  await quantity.fill('1');
  await quantity.press('Tab');
  await dialog.getByRole('button', { name: 'Quitar Harry Potter y la piedra filosofal' }).click();
  await expect(dialog.getByText('Tu carrito está vacío.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir carrito, 0 artículos' })).toBeFocused();
});

test('muestra información sin agregar al carrito, cierra con Escape y regresa a auth', async ({
  page,
}) => {
  const info = page.getByRole('button', { name: 'Información de El principito' });
  await info.click();
  const dialog = page.getByRole('dialog', { name: 'El principito' });
  await expect(dialog.getByText('5 copias. Disponible en otra sucursal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(info).toBeFocused();
  await expect(page.getByRole('button', { name: 'Abrir carrito, 0 artículos' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL('/auth');
});

test('mantiene proporciones, adapta el layout y pasa AXE con los diálogos abiertos', async ({
  page,
}) => {
  const scan = async () => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(result.violations).toEqual([]);
  };
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const box = await page.locator('book-cover .cover-frame').first().boundingBox();
  if (!box) throw new Error('No se pudo medir la portada');
  expect(box.width / box.height).toBeCloseTo(3 / 4, 3);
  const username = await page.locator('catalog-toolbar .username').boundingBox();
  const basket = await page
    .getByRole('button', { name: 'Abrir carrito, 0 artículos' })
    .boundingBox();
  const search = await page.getByRole('searchbox').boundingBox();
  const logout = await page.getByRole('button', { name: 'Cerrar sesión' }).boundingBox();
  expect(basket!.x + basket!.width).toBeLessThan(search!.x);
  expect(username!.x).toBeLessThan(logout!.x);
  await scan();
  await page.getByRole('button', { name: 'Información de El principito' }).click();
  await scan();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Abrir carrito, 0 artículos' }).click();
  await scan();
});

test('contiene el foco, bloquea el scroll y permite reabrir los diálogos', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const info = page.getByRole('button', { name: 'Información de El principito' });
  const cart = page.getByRole('button', { name: 'Abrir carrito, 0 artículos' });

  for (const opener of [info, cart, info]) {
    await opener.click();
    const dialog = page.getByRole('dialog');
    const close = dialog.getByRole('button', { name: /Cerrar información|Seguir explorando/ });
    await expect(close).toBeFocused();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveCSS('overflow-y', 'auto');
    const labelId = await dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    await expect(page.locator(`[id="${labelId}"]`)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    await page
      .getByRole('button', { name: 'Información de El principito', includeHidden: true })
      .evaluate((element: HTMLElement) => element.focus());
    await expect(close).toBeFocused();
    const scroll = await page.evaluate(() => window.scrollY);
    await page.mouse.move(1, 1);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
    await page.mouse.click(1, 1);
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await close.click();
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator('app-root')).not.toHaveAttribute('aria-hidden', 'true');
  }
  expect(errors).toEqual([]);
});

test('conserva carrito, búsqueda y filtros al recargar, y restablece solo la demo', async ({
  page,
}) => {
  await page.evaluate(() => localStorage.setItem('other-project', 'keep'));
  await page.getByRole('button', { name: 'Agregar Harry Potter y la piedra filosofal' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'agregado' })).toBeVisible();
  const search = page.getByRole('searchbox');
  await search.fill('9788478884452');
  await page.getByLabel('Disponibilidad', { exact: true }).selectOption('yes');
  await page.getByLabel('Ordenar por').selectOption('price-asc');
  await expect(page).toHaveURL(/q=9788478884452.*availability=yes.*sort=price-asc/);
  await page.reload();
  await expect(search).toHaveValue('9788478884452');
  await expect(page.getByLabel('Disponibilidad', { exact: true })).toHaveValue('yes');
  await expect(page.getByLabel('Ordenar por')).toHaveValue('price-asc');
  await expect(page.getByRole('button', { name: 'Abrir carrito, 1 artículos' })).toBeVisible();
  await page.getByRole('button', { name: 'Restablecer demo' }).click();
  await expect(page).toHaveURL('/seller/catalog');
  await expect(search).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Abrir carrito, 0 artículos' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('other-project'))).toBe('keep');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Abrir carrito, 0 artículos' })).toBeVisible();
});

test('recupera un error al cargar el catálogo', async ({ page }) => {
  await page.route('**/stock.json', (route) => route.fulfill({ status: 500, body: 'Unavailable' }));
  await page.reload();
  await expect(page.getByRole('alert')).toHaveText(
    'No pudimos cargar el catálogo. Intenta de nuevo.',
  );
  await page.unroute('**/stock.json');
  const { BOOKS } = await import('./fixtures/books');
  await page.route('**/stock.json', (route) => route.fulfill({ json: BOOKS }));
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.locator('book-cover')).toHaveCount(3);
});

test('muestra catálogo vacío y rechaza datos de inventario inválidos', async ({ page }) => {
  await page.route('**/stock.json', (route) => route.fulfill({ json: [] }));
  await page.reload();
  await expect(page.getByText('No hay libros en el catálogo.', { exact: true })).toBeVisible();
  await page.route('**/stock.json', (route) => route.fulfill({ json: [{ id: 'bad', price: -1 }] }));
  await page.reload();
  await expect(page.getByRole('alert')).toHaveText(
    'No pudimos cargar el catálogo. Intenta de nuevo.',
  );
});
