import { HttpClient } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Book, isBookList } from '@core/models/Book';

export interface StorageData {
  books: readonly Book[];
  page: number;
  pages: number;
}

@Service()
export class Storage {
  readonly #http = inject(HttpClient);
  readonly #apiResponse = rxResource({
    defaultValue: { books: [], page: 1, pages: 1 } satisfies StorageData,
    stream: () =>
      this.#http.get<unknown>('stock.json').pipe(
        map((books): StorageData => {
          if (!isBookList(books)) throw new Error('El catálogo contiene datos inválidos.');
          return { books, page: 1, pages: 1 };
        }),
      ),
  });
  readonly booksList = computed(() =>
    this.#apiResponse.hasValue()
      ? this.#apiResponse.value()
      : ({ books: [], page: 1, pages: 1 } satisfies StorageData),
  );
  readonly isLoading = this.#apiResponse.isLoading;
  readonly error = this.#apiResponse.error;

  reload(): void {
    this.#apiResponse.reload();
  }
}
