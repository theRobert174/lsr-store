import { computed, Service, signal } from '@angular/core';

export type BookAvailability = 'yes' | 'no' | 'yes-but-not-here';

export interface Book {
  readonly id: string;
  readonly isbn: string;
  readonly title: string;
  readonly author: string;
  readonly copies: number;
  readonly availability: BookAvailability;
  readonly coverUrl: string | null;
  readonly price: number;
  readonly summary?: string;
}

export const availabilityLabels: Record<BookAvailability, string> = {
  yes: 'Disponible aquí',
  no: 'No disponible',
  'yes-but-not-here': 'Disponible en otra sucursal',
};

export interface CartLine {
  readonly book: Book;
  readonly quantity: number;
}

@Service()
export class Cart {
  #cart = signal<readonly CartLine[]>([]);
  readonly cart = this.#cart.asReadonly();
  readonly cartCount = computed(() =>
    this.#cart().reduce((total, { quantity }) => total + quantity, 0),
  );

  readonly addBook = (book: Book) => {
    if (book.availability !== 'yes' || book.copies <= 0) {
      throw new Error(`${book.title} no está disponible en esta sucursal.`);
    }
    const existing = this.#cart().find((line) => line.book.id === book.id);
    if ((existing?.quantity ?? 0) >= book.copies) {
      throw new Error(`Ya agregaste todas las copias disponibles de ${book.title}.`);
    }
    this.#cart.update((lines) =>
      existing
        ? lines.map((line) =>
            line.book.id === book.id ? { ...line, quantity: line.quantity + 1 } : line,
          )
        : [...lines, { book, quantity: 1 }],
    );
  };

  readonly setQuantity = (id: string, quantity: number) => {
    const line = this.#cart().find((line) => line.book.id === id);
    if (
      !line ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > line.book.copies ||
      line.book.availability !== 'yes'
    ) {
      return;
    }
    this.#cart.update((lines) =>
      lines.map((line) => (line.book.id === id ? { ...line, quantity } : line)),
    );
  };

  readonly removeBook = (id: string) => {
    this.#cart.update((lines) => lines.filter((line) => line.book.id !== id));
  };

  readonly clearCart = () => this.#cart.set([]);
}
