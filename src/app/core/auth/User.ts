import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LocalPersistence } from '@core/services/LocalPersistence';

const isUsername = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 80;

@Service()
export class User {
  private readonly router = inject(Router);
  private readonly persistence = inject(LocalPersistence);
  private readonly username = signal(this.persistence.read('username', isUsername, 'Librero demo'));
  readonly name = this.username.asReadonly();

  enterDemo(username = 'Librero demo'): void {
    const name = username.trim().slice(0, 80) || 'Librero demo';
    this.username.set(name);
    this.persistence.write('username', name);
  }

  reset(): void {
    this.username.set('Librero demo');
    this.persistence.remove('username');
  }

  logout(): void {
    this.reset();
    void this.router.navigateByUrl('/auth');
  }
}
