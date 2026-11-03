import { computed, inject, Service, signal } from '@angular/core';
import { Book, isBook, isRecord } from '@core/models/Book';
import { LocalPersistence } from './LocalPersistence';

export interface CartLine {
  readonly book: Book;
  readonly quantity: number;
}

export function isCartLines(value: unknown): value is readonly CartLine[] {
  return (
    Array.isArray(value) &&
    value.every(
      (line: unknown) =>
        isRecord(line) &&
        isBook(line['book']) &&
        line['book'].availability === 'yes' &&
        typeof line['quantity'] === 'number' &&
        Number.isSafeInteger(line['quantity']) &&
        line['quantity'] >= 1 &&
        line['quantity'] <= line['book'].copies,
    ) &&
    new Set(value.map((line: CartLine) => line.book.id)).size === value.length
  );
}

@Service()
export class Cart {
  private readonly persistence = inject(LocalPersistence);
  private readonly lines = signal(
    this.persistence.read<readonly CartLine[]>('cart', isCartLines, []),
  );
  readonly cart = this.lines.asReadonly();
  readonly cartCount = computed(() =>
    this.lines().reduce((total, line) => total + line.quantity, 0),
  );

  quantityFor(id: string): number {
    return this.lines().find((line) => line.book.id === id)?.quantity ?? 0;
  }

  readonly addBook = (book: Book): string => {
    if (book.availability !== 'yes' || book.copies <= 0) {
      return `${book.title} no está disponible en esta sucursal.`;
    }
    const existing = this.lines().find((line) => line.book.id === book.id);
    if ((existing?.quantity ?? 0) >= book.copies) {
      return `Ya agregaste todas las copias disponibles de ${book.title}.`;
    }
    this.save(
      existing
        ? this.lines().map((line) =>
            line.book.id === book.id ? { book, quantity: line.quantity + 1 } : line,
          )
        : [...this.lines(), { book, quantity: 1 }],
    );
    return `${book.title} agregado. Carrito: ${this.cartCount()} artículos.`;
  };

  readonly setQuantity = (id: string, quantity: number): void => {
    const line = this.lines().find((item) => item.book.id === id);
    if (!line || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > line.book.copies)
      return;
    this.save(this.lines().map((item) => (item.book.id === id ? { ...item, quantity } : item)));
  };

  readonly removeBook = (id: string): void => {
    this.save(this.lines().filter((line) => line.book.id !== id));
  };

  readonly clearCart = (): void => {
    this.lines.set([]);
    this.persistence.remove('cart');
  };

  /** Reconcile saved snapshots against the currently loaded static catalog. */
  reconcile(books: readonly Book[]): void {
    this.save(
      this.lines().flatMap((line): CartLine[] => {
        const book = books.find((item) => item.id === line.book.id);
        return book?.availability === 'yes' && book.copies > 0
          ? [{ book, quantity: Math.min(line.quantity, book.copies) }]
          : [];
      }),
    );
  }

  private save(lines: readonly CartLine[]): void {
    this.lines.set(lines);
    this.persistence.write('cart', lines);
  }
}
