import { Component, input, model, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidShoppingBasket, faSolidSignOutAlt } from '@ng-icons/font-awesome/solid';
import { CatalogSearch } from '@components/molecules/CatalogSearch/CatalogSearch';
import { ButtonField } from '@components/atoms/ButtonField/ButtonField';

@Component({
  selector: 'catalog-toolbar',
  imports: [NgIcon, CatalogSearch, ButtonField],
  providers: [provideIcons({ faSolidShoppingBasket, faSolidSignOutAlt })],
  template: `
    <span class="username" [title]="username()">{{ username() }}</span>
    <div class="search-tools">
      <button
        btn-field
        class="icon-button basket"
        (click)="cartClick.emit()"
        [attr.aria-label]="'Abrir carrito, ' + cartCount() + ' artículos'"
      >
        <ng-icon name="faSolidShoppingBasket" aria-hidden="true" size="24px" />
        <span class="badge" aria-hidden="true">{{ cartCount() }}</span>
      </button>
      <catalog-search [(query)]="query" />
    </div>
    <button
      btn-field
      class="icon-button logout"
      aria-label="Cerrar sesión"
      (click)="logoutClick.emit()"
    >
      <ng-icon name="faSolidSignOutAlt" aria-hidden="true" size="24px" />
    </button>
  `,
  styleUrl: './CatalogToolbar.css',
})
export class CatalogToolbar {
  readonly username = input('Usuario');
  readonly cartCount = input(0);
  readonly query = model('');
  readonly cartClick = output<void>();
  readonly logoutClick = output<void>();
}
