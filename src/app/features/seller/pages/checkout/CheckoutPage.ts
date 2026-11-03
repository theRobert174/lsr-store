import { CurrencyPipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentOptions } from '../../components/PaymentOptions/PaymentOptions';
import { ButtonField } from '@components/atoms/ButtonField/ButtonField';
import { Sales, PaymentMethod, toCents } from '@core/services/Sales';
import { Router } from '@angular/router';
import { Cart } from '@core/services/Cart';
import { getCartSummary } from '@shared/utils/cart-summary';

@Component({
  selector: 'checkout-page',
  imports: [CurrencyPipe, RouterLink, PaymentOptions, ButtonField],
  templateUrl: './CheckoutPage.html',
  styleUrl: './CheckoutPage.css',
})
export class CheckoutPage {
  readonly #cart = inject(Cart);
  private readonly sales = inject(Sales);
  private readonly router = inject(Router);
  protected readonly method = signal<PaymentMethod>('cash');
  protected readonly cash = signal<{ received: number | null }>({ received: null });
  protected readonly processing = signal(false);
  protected readonly error = signal('');
  protected readonly canConfirm = computed(
    () =>
      this.summary().count > 0 &&
      !this.processing() &&
      (this.method() !== 'cash' ||
        (toCents(this.cash().received) ?? -1) >= this.summary().totalCents),
  );
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');

  protected readonly summary = computed(() => getCartSummary(this.#cart.cart()));

  protected async confirm(): Promise<void> {
    if (!this.canConfirm()) return;
    this.processing.set(true);
    this.error.set('');
    const sale = this.sales.complete(
      this.#cart.cart(),
      this.method(),
      toCents(this.cash().received),
    );
    if (!sale) {
      this.error.set('Revisa el carrito y el importe recibido antes de confirmar.');
      this.processing.set(false);
      return;
    }
    this.#cart.clearCart();
    await this.router.navigate(['/seller/receipt', sale.id]);
  }

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus());
  }
}
