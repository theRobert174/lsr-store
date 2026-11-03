import { TestBed } from '@angular/core/testing';
import { Book, Cart } from './Cart';

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
