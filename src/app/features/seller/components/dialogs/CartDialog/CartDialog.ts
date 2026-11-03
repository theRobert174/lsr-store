import { NgpDialogDescription, NgpDialogTitle } from 'ng-primitives/dialog';
import { DialogPanel } from '@components/molecules/Dialog/Dialog';
import { Component, computed, ElementRef, inject, input, output } from '@angular/core';
import {
  NgpNumberField,
  NgpNumberFieldInput,
  NgpNumberFieldIncrement,
} from 'ng-primitives/number-field';
import { NgpButton } from 'ng-primitives/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidAdd, faSolidMinus, faSolidTrashCan } from '@ng-icons/font-awesome/solid';
import { CurrencyPipe } from '@angular/common';
import { CartLine } from '@app/core/services/Cart';
import { getCartSummary } from '@shared/utils/cart-summary';
import { ButtonField } from '@components/atoms/ButtonField/ButtonField';

@Component({
  selector: 'cart-dialog',
  imports: [
    ButtonField,
    NgpDialogTitle,
    NgpDialogDescription,
    CurrencyPipe,
    NgpNumberField,
    NgpNumberFieldInput,
    NgpNumberFieldIncrement,
    NgpButton,
    NgIcon,
  ],
  providers: [provideIcons({ faSolidAdd, faSolidMinus, faSolidTrashCan })],
  hostDirectives: [DialogPanel],
  template: `
    <h2 ngpDialogTitle>Carrito de compra</h2>
    <p ngpDialogDescription class="sr-only">
      Revisa tus libros, ajusta las cantidades o continúa explorando.
    </p>
    @if (lines().length === 0) {
      <p>Tu carrito está vacío.</p>
    } @else {
      <p class="text-sm text-slate-600">Precios en pesos mexicanos (MXN).</p>
      <div
        class="overflow-x-auto rounded-lg border border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        role="region"
        aria-label="Desglose de productos del carrito"
        tabindex="0"
      >
        <table class="w-full min-w-[42rem] border-collapse text-sm">
          <caption class="sr-only">
            Productos y precios del carrito de compra
          </caption>
          <thead class="bg-slate-100 text-slate-700">
            <tr>
              <th scope="col" class="px-4 py-3 text-left font-semibold">Producto</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Cantidad</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Precio unitario</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            @for (row of rows(); track row.book.id) {
              <tr>
                <th scope="row" class="min-w-52 px-4 py-3 text-left font-medium break-words">
                  {{ row.book.title }}
                </th>
                <td class="px-4 py-3 text-right tabular-nums">
                  <div
                    ngpNumberField
                    #quantityField="ngpNumberField"
                    [ngpNumberFieldValue]="row.quantity"
                    [ngpNumberFieldMin]="1"
                    [ngpNumberFieldMax]="row.book.copies"
                    [ngpNumberFieldStep]="1"
                    (ngpNumberFieldValueChange)="updateQuantity(row.book.id, $event, quantityField)"
                    class="quantity-field"
                  >
                    <button
                      ngpButton
                      class="quantity-decrease"
                      type="button"
                      [attr.aria-label]="
                        (row.quantity === 1 ? 'Quitar ' : 'Disminuir cantidad de ') + row.book.title
                      "
                      (click)="decreaseOrRemove(row.book.id, row.quantity, quantityField)"
                    >
                      <ng-icon
                        [name]="row.quantity === 1 ? 'faSolidTrashCan' : 'faSolidMinus'"
                        size="0.75rem"
                        aria-hidden="true"
                      />
                    </button>
                    <input
                      ngpNumberFieldInput
                      [attr.aria-label]="'Cantidad de ' + row.book.title"
                    />
                    <button
                      ngpNumberFieldIncrement
                      type="button"
                      [attr.aria-label]="'Aumentar cantidad de ' + row.book.title"
                    >
                      <ng-icon name="faSolidAdd" size="0.75rem" aria-hidden="true" />
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                  {{ row.unitPriceCents / 100 | currency: 'MXN' : 'symbol-narrow' : '1.2-2' }}
                </td>
                <td class="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                  {{ row.subtotalCents / 100 | currency: 'MXN' : 'symbol-narrow' : '1.2-2' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="text-sm text-slate-600">Total: {{ count() }} artículos</p>
      <dl class="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-slate-100 p-4">
        <dt class="font-semibold">Total a pagar</dt>
        <dd class="m-0 text-xl font-bold tabular-nums">
          {{ totalCents() / 100 | currency: 'MXN' : 'symbol-narrow' : '1.2-2' }}
          <span class="text-sm font-medium">MXN</span>
        </dd>
      </dl>
    }
    <div class="dialog-actions">
      <button btn-field class="close-button" (click)="dialog.close()">Seguir explorando</button>
      @if (lines().length > 0) {
        <button btn-field (click)="checkout.emit()">Pagar</button>
      }
    </div>
  `,
  styleUrl: './CartDialog.css',
})
export class CartDialog {
  readonly #dialog = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly dialog = inject(DialogPanel);

  readonly lines = input.required<readonly CartLine[]>();
  readonly checkout = output<void>();
  readonly removeBook = output<string>();
  readonly quantityChange = output<{ bookId: string; quantity: number }>();

  protected readonly summary = computed(() => getCartSummary(this.lines()));
  protected readonly rows = computed(() => this.summary().rows);
  protected readonly totalCents = computed(() => this.summary().totalCents);
  protected readonly count = computed(() => this.summary().count);

  protected decreaseOrRemove(bookId: string, quantity: number, field: NgpNumberField): void {
    if (quantity > 1) {
      field.decrement();
      return;
    }

    const index = this.lines().findIndex((line) => line.book.id === bookId);
    const inputs =
      this.#dialog.nativeElement.querySelectorAll<HTMLInputElement>('[ngpNumberFieldInput]');
    const nextFocus =
      inputs[index + 1] ??
      inputs[index - 1] ??
      this.#dialog.nativeElement.querySelector<HTMLButtonElement>('.close-button');
    nextFocus?.focus();
    this.removeBook.emit(bookId);
  }

  protected updateQuantity(bookId: string, quantity: number | null, field: NgpNumberField): void {
    if (quantity === null) {
      const line = this.lines().find((line) => line.book.id === bookId);
      if (line) field.setValue(line.quantity);
      return;
    }
    this.quantityChange.emit({ bookId, quantity });
  }
}
