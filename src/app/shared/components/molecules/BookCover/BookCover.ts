import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapInfoCircleFill, bootstrapPlusCircleFill } from '@ng-icons/bootstrap-icons';
import { NgpPress } from 'ng-primitives/interactions';
import { availabilityLabels, BookAvailability } from '@app/core/services/Cart';

@Component({
  selector: 'book-cover',
  imports: [NgOptimizedImage, NgIcon, NgpPress],
  providers: [provideIcons({ bootstrapInfoCircleFill, bootstrapPlusCircleFill })],
  host: {
    role: 'group',
    '[attr.aria-label]': 'title() + " — " + author()',
    '[attr.data-availability]': 'availability()',
  },
  template: `
    @if (imagePending()) {
      <div class="cover-skeleton" aria-hidden="true"></div>
    }
    <img
      class="cover-image"
      [class.image-pending]="imagePending()"
      [ngSrc]="imageSource()"
      fill
      [sizes]="sizes()"
      alt=""
      (load)="imageLoaded.set(true)"
      (error)="imageFailed.set(true)"
    />
    <button
      class="add-action"
      type="button"
      ngpPress
      [attr.aria-label]="'Agregar ' + title()"
      (click)="add()"
    >
      <ng-icon
        class="add-icon"
        name="bootstrapPlusCircleFill"
        aria-hidden="true"
        [class.feedback-odd]="feedback() % 2 === 1"
        [class.feedback-even]="feedback() > 0 && feedback() % 2 === 0"
      />
    </button>
    <button
      class="info-action"
      type="button"
      [attr.aria-label]="'Información de ' + title()"
      (click)="infoClick.emit()"
    >
      <ng-icon name="bootstrapInfoCircleFill" aria-hidden="true" />
    </button>
    <div class="details">
      <div class="text">
        <p class="author" [title]="author()">{{ author() }}</p>
        <p class="title" [title]="title()">{{ title() }}</p>
      </div>
      <span class="copies" aria-hidden="true" [title]="copiesLabel()">
        {{ copies() }}
      </span>
      <span class="availability-label">{{ copiesLabel() }}</span>
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
  /** Match the rendered width in the consuming grid for responsive image loading. */
  readonly sizes = input('(max-width: 600px) 50vw, 25vw');

  readonly addClick = output<void>({ alias: 'add-click' });
  readonly infoClick = output<void>({ alias: 'info-click' });

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
    () => `${this.copies()} copias. ${availabilityLabels[this.availability()]}`,
  );
  protected readonly feedback = signal(0);

  protected add(): void {
    this.feedback.update((value) => value + 1);
    this.addClick.emit();
  }
}
