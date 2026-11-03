import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Explora LSR Librería' })).toBeVisible();
});

test('abre auth como página inicial con campos accesibles y sin errores', async ({ page }) => {
  await expect(page).toHaveURL('/auth');
  await expect(page.getByLabel('Usuario', { exact: true })).toHaveValue('user1');
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveValue('password1');
  await expect(page).toHaveTitle('Explora la demo | LSR Librería');
  await expect(page.getByLabel('Usuario', { exact: true })).toHaveAttribute(
    'autocomplete',
    'username',
  );
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveAttribute('type', 'password');
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveAttribute(
    'autocomplete',
    'current-password',
  );
  await expect(page.getByRole('button', { name: 'Probar acceso simulado' })).toBeEnabled();
  await expect(page.getByText('Ingresa tu usuario.', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Ingresa tu contraseña.', { exact: true })).toHaveCount(0);
});

test('permite acceder directamente a auth y recupera rutas desconocidas', async ({ page }) => {
  await page.goto('/auth');
  await expect(page.getByLabel('Usuario', { exact: true })).toBeVisible();
  await page.goto('/ruta-inexistente');
  await expect(page).toHaveURL('/auth');
  await expect(page.getByRole('heading', { name: 'Explora LSR Librería' })).toBeVisible();
});

test('valida ambos campos vacíos y enfoca el usuario', async ({ page }) => {
  await page.getByLabel('Usuario', { exact: true }).fill('');
  await page.getByLabel('Contraseña', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Probar acceso simulado' }).click();
  await expect(page.getByText('Ingresa tu usuario.', { exact: true })).toBeVisible();
  await expect(page.getByText('Ingresa tu contraseña.', { exact: true })).toBeVisible();
  const username = page.getByLabel('Usuario', { exact: true });
  await expect(username).toBeFocused();
  await expect(username).toHaveAttribute('aria-invalid', 'true');
  await expect(username).toHaveAccessibleDescription('Ingresa tu usuario.');
  await expect(page.getByText(/El servicio de acceso/)).toHaveCount(0);
});

test('valida al salir del campo y elimina el error al corregirlo', async ({ page }) => {
  const username = page.getByLabel('Usuario', { exact: true });
  await username.fill('');
  await username.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByText('Ingresa tu usuario.', { exact: true })).toBeVisible();
  await username.fill('librero');
  await expect(page.getByText('Ingresa tu usuario.', { exact: true })).toHaveCount(0);
  await expect(username).not.toHaveAttribute('aria-invalid', 'true');
});

test('acepta un usuario sin formato de correo y enfoca la contraseña faltante', async ({
  page,
}) => {
  await page.getByLabel('Usuario', { exact: true }).fill('librero');
  await page.getByLabel('Contraseña', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Probar acceso simulado' }).click();
  await expect(page.getByText('Ingresa tu usuario.', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Ingresa tu contraseña.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Contraseña', { exact: true })).toBeFocused();
  await expect(page.getByText(/El servicio de acceso/)).toHaveCount(0);
});

test('recorre el formulario con teclado y permite enviar con Enter', async ({ page }) => {
  const username = page.getByLabel('Usuario', { exact: true });
  const password = page.getByLabel('Contraseña', { exact: true });
  const submit = page.getByRole('button', { name: 'Probar acceso simulado' });
  await page.getByRole('button', { name: 'Explorar demo', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(username).toBeFocused();
  await username.fill('librero');
  await page.keyboard.press('Tab');
  await expect(password).toBeFocused();
  await password.fill('clave-de-prueba');
  await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/seller/catalog');
});

test('abre el catálogo con las credenciales precargadas al hacer clic en login', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Probar acceso simulado' }).click();
  await expect(page).toHaveURL('/seller/catalog');
});

test('distribuye el layout en escritorio y adapta el formulario a móvil', async ({
  page,
  isMobile,
}) => {
  const panel = page.getByRole('region', { name: 'Acceso a tu cuenta' });
  const scene = page.getByRole('region', { name: 'LSR Librería, punto de venta' });
  await expect(panel).toBeVisible();
  if (isMobile) {
    await expect(scene).toBeHidden();
  } else {
    await expect(scene).toBeVisible();
    const sceneBox = await scene.boundingBox();
    const panelBox = await panel.boundingBox();
    if (!sceneBox || !panelBox) throw new Error('No se pudo medir el layout');
    expect(sceneBox.width / (sceneBox.width + panelBox.width)).toBeCloseTo(0.7, 2);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('pasa AXE al cargar y al mostrar errores de validación', async ({ page }) => {
  const scan = () =>
    new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
  expect((await scan()).violations).toEqual([]);
  await page.getByLabel('Usuario', { exact: true }).fill('');
  await page.getByLabel('Contraseña', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Probar acceso simulado' }).click();
  await expect(page.getByText('Ingresa tu usuario.', { exact: true })).toBeVisible();
  expect((await scan()).violations).toEqual([]);
});
