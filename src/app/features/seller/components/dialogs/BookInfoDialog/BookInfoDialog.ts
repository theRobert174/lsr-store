import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpDialogTitle } from 'ng-primitives/dialog';
import { DialogPanel } from '@components/molecules/Dialog/Dialog';
import { availabilityLabels, Book } from '@app/core/services/Cart';

@Component({
  selector: 'book-info-dialog',
  imports: [CurrencyPipe, NgOptimizedImage, NgpButton, NgpDialogTitle],
  hostDirectives: [DialogPanel],
  template: `
    <header class="dialog-header">
      <div>
        <p class="eyebrow">Acerca del libro</p>
        <h2 ngpDialogTitle>{{ book()?.title || 'Información del libro' }}</h2>
      </div>
      <button
        ngpButton
        class="close-button"
        type="button"
        (click)="dialog.close()"
        aria-label="Cerrar información del libro"
        autofocus
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <path
            d="m6 6 12 12M6 18 18 6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </header>

    @if (book(); as currentBook) {
      <div class="book-layout">
        <div class="cover-panel">
          <div class="cover-frame">
            <img
              [ngSrc]="imageSource()"
              fill
              sizes="(max-width: 600px) 55vw, 30vw"
              [alt]="'Portada de ' + currentBook.title"
              (error)="imageFailed.set(true)"
            />
          </div>
          <span class="cover-caption">{{
            hasCover() ? 'Portada del libro' : 'Portada no disponible'
          }}</span>
        </div>

        <div class="book-details">
          <dl class="metadata">
            <div class="author-detail">
              <dt>Autor</dt>
              <dd class="author">{{ currentBook.author }}</dd>
            </div>
            <div class="price-detail">
              <dt>Precio</dt>
              <dd class="price">
                {{ currentBook.price | currency: 'MXN' : 'symbol-narrow' : '1.2-2' }}
                <span>MXN</span>
              </dd>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd class="availability" [attr.data-availability]="currentBook.availability">
                <span class="status-dot" aria-hidden="true"></span>
                {{ availabilityText() }}
              </dd>
            </div>
            @if (currentBook.isbn.trim()) {
              <div>
                <dt>ISBN</dt>
                <dd class="isbn">{{ currentBook.isbn }}</dd>
              </div>
            }
          </dl>
          <section class="summary" aria-labelledby="book-dialog-summary">
            <h3 id="book-dialog-summary">Sinopsis</h3>
            <p [class.unavailable]="!currentBook.summary?.trim()">
              {{
                currentBook.summary?.trim() || 'Aún no hay una sinopsis disponible para este libro.'
              }}
            </p>
          </section>
        </div>
      </div>
    }
  `,
  styleUrl: './BookInfoDialog.css',
})
export class BookInfoDialog {
  protected readonly dialog = inject(DialogPanel);

  readonly book = input.required<Book | null>();

  protected readonly imageFailed = linkedSignal({
    source: () => this.book()?.coverUrl,
    computation: () => false,
  });
  protected readonly hasCover = computed(
    () => Boolean(this.book()?.coverUrl?.trim()) && !this.imageFailed(),
  );
  protected readonly imageSource = computed(
    () => (this.hasCover() && this.book()?.coverUrl?.trim()) || 'images/book-cover-placeholder.svg',
  );
  protected readonly availabilityText = computed(() => {
    const book = this.book();
    if (!book) return '';
    const copies = `${book.copies} ${book.copies === 1 ? 'copia' : 'copias'}`;
    return `${copies}. ${availabilityLabels[book.availability]}`;
  });
}
