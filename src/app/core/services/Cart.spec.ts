import { TestBed } from '@angular/core/testing';
import { Book } from '@core/models/Book';
import { Cart } from './Cart';

const book: Book = {
  id: 'available',
  isbn: '',
  title: 'Libro disponible',
  author: 'Autor',
  copies: 5,
  availability: 'yes',
  coverUrl: null,
  price: 123.45,
};

describe('Cart quantity', () => {
  beforeEach(() => {
    localStorage.removeItem('lsr-demo:v1:cart');
  });

  it('updates an existing line and the count without changing other products', () => {
    const cart = TestBed.inject(Cart);
    cart.addBook(book);
    cart.addBook({ ...book, id: 'other' });
    cart.setQuantity(book.id, book.copies);
    expect(cart.cart().map((line) => line.quantity)).toEqual([5, 1]);
    expect(cart.cartCount()).toBe(6);
    cart.setQuantity(book.id, 1);
    expect(cart.cartCount()).toBe(2);
  });

  it.each([0, -1, 6, 1.5, NaN, Infinity, -Infinity])(
    'rejects invalid quantity %s without changing the cart',
    (quantity) => {
      const cart = TestBed.inject(Cart);
      cart.addBook(book);
      cart.setQuantity(book.id, quantity);
      expect(cart.cart()[0]?.quantity).toBe(1);
      expect(cart.cartCount()).toBe(1);
    },
  );

  it('does not create a line when updating an unknown product', () => {
    const cart = TestBed.inject(Cart);
    cart.setQuantity('unknown', 1);
    expect(cart.cart()).toEqual([]);
  });
});

describe('Cart availability and restoration', () => {
  beforeEach(() => {
    localStorage.removeItem('lsr-demo:v1:cart');
  });

  it('refuses unavailable copies and caps repeated additions without throwing', () => {
    const cart = TestBed.inject(Cart);
    expect(cart.addBook({ ...book, availability: 'no' })).toContain('no está disponible');
    expect(cart.addBook({ ...book, availability: 'yes-but-not-here' })).toContain(
      'no está disponible',
    );
    expect(cart.addBook({ ...book, copies: 0 })).toContain('no está disponible');
    expect(cart.cartCount()).toBe(0);
    for (let i = 0; i < 5; i++) cart.addBook(book);
    expect(cart.addBook(book)).toContain('todas las copias');
    expect(cart.cartCount()).toBe(5);
  });

  it('reconciles persisted lines with current prices and stock and removes unavailable books', () => {
    const cart = TestBed.inject(Cart);
    cart.addBook(book);
    cart.setQuantity(book.id, 5);
    cart.addBook({ ...book, id: 'removed' });
    const restored = TestBed.runInInjectionContext(() => new Cart());
    restored.reconcile([{ ...book, price: 200, copies: 2 }]);
    expect(restored.cart()).toEqual([{ book: { ...book, price: 200, copies: 2 }, quantity: 2 }]);
    restored.clearCart();
    expect(localStorage.getItem('lsr-demo:v1:cart')).toBeNull();
  });
});
