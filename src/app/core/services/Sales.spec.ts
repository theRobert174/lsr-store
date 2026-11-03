import { TestBed } from '@angular/core/testing';
import { Book } from '@core/models/Book';
import { Sales, isSales, toCents } from './Sales';

const book: Book = {
  id: 'sale-book',
  isbn: '',
  title: 'Libro',
  author: 'Autor',
  copies: 5,
  availability: 'yes',
  coverUrl: null,
  price: 123.45,
};

describe('Sales', () => {
  beforeEach(() => {
    localStorage.removeItem('lsr-demo:v1:sales');
  });

  it('records an immutable price snapshot, cent totals and cash change', () => {
    const sales = TestBed.inject(Sales);
    const sale = sales.complete([{ book, quantity: 2 }], 'cash', 30000);
    expect(sale?.totalCents).toBe(24690);
    expect(sale?.changeCents).toBe(5310);
    expect(sale?.lines[0]?.book).not.toBe(book);
    expect(isSales(sales.sales())).toBe(true);
    const restored = TestBed.runInInjectionContext(() => new Sales());
    expect(restored.sales()).toEqual([sale]);
  });

  it('rejects empty carts, excessive quantities and insufficient or invalid cash', () => {
    const sales = TestBed.inject(Sales);
    expect(sales.complete([], 'cash', 50000)).toBeNull();
    expect(sales.complete([{ book, quantity: 6 }], 'cash', 100000)).toBeNull();
    for (const cash of [null, -1, 12344, NaN, Infinity, 12345.5]) {
      expect(sales.complete([{ book, quantity: 1 }], 'cash', cash)).toBeNull();
    }
    expect(sales.sales()).toEqual([]);
  });

  it.each(['card', 'transfer'] as const)(
    'simulates %s without cash or financial details',
    (method) => {
      const sale = TestBed.inject(Sales).complete([{ book, quantity: 1 }], method, null);
      expect(sale?.receivedCents).toBe(12345);
      expect(sale?.changeCents).toBe(0);
      expect(isSales([sale])).toBe(true);
    },
  );

  it('rejects corrupted totals when restoring tickets', () => {
    const sale = TestBed.inject(Sales).complete([{ book, quantity: 1 }], 'cash', 20000);
    expect(isSales([{ ...sale, totalCents: 1 }])).toBe(false);
  });

  it('converts finite positive amounts into safe integer cents', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    for (const amount of [null, -1, NaN, Infinity, Number.MAX_VALUE])
      expect(toCents(amount)).toBeNull();
  });
});
