import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface UserData {
  username: string;
  email: string;
  role: 'seller' | 'admin';
}

@Service()
export class User {
  #router = inject(Router);
  #userData = signal<UserData | null>(null);

  name = computed(() => this.#userData()?.username ?? 'Unknown');

  logout(): void {
    void this.#router.navigateByUrl('/auth');
  }
}
