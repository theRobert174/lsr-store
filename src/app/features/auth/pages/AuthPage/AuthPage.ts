import { Component, inject, signal } from '@angular/core';
import { disabled, form, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { User } from '@core/auth/User';
import { AuthLayout } from '@layouts/auth/AuthLayout';
import { LoginCredentials, LoginForm } from '@components/organisms/LoginForm/LoginForm';

@Component({
  selector: 'auth-page',
  imports: [AuthLayout, LoginForm],
  template: `
    <auth-layout>
      <login-form
        authContent
        [fields]="loginForm"
        (loginSubmit)="login()"
        (demoEnter)="enterDemo()"
      />
    </auth-layout>
  `,
})
export class AuthPage {
  private readonly user = inject(User);
  private readonly router = inject(Router);
  protected readonly credentials = signal<LoginCredentials>({
    username: 'user1',
    password: 'password1',
  });
  protected readonly loginForm = form(this.credentials, (path) => {
    required(path.username, { message: 'Ingresa tu usuario.' });
    required(path.password, { message: 'Ingresa tu contraseña.' });
    disabled(path, { when: ({ state }) => state.submitting() });
  });

  protected enterDemo(): void {
    this.user.enterDemo();
    void this.router.navigateByUrl('/seller/catalog');
  }

  protected async login(): Promise<void> {
    if (this.loginForm().submitting()) return;

    await submit(this.loginForm, {
      onInvalid: () => {
        const firstInvalid = [this.loginForm.username, this.loginForm.password].find((field) =>
          field().invalid(),
        );
        firstInvalid?.().focusBoundControl();
      },
      action: async () => {
        this.user.enterDemo(this.credentials().username);
        await this.router.navigateByUrl('/seller/catalog');
      },
    });
  }
}
