import { expect, test as base } from '@playwright/test';
import { BOOKS } from './books';

export { expect };
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/stock.json', (route) => route.fulfill({ json: BOOKS }));
    await use(page);
    expect(errors, 'Uncaught browser errors').toEqual([]);
  },
});
