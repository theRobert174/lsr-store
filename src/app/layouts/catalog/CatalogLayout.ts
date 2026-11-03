import { Component } from '@angular/core';

@Component({
  selector: 'catalog-layout',
  template: `
    <a class="skip-link" href="#catalog-content">Saltar al catálogo</a>
    <header><ng-content select="[catalogHeader]" /></header>
    <main id="catalog-content" tabindex="-1">
      <h1 class="sr-only">Catálogo de libros</h1>
      <ng-content />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: #f5f3ef;
      color: #171717;
      font-family: Arial, sans-serif;
    }
    header {
      flex: none;
      position: sticky;
      top: 0;
      z-index: 5;
      box-shadow: 0 1px 0 rgb(23 23 23 / 10%);
    }
    main {
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      max-width: 96rem;
      margin-inline: auto;
      min-width: 0;
      padding: 1.25rem 1.5rem;
      scroll-margin-top: 5rem;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .skip-link {
      position: fixed;
      top: 0.5rem;
      left: 0.5rem;
      z-index: 10;
      transform: translateY(-200%);
      background: #fff;
      color: #171717;
      padding: 0.75rem;
    }
    .skip-link:focus {
      transform: translateY(0);
    }
    @media (max-width: 700px) {
      main {
        padding: 1rem;
        scroll-margin-top: 9rem;
      }
    }
  `,
})
export class CatalogLayout {}
