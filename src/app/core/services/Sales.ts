import { inject, Service, signal } from '@angular/core';
import { isRecord } from '@core/models/Book';
import { CartLine, isCartLines } from './Cart';
import { LocalPersistence } from './LocalPersistence';
import { getCartSummary } from '@shared/utils/cart-summary';

export type PaymentMethod = 'cash' | 'card' | 'transfer';
export const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta simulada',
  transfer: 'Transferencia simulada',
};
export const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  value === 'cash' || value === 'card' || value === 'transfer';

export interface Sale {
  readonly id: string;
  readonly createdAt: string;
  readonly lines: readonly CartLine[];
  readonly method: PaymentMethod;
  readonly totalCents: number;
  readonly receivedCents: number;
  readonly changeCents: number;
}

export function toCents(value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  const cents = Math.round(value * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}

export function isSale(value: unknown): value is Sale {
  if (
    !isRecord(value) ||
    !isCartLines(value['lines']) ||
    value['lines'].length === 0 ||
    !isPaymentMethod(value['method'])
  )
    return false;
  const total = getCartSummary(value['lines']).totalCents;
  return (
    typeof value['id'] === 'string' &&
    /^LSR-[a-f0-9-]{36}$/i.test(value['id']) &&
    typeof value['createdAt'] === 'string' &&
    Number.isFinite(Date.parse(value['createdAt'])) &&
    Number.isSafeInteger(total) &&
    value['totalCents'] === total &&
    typeof value['receivedCents'] === 'number' &&
    Number.isSafeInteger(value['receivedCents']) &&
    value['receivedCents'] >= total &&
    value['changeCents'] === value['receivedCents'] - total &&
    (value['method'] === 'cash' || (value['receivedCents'] === total && value['changeCents'] === 0))
  );
}

export function isSales(value: unknown): value is readonly Sale[] {
  return (
    Array.isArray(value) &&
    value.length <= 50 &&
    value.every(isSale) &&
    new Set(value.map((sale) => sale.id)).size === value.length
  );
}

@Service()
export class Sales {
  private readonly persistence = inject(LocalPersistence);
  private readonly records = signal(this.persistence.read<readonly Sale[]>('sales', isSales, []));
  readonly sales = this.records.asReadonly();

  complete(
    lines: readonly CartLine[],
    method: PaymentMethod,
    receivedCents: number | null,
  ): Sale | null {
    const totalCents = getCartSummary(lines).totalCents;
    if (
      !isCartLines(lines) ||
      !lines.length ||
      !Number.isSafeInteger(totalCents) ||
      !isPaymentMethod(method)
    )
      return null;
    const received = method === 'cash' ? receivedCents : totalCents;
    if (received === null || !Number.isSafeInteger(received) || received < totalCents) return null;
    const sale: Sale = {
      id: `LSR-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      lines: lines.map((line) => ({ book: { ...line.book }, quantity: line.quantity })),
      method,
      totalCents,
      receivedCents: received,
      changeCents: received - totalCents,
    };
    const records = [sale, ...this.records()].slice(0, 50);
    this.records.set(records);
    this.persistence.write('sales', records);
    return sale;
  }

  clear(): void {
    this.records.set([]);
    this.persistence.remove('sales');
  }
}
