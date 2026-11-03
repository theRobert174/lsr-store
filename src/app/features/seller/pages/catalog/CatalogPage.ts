import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  signal,
  TemplateRef,
  viewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgpDialogContext, NgpDialogManager } from 'ng-primitives/dialog';
import { DialogOverlay } from '@components/molecules/Dialog/Dialog';
import { CatalogLayout } from '@layouts/catalog/CatalogLayout';
import { CatalogToolbar } from '@components/organisms/CatalogToolbar/CatalogToolbar';
import { BookCover } from '@components/molecules/BookCover/BookCover';
import { BookInfoDialog } from '../../components/dialogs/BookInfoDialog/BookInfoDialog';
import { CartDialog } from '../../components/dialogs/CartDialog/CartDialog';
import { User } from '@app/core/auth/User';
import { Book, Cart } from '@app/core/services/Cart';
import { Storage } from '@app/core/services/Storage';
import { ButtonField } from '@components/atoms/ButtonField/ButtonField';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
}

@Component({
  selector: 'catalog-page',
  imports: [
    CatalogLayout,
    CatalogToolbar,
    BookCover,
    BookInfoDialog,
    CartDialog,
    DialogOverlay,
    ButtonField,
  ],
  template: `
    <catalog-layout>
      <catalog-toolbar
        catalogHeader
        [username]="username()"
        [(query)]="query"
        [cartCount]="cartCount()"
        (cartClick)="openDialog(cartDialog)"
        (logoutClick)="logout()"
      />
      <p class="sr-only" role="status">{{ announcement() }}</p>
      <p class="sr-only" role="status">
        @if (isLoading()) {
          Cargando catálogo.
        } @else if (!error()) {
          {{ visibleBooks().length }} de {{ filteredBooks().length }} libros encontrados.
        }
      </p>
      @if (isLoading()) {
        <div class="book-grid" aria-hidden="true">
          @for (item of skeletonItems; track item) {
            <div class="book-skeleton"></div>
          }
        </div>
      } @else if (error()) {
        <div class="catalog-state">
          <p role="alert">No pudimos cargar el catálogo. Intenta de nuevo.</p>
          <button btn-field type="button" (click)="reload()">Reintentar</button>
        </div>
      } @else {
        <ul id="catalog-books" class="book-grid" aria-label="Libros del catálogo">
          @for (book of visibleBooks(); track book.id) {
            <li #bookItem tabindex="-1">
              <book-cover
                [title]="book.title"
                [author]="book.author"
                [copies]="book.copies"
                [availability]="book.availability"
                [coverUrl]="book.coverUrl"
                sizes="(max-width: 700px) 50vw, (max-width: 1000px) 25vw, 15vw"
                (add-click)="addBook(book)"
                (info-click)="selectedBook.set(book); openDialog(infoDialog)"
              />
            </li>
          }
        </ul>
        @if (filteredBooks().length === 0) {
          <p class="empty">
            {{
              query().trim()
                ? 'No encontramos libros para tu búsqueda.'
                : 'No hay libros en el catálogo.'
            }}
          </p>
        }
        @if (filteredBooks().length > pageSize) {
          <div class="load-more">
            <button
              btn-field
              type="button"
              aria-controls="catalog-books"
              [disabled]="!hasMore()"
              (click)="loadMore()"
            >
              {{ hasMore() ? 'Cargar más' : 'Todos los libros cargados' }}
            </button>
          </div>
        }
      }
    </catalog-layout>

    <ng-template #infoDialog>
      <dialog-overlay><book-info-dialog [book]="selectedBook()" /></dialog-overlay>
    </ng-template>
    <ng-template #cartDialog>
      <dialog-overlay>
        <cart-dialog
          [lines]="cart()"
          (removeBook)="removeBook($event)"
          (quantityChange)="setQuantity($event.bookId, $event.quantity)"
          (checkout)="checkout()"
        />
      </dialog-overlay>
    </ng-template>
  `,
  styleUrl: './CatalogPage.css',
})
export class CatalogPage {
  readonly #router = inject(Router);
  readonly #dialogs = inject(NgpDialogManager);
  readonly #cart = inject(Cart);
  readonly #user = inject(User);
  readonly #storage = inject(Storage);
  readonly #injector = inject(Injector);
  private readonly bookItems = viewChildren<ElementRef<HTMLLIElement>>('bookItem');

  readonly username = this.#user.name;
  readonly cart = this.#cart.cart;
  readonly cartCount = this.#cart.cartCount;
  readonly addBook = this.#cart.addBook;
  readonly removeBook = this.#cart.removeBook;
  readonly setQuantity = this.#cart.setQuantity;

  readonly books = computed(() => this.#storage.booksList().books);
  protected readonly isLoading = this.#storage.isLoading;
  protected readonly error = this.#storage.error;
  protected readonly pageSize = 24;
  protected readonly skeletonItems = Array.from({ length: 12 }, (_, index) => index);

  protected readonly query = signal('');
  protected readonly filteredBooks = computed(() => {
    const query = normalize(this.query().trim());
    return this.books().filter((book) => normalize(`${book.title} ${book.author}`).includes(query));
  });
  protected readonly visibleLimit = linkedSignal({
    source: this.filteredBooks,
    computation: () => this.pageSize,
  });
  protected readonly visibleBooks = computed(() =>
    this.filteredBooks().slice(0, this.visibleLimit()),
  );
  protected readonly hasMore = computed(
    () => this.visibleBooks().length < this.filteredBooks().length,
  );

  protected loadMore(): void {
    if (!this.hasMore()) return;
    const firstNewIndex = this.visibleBooks().length;
    this.visibleLimit.update((limit) => limit + this.pageSize);
    afterNextRender(
      () => {
        const item = this.bookItems()[firstNewIndex]?.nativeElement;
        item?.focus({ preventScroll: true });
        item?.scrollIntoView({ block: 'nearest' });
      },
      { injector: this.#injector },
    );
  }

  protected reload(): void {
    this.#storage.reload();
  }

  protected readonly selectedBook = signal<Book | null>(null);
  protected readonly announcement = signal('');

  protected openDialog(template: TemplateRef<NgpDialogContext>): void {
    this.#dialogs.open(template, {
      closeOnOutsideClick: false,
      closeOnNavigation: true,
    });
  }

  protected logout(): void {
    this.#cart.clearCart();
    this.#user.logout();
  }

  protected checkout(): void {
    if (this.cartCount() > 0) void this.#router.navigateByUrl('/seller/checkout');
  }
}
