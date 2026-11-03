import { InjectionToken } from '@angular/core';
import type { LoginCredentials } from '@components/organisms/LoginForm/LoginForm';

/** Provide the backend sign-in operation here; resolve only when authentication succeeds. */
export const AUTHENTICATE = new InjectionToken<(credentials: LoginCredentials) => Promise<void>>(
  'AUTHENTICATE',
);
