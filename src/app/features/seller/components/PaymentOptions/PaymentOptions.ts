import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { form, FormField, min } from '@angular/forms/signals';
import { NgpRadioGroup, NgpRadioItem } from 'ng-primitives/radio';

@Component({
  selector: 'payment-options',
  imports: [CurrencyPipe, NgpRadioGroup, NgpRadioItem, FormField],
  templateUrl: './PaymentOptions.html',
  styleUrl: './PaymentOptions.css',
})
export class PaymentOptions {
  readonly totalCents = input.required<number>();

  protected readonly paymentMethod = signal<string | null>('cash');
  protected readonly cash = signal<{ received: number | null }>({ received: null });
  protected readonly cashForm = form(this.cash, (path) => {
    min(path.received, 0, { message: 'Ingresa un importe válido igual o mayor que cero.' });
  });
  protected readonly receivedCents = computed(() => {
    const received = this.cash().received;
    return received !== null && Number.isFinite(received) && received >= 0
      ? Math.round(received * 100)
      : null;
  });
  protected readonly invalidCash = computed(
    () => this.cash().received !== null && this.receivedCents() === null,
  );
  protected readonly changeCents = computed(() =>
    Math.max(0, (this.receivedCents() ?? 0) - this.totalCents()),
  );
  protected readonly remainingCents = computed(() =>
    Math.max(0, this.totalCents() - (this.receivedCents() ?? 0)),
  );
}
