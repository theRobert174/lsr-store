import {
  afterNextRender,
  Component,
  computed,
  effect,
  untracked,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  signal,
  TemplateRef,
  viewChildren,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Sales } from '@core/services/Sales';
import { NgpDialogContext, NgpDialogManager } from 'ng-primitives/dialog';
import { DialogOverlay } from '@components/molecules/Dialog/Dialog';
import { CatalogLayout } from '@layouts/catalog/CatalogLayout';
import { CatalogToolbar } from '@components/organisms/CatalogToolbar/CatalogToolbar';
import { BookCover } from '@components/molecules/BookCover/BookCover';
import { BookInfoDialog } from '../../components/dialogs/BookInfoDialog/BookInfoDialog';
import { CartDialog } from '../../components/dialogs/CartDialog/CartDialog';
import { User } from '@app/core/auth/User';
import { Book } from '@core/models/Book';
import { Cart } from '@core/services/Cart';
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
    RouterLink,
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
        [query]="query()"
        (queryChange)="updateQuery($event)"
        [cartCount]="cartCount()"
        (cartClick)="openDialog(cartDialog)"
        (logoutClick)="logout()"
      />
      <div class="catalog-intro">
        <div>
          <h1 #pageTitle tabindex="-1">Catálogo de libros</h1>
          <p>Selecciona tus libros y prepara una venta simulada.</p>
        </div>
        @if (latestSale(); as sale) {
          <a [routerLink]="['/seller/receipt', sale.id]">Ver último ticket</a>
        }
      </div>
      <div class="filters">
        <div class="filter">
          <label for="availability-filter">Disponibilidad</label>
          <select
            id="availability-filter"
            #availabilitySelect
            [value]="availability()"
            (change)="updateFilters(availabilitySelect.value, sort())"
          >
            <option value="all">Todas</option>
            <option value="yes">Disponible aquí</option>
            <option value="no">No disponible</option>
            <option value="yes-but-not-here">Otra sucursal</option>
          </select>
        </div>
        <div class="filter">
          <label for="sort-filter">Ordenar por</label>
          <select
            id="sort-filter"
            #sortSelect
            [value]="sort()"
            (change)="updateFilters(availability(), sortSelect.value)"
          >
            <option value="catalog">Orden del catálogo</option>
            <option value="title">Título</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </div>
      </div>
      <p class="announcement" role="status" aria-atomic="true">{{ announcement() }}</p>
      <p class="results-count" role="status">
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
          @for (book of visibleBooks(); track book.id; let index = $index) {
            <li #bookItem tabindex="-1">
              <book-cover
                [title]="book.title"
                [author]="book.author"
                [copies]="book.copies"
                [price]="book.price"
                [inCart]="quantityFor(book.id)"
                [priority]="index < 4"
                [availability]="book.availability"
                [coverUrl]="book.coverUrl"
                sizes="(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 20vw"
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
  readonly #route = inject(ActivatedRoute);
  readonly #sales = inject(Sales);
  private readonly params = toSignal(this.#route.queryParamMap, {
    initialValue: this.#route.snapshot.queryParamMap,
  });
  readonly #dialogs = inject(NgpDialogManager);
  readonly #cart = inject(Cart);
  readonly #user = inject(User);
  readonly #storage = inject(Storage);
  readonly #injector = inject(Injector);
  private readonly pageTitle = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly bookItems = viewChildren<ElementRef<HTMLLIElement>>('bookItem');

  readonly username = this.#user.name;
  readonly cart = this.#cart.cart;
  readonly cartCount = this.#cart.cartCount;
  readonly quantityFor = (id: string) => this.#cart.quantityFor(id);
  readonly latestSale = computed(() => this.#sales.sales()[0]);

  protected addBook(book: Book): void {
    this.announcement.set(this.#cart.addBook(book));
  }
  readonly removeBook = this.#cart.removeBook;
  readonly setQuantity = this.#cart.setQuantity;

  readonly books = computed(() => this.#storage.booksList().books);
  protected readonly isLoading = this.#storage.isLoading;
  protected readonly error = this.#storage.error;
  protected readonly pageSize = 24;
  protected readonly skeletonItems = Array.from({ length: 12 }, (_, index) => index);

  protected readonly query = linkedSignal(() => this.params().get('q') ?? '');
  protected readonly availability = computed(() => this.params().get('availability') ?? 'all');
  protected readonly sort = computed(() => this.params().get('sort') ?? 'catalog');

  constructor() {
    effect(() => {
      const books = this.books();
      if (!this.isLoading() && !this.error()) untracked(() => this.#cart.reconcile(books));
    });
    afterNextRender(() => this.pageTitle().nativeElement.focus());
  }

  protected updateQuery(value: string): void {
    this.query.set(value);
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { q: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected updateFilters(availability: string, sort: string): void {
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: {
        q: this.query() || null,
        availability: availability === 'all' ? null : availability,
        sort: sort === 'catalog' ? null : sort,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  protected readonly filteredBooks = computed(() => {
    const query = normalize(this.query().trim());
    const books = this.books().filter(
      (book) =>
        normalize(`${book.title} ${book.author} ${book.isbn}`).includes(query) &&
        (this.availability() === 'all' || book.availability === this.availability()),
    );
    switch (this.sort()) {
      case 'title':
        return books.sort((a, b) => a.title.localeCompare(b.title, 'es'));
      case 'price-asc':
        return books.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return books.sort((a, b) => b.price - a.price);
      default:
        return books;
    }
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
    this.#user.logout();
  }

  protected checkout(): void {
    if (this.cartCount() > 0) void this.#router.navigateByUrl('/seller/checkout');
  }
}
