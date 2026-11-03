import type { Book } from '../../src/app/core/models/Book';

/** Test-only inventory; the public demo always loads public/stock.json. */
export const BOOKS: readonly Book[] = [
  {
    id: 'fixture-1',
    isbn: '9788478884452',
    title: 'Harry Potter y la piedra filosofal',
    author: 'J. K. Rowling',
    copies: 5,
    availability: 'yes',
    coverUrl: null,
    price: 123.45,
    summary: 'Una aventura en una escuela de magia.',
  },
  {
    id: 'fixture-2',
    isbn: '9780307474728',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    copies: 0,
    availability: 'no',
    coverUrl: null,
    price: 200,
  },
  {
    id: 'fixture-3',
    isbn: '9780156012195',
    title: 'El principito',
    author: 'Antoine de Saint-Exupéry',
    copies: 5,
    availability: 'yes-but-not-here',
    coverUrl: null,
    price: 150,
  },
];
