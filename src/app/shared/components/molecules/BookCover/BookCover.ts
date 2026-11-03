import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { availabilityLabels, BookAvailability } from '@core/models/Book';
import { ButtonField } from '@components/atoms/ButtonField/ButtonField';

@Component({
  selector: 'book-cover',
  imports: [CurrencyPipe, NgOptimizedImage, ButtonField],
  host: {
    role: 'group',
    '[attr.aria-label]': 'title() + " — " + author()',
    '[attr.data-availability]': 'availability()',
  },
  template: `
    <div class="cover-frame">
      @if (imagePending()) {
        <div class="cover-skeleton" aria-hidden="true"></div>
      }
      <img
        class="cover-image"
        [class.image-pending]="imagePending()"
        [ngSrc]="imageSource()"
        fill
        [sizes]="sizes()"
        [priority]="priority()"
        alt=""
        (load)="imageLoaded.set(true)"
        (error)="imageFailed.set(true)"
      />
    </div>
    <div class="details">
      <p class="author">{{ author() }}</p>
      <h2>{{ title() }}</h2>
      <p class="price">
        {{ price() | currency: 'MXN' : 'symbol-narrow' : '1.2-2' }} <span>MXN</span>
      </p>
      <p class="availability-label">{{ copiesLabel() }}</p>
      @if (inCart() > 0) {
        <p class="in-cart">
          En carrito: {{ inCart() }}{{ !canAdd() ? ' · Límite alcanzado' : '' }}
        </p>
      }
      <div class="actions">
        <button
          btn-field
          class="add-action"
          type="button"
          [disabled]="!canAdd()"
          [attr.aria-label]="'Agregar ' + title()"
          (click)="add()"
        >
          Agregar
        </button>
        <button
          btn-field
          variant="outline"
          class="info-action"
          type="button"
          [attr.aria-label]="'Información de ' + title()"
          (click)="infoClick.emit()"
        >
          Información
        </button>
      </div>
    </div>
  `,
  styleUrl: './BookCover.css',
})
export class BookCover {
  readonly title = input.required<string>();
  readonly author = input.required<string>();
  readonly copies = input(0);
  readonly availability = input<BookAvailability>('no');
  readonly coverUrl = input<string | null>(null);
  readonly price = input(0);
  readonly inCart = input(0);
  readonly priority = input(false);
  readonly sizes = input('(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 20vw');
  readonly addClick = output<void>({ alias: 'add-click' });
  readonly infoClick = output<void>({ alias: 'info-click' });

  protected readonly canAdd = computed(
    () => this.availability() === 'yes' && this.copies() > this.inCart(),
  );
  protected readonly imageFailed = linkedSignal({
    source: this.coverUrl,
    computation: () => false,
  });
  protected readonly imageLoaded = linkedSignal({
    source: this.coverUrl,
    computation: () => false,
  });
  protected readonly imagePending = computed(
    () => !!this.coverUrl()?.trim() && !this.imageLoaded() && !this.imageFailed(),
  );
  protected readonly imageSource = computed(() =>
    this.imageFailed()
      ? 'images/book-cover-placeholder.svg'
      : this.coverUrl()?.trim() || 'images/book-cover-placeholder.svg',
  );
  protected readonly copiesLabel = computed(
    () =>
      `${this.copies()} ${this.copies() === 1 ? 'copia' : 'copias'}. ${availabilityLabels[this.availability()]}`,
  );

  protected add(): void {
    if (this.canAdd()) this.addClick.emit();
  }
}
