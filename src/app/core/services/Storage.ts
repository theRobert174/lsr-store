import { HttpClient } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Book } from './Cart';
// import { DEMO_BOOKS } from '@app/shared/utils/constants/books';

export interface StorageData {
  books: readonly Book[];
  page: number;
  pages: number;
}

// const MOCK_API_RESPONSE: StorageData = {
//   books: DEMO_BOOKS,
//   page: 1,
//   pages: 1
// }

@Service()
export class Storage {
  readonly #http = inject(HttpClient);
  // readonly #apiResponse = signal<StorageData>(MOCK_API_RESPONSE);
  // booksList = this.#apiResponse.asReadonly();
  readonly #apiResponse = rxResource({
    defaultValue: { books: [], page: 1, pages: 1 } satisfies StorageData,
    stream: () =>
      this.#http
        .get<readonly Book[]>('stock.json')
        .pipe(map((books): StorageData => ({ books, page: 1, pages: 1 }))),
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
