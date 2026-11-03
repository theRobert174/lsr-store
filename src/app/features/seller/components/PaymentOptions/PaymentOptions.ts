import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';
import { form, FormField, min } from '@angular/forms/signals';
import { NgpRadioGroup, NgpRadioItem } from 'ng-primitives/radio';
import { isPaymentMethod, PaymentMethod, toCents } from '@core/services/Sales';

@Component({
  selector: 'payment-options',
  imports: [CurrencyPipe, NgpRadioGroup, NgpRadioItem, FormField],
  templateUrl: './PaymentOptions.html',
  styleUrl: './PaymentOptions.css',
})
export class PaymentOptions {
  readonly totalCents = input.required<number>();

  readonly method = model<PaymentMethod>('cash');
  readonly cash = model<{ received: number | null }>({ received: null });
  protected readonly cashForm = form(this.cash, (path) => {
    min(path.received, 0, { message: 'Ingresa un importe válido igual o mayor que cero.' });
  });
  protected readonly receivedCents = computed(() => toCents(this.cash().received));
  protected selectMethod(value: string | null | undefined): void {
    if (isPaymentMethod(value)) this.method.set(value);
  }
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
