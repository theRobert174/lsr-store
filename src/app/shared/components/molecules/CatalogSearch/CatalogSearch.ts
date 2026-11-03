import { Component, model } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapSearch, bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch, NgpSearchClear } from 'ng-primitives/search';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'catalog-search',
  hostDirectives: [NgpSearch],
  imports: [NgIcon, NgpInput, NgpSearchClear, NgpButton],
  providers: [provideIcons({ bootstrapSearch, bootstrapX })],
  host: { role: 'search', 'aria-label': 'Buscar en el catálogo' },
  template: `
    <ng-icon class="search-icon" name="bootstrapSearch" aria-hidden="true" />
    <input
      #search
      ngpInput
      type="search"
      aria-label="Buscar por título o autor"
      placeholder="Buscar por título o autor"
      [value]="query()"
      (input)="query.set(search.value)"
    />
    <button
      ngpSearchClear
      ngpButton
      type="button"
      aria-label="Limpiar búsqueda"
      (click)="search.focus()"
    >
      <ng-icon name="bootstrapX" aria-hidden="true" />
    </button>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      min-width: 0;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: 3rem;
      border: 1px solid #64748b;
      border-radius: 0.5rem;
      padding: 0 3rem;
      background: #171717;
      color: #fff;
      font: inherit;
    }
    input::placeholder {
      color: #d1d5db;
    }
    input:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 3px;
    }
    input::-webkit-search-cancel-button {
      display: none;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #d1d5db;
      pointer-events: none;
      font-size: 1.125rem;
    }
    button {
      position: absolute;
      right: 0.125rem;
      top: 0.125rem;
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border: 0;
      border-radius: 0.375rem;
      background: transparent;
      color: #fff;
      cursor: pointer;
      font-size: 1.5rem;
    }
    button[data-empty] {
      display: none;
    }
    button:hover {
      background: #374151;
    }
    button:focus-visible {
      outline: 2px solid #fff;
      outline-offset: -3px;
    }
    @media (forced-colors: active) {
      input,
      button {
        background: Canvas;
        color: CanvasText;
      }
      .search-icon {
        color: CanvasText;
      }
    }
  `,
})
export class CatalogSearch {
  readonly query = model('');
}
