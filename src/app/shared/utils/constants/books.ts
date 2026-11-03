import { Book } from "@app/core/services/Cart";

/** Preview data until the seller catalog is connected to the inventory API. */
export const DEMO_BOOKS: readonly Book[] = [
  {
    id: '1',
    title: 'Harry Potter y la piedra filosofal',
    author: 'J. K. Rowling',
    copies: 5,
    availability: 'yes',
    coverUrl: null,
    isbn: "",
    price: 123.45
  },
  {
    id: '2',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    copies: 0,
    availability: 'no',
    coverUrl: null,
    isbn: "",
    price: 123.45
  },
  {
    id: '3',
    title: 'El principito',
    author: 'Antoine de Saint-Exupéry',
    copies: 5,
    availability: 'yes-but-not-here',
    coverUrl: null,
    isbn: "",
    price: 123.45
  },
];
