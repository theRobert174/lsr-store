import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Cart } from '@core/services/Cart';
import { Sales } from '@core/services/Sales';
import { User } from '@core/auth/User';
import { LocalPersistence } from '@core/services/LocalPersistence';

@Component({
  selector: 'demo-notice',
  template: `
    <aside aria-label="Acerca de esta demo">
      <p><strong>LSR · Demo de portafolio</strong> Ventas simuladas, sin cargos reales.</p>
      <button type="button" (click)="reset()">Restablecer demo</button>
    </aside>
    <p class="notice" role="status">{{ message() }}</p>
    @if (warning()) {
      <p class="warning" role="status">{{ warning() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      font-family: system-ui, sans-serif;
    }
    aside {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem 1rem;
      padding: 0.5rem 1.5rem;
      background: #173c32;
      color: #fff;
      font-size: 0.8125rem;
    }
    p {
      margin: 0;
    }
    strong {
      margin-right: 0.5rem;
    }
    button {
      min-height: 44px;
      padding: 0.5rem 0.75rem;
      border: 1px solid #a7c6ba;
      border-radius: 0.5rem;
      color: #fff;
      background: #173c32;
      font: inherit;
      cursor: pointer;
    }
    button:hover {
      background: #285846;
    }
    button:focus-visible {
      outline: 3px solid #fff;
      outline-offset: 3px;
    }
    .notice:empty {
      display: none;
    }
    .notice,
    .warning {
      padding: 0.75rem 1.5rem;
      background: #fff4d6;
      color: #573b08;
      font-size: 0.875rem;
    }
    @media print {
      :host {
        display: none;
      }
    }
  `,
})
export class DemoNotice {
  private readonly cart = inject(Cart);
  private readonly sales = inject(Sales);
  private readonly user = inject(User);
  private readonly router = inject(Router);
  protected readonly warning = inject(LocalPersistence).warning;
  protected readonly message = signal('');

  protected reset(): void {
    this.cart.clearCart();
    this.sales.clear();
    this.user.reset();
    this.message.set('Demo restablecida: carrito, tickets y usuario borrados.');
    void this.router.navigateByUrl('/seller/catalog');
  }
}
