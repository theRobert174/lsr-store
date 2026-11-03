import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { LocalPersistence } from './LocalPersistence';

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');

describe('LocalPersistence', () => {
  let data: Map<string, string>;
  let storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

  beforeEach(() => {
    data = new Map();
    storage = {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => {
        data.set(key, value);
      },
      removeItem: (key) => {
        data.delete(key);
      },
    };
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: { localStorage: storage } } }],
    });
  });

  it('writes versioned data and restores it in a new service instance', () => {
    const persistence = TestBed.inject(LocalPersistence);
    persistence.write('cart', ['book']);
    const restored = TestBed.runInInjectionContext(() => new LocalPersistence());
    expect(restored.read('cart', isStrings, [])).toEqual(['book']);
    expect(JSON.parse(data.get('lsr-demo:v1:cart') ?? '{}')).toEqual({
      version: 1,
      data: ['book'],
    });
  });

  it.each(['{broken', '{"version":2,"data":[]}', '{"version":1,"data":[123]}'])(
    'recovers from malformed or incompatible data: %s',
    (raw) => {
      data.set('lsr-demo:v1:cart', raw);
      data.set('another-app', 'keep');
      const persistence = TestBed.inject(LocalPersistence);
      expect(persistence.read('cart', isStrings, [])).toEqual([]);
      expect(data.has('lsr-demo:v1:cart')).toBe(false);
      expect(data.get('another-app')).toBe('keep');
      expect(persistence.warning()).toContain('restablecieron');
    },
  );

  it('keeps session data usable when reads, writes and deletion are blocked', () => {
    storage.getItem = () => {
      throw new Error('Blocked');
    };
    storage.setItem = () => {
      throw new Error('Quota exceeded');
    };
    storage.removeItem = () => {
      throw new Error('Blocked');
    };
    const persistence = TestBed.inject(LocalPersistence);
    expect(persistence.read('cart', isStrings, [])).toEqual([]);
    persistence.write('cart', ['session-book']);
    expect(persistence.read('cart', isStrings, [])).toEqual(['session-book']);
    persistence.remove('cart');
    expect(persistence.read('cart', isStrings, [])).toEqual([]);
    expect(persistence.warning()).toContain('durante esta sesión');
  });
});

describe('LocalPersistence quota recovery', () => {
  it('prefers current session values over stale disk data when writes and deletion fail', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: {
              localStorage: {
                getItem: () => JSON.stringify({ version: 1, data: ['old'] }),
                setItem: () => {
                  throw new Error('Quota');
                },
                removeItem: () => {
                  throw new Error('Blocked');
                },
              },
            },
          },
        },
      ],
    });
    const persistence = TestBed.inject(LocalPersistence);
    expect(persistence.read('cart', isStrings, [])).toEqual(['old']);
    persistence.write('cart', ['current']);
    expect(persistence.read('cart', isStrings, [])).toEqual(['current']);
    persistence.remove('cart');
    expect(persistence.read('cart', isStrings, [])).toEqual([]);
  });
});
