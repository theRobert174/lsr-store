import { CurrencyPipe } from '@angular/common';
import { afterNextRender, Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentOptions } from '../../components/PaymentOptions/PaymentOptions';
import { Cart } from '@core/services/Cart';
import { getCartSummary } from '@shared/utils/cart-summary';

@Component({
  selector: 'checkout-page',
  imports: [CurrencyPipe, RouterLink, PaymentOptions],
  templateUrl: './CheckoutPage.html',
  styleUrl: './CheckoutPage.css',
})
export class CheckoutPage {
  readonly #cart = inject(Cart);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');

  protected readonly summary = computed(() => getCartSummary(this.#cart.cart()));

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus());
  }
}
