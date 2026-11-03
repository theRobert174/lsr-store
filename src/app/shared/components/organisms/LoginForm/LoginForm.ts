import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ButtonField } from '@components/atoms/ButtonField/ButtonField';
import { InputField } from '@components/molecules/InputField/InputField';

export interface LoginCredentials {
  username: string;
  password: string;
}

@Component({
  selector: 'login-form',
  imports: [InputField, ButtonField, FormField],
  template: `
    <form
      novalidate
      aria-labelledby="login-title"
      [attr.aria-busy]="fields()().submitting()"
      (submit)="onSubmit($event)"
    >
      <header>
        <p class="eyebrow">PUNTO DE VENTA · DEMOSTRACIÓN</p>
        <h1 id="login-title">Explora LSR Librería</h1>
        <p>
          Explora el catálogo, prepara una venta y genera un ticket. Todo funciona en tu navegador.
        </p>
      </header>

      <button btn-field type="button" size="lg" (click)="demoEnter.emit()">Explorar demo</button>
      <p class="help">También puedes probar las validaciones del formulario con datos ficticios.</p>

      <input-field
        label="Usuario"
        type="text"
        autocomplete="username"
        placeholder="Ingresa tu usuario"
        [formField]="fields().username"
        [displayErrors]="fields().username().touched() ? fields().username().errors() : []"
      />
      <input-field
        label="Contraseña"
        type="password"
        autocomplete="current-password"
        placeholder="Ingresa tu contraseña"
        [formField]="fields().password"
        [displayErrors]="fields().password().touched() ? fields().password().errors() : []"
      />

      <div aria-live="polite" aria-atomic="true">
        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }
        @if (statusMessage()) {
          <p class="status">{{ statusMessage() }}</p>
        }
      </div>
      <button btn-field type="submit" size="lg" [disabled]="fields()().submitting()">
        {{ fields()().submitting() ? 'Ingresando…' : 'Probar acceso simulado' }}
      </button>
      <p class="help">
        Acceso simulado: cualquier usuario y contraseña no vacíos. No uses credenciales reales.
      </p>
    </form>
  `,
  styleUrl: './LoginForm.css',
})
export class LoginForm {
  readonly fields = input.required<FieldTree<LoginCredentials>>();
  readonly errorMessage = input('');
  readonly statusMessage = input('');
  readonly demoEnter = output<void>();
  readonly loginSubmit = output<void>();

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.loginSubmit.emit();
  }
}
