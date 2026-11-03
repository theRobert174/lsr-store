import { CurrencyPipe, DatePipe, DOCUMENT } from '@angular/common';
import { afterNextRender, Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Sales, paymentLabels } from '@core/services/Sales';
import { getCartSummary } from '@shared/utils/cart-summary';
import { ButtonField } from '@components/atoms/ButtonField/ButtonField';

@Component({
  selector: 'receipt-page',
  imports: [CurrencyPipe, DatePipe, RouterLink, ButtonField],
  templateUrl: './ReceiptPage.html',
  styleUrl: './ReceiptPage.css',
})
export class ReceiptPage {
  private readonly sales = inject(Sales);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly document = inject(DOCUMENT);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');
  protected readonly sale = computed(() =>
    this.sales.sales().find((sale) => sale.id === this.params().get('id')),
  );
  protected readonly summary = computed(() => getCartSummary(this.sale()?.lines ?? []));
  protected readonly paymentLabels = paymentLabels;

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus());
  }

  protected print(): void {
    this.document.defaultView?.print();
  }
}
