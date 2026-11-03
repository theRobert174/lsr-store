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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isBook(value: unknown): value is Book {
  if (!isRecord(value)) return false;
  return (
    typeof value['id'] === 'string' &&
    value['id'].length > 0 &&
    typeof value['isbn'] === 'string' &&
    typeof value['title'] === 'string' &&
    value['title'].length > 0 &&
    typeof value['author'] === 'string' &&
    typeof value['copies'] === 'number' &&
    Number.isSafeInteger(value['copies']) &&
    value['copies'] >= 0 &&
    ['yes', 'no', 'yes-but-not-here'].includes(String(value['availability'])) &&
    (value['coverUrl'] === null || typeof value['coverUrl'] === 'string') &&
    typeof value['price'] === 'number' &&
    Number.isFinite(value['price']) &&
    value['price'] >= 0 &&
    Number.isSafeInteger(Math.round(value['price'] * 100)) &&
    (value['summary'] === undefined || typeof value['summary'] === 'string')
  );
}

export function isBookList(value: unknown): value is readonly Book[] {
  return (
    Array.isArray(value) &&
    value.every(isBook) &&
    new Set(value.map((book) => book.id)).size === value.length
  );
}
