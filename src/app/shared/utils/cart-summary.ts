import { CartLine } from '@app/core/services/Cart';

/** Round each unit price once and keep all subsequent arithmetic in cents. */
export function getCartSummary(lines: readonly CartLine[]) {
  const rows = lines.map((line) => {
    const unitPriceCents = Math.round(line.book.price * 100);
    return {
      ...line,
      unitPriceCents,
      subtotalCents: unitPriceCents * line.quantity,
    };
  });
  return {
    rows,
    count: rows.reduce((count, row) => count + row.quantity, 0),
    totalCents: rows.reduce((total, row) => total + row.subtotalCents, 0),
  };
}
