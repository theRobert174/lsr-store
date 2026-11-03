import { DOCUMENT } from '@angular/common';
import { inject, Service, signal } from '@angular/core';
import { isRecord } from '@core/models/Book';

export type DemoKey = 'cart' | 'sales' | 'username';
const PREFIX = 'lsr-demo:v1:';

/** Versioned browser persistence. Domain services validate their own records. */
@Service()
export class LocalPersistence {
  private readonly document = inject(DOCUMENT);
  private readonly memory = new Map<DemoKey, unknown>();
  private readonly problem = signal('');
  readonly warning = this.problem.asReadonly();

  read<T>(key: DemoKey, validate: (value: unknown) => value is T, fallback: T): T {
    if (this.memory.has(key)) {
      const cached = this.memory.get(key);
      return validate(cached) ? cached : fallback;
    }
    try {
      const raw = this.storage().getItem(PREFIX + key);
      if (raw === null) {
        const cached = this.memory.get(key);
        return validate(cached) ? cached : fallback;
      }
      const record: unknown = JSON.parse(raw);
      if (isRecord(record) && record['version'] === 1 && validate(record['data'])) {
        this.memory.set(key, record['data']);
        return record['data'];
      }
      this.remove(key);
      this.problem.set(
        'Se restablecieron datos locales incompatibles. Puedes continuar con la demo.',
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.remove(key);
        this.problem.set('Se restablecieron datos locales dañados. Puedes continuar con la demo.');
      } else {
        this.unavailable();
      }
    }
    const cached = this.memory.get(key);
    return validate(cached) ? cached : fallback;
  }

  write<T>(key: DemoKey, data: T): void {
    this.memory.set(key, data);
    try {
      this.storage().setItem(PREFIX + key, JSON.stringify({ version: 1, data }));
    } catch {
      this.unavailable();
    }
  }

  remove(key: DemoKey): void {
    this.memory.set(key, undefined);
    try {
      this.storage().removeItem(PREFIX + key);
    } catch {
      this.unavailable();
    }
  }

  private storage(): Storage {
    const storage = this.document.defaultView?.localStorage;
    if (!storage) throw new Error('Browser storage is unavailable');
    return storage;
  }

  private unavailable(): void {
    this.problem.set(
      'El navegador no permite guardar datos. La demo funciona durante esta sesión; los cambios podrían perderse al recargar.',
    );
  }
}
