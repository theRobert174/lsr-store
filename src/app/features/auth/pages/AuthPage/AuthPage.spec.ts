import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '@app/app.routes';
import { AuthPage } from './AuthPage';

describe('AuthPage', () => {
  function fill(element: HTMLElement, name: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(`input[type="${name}"]`);
    if (!input) throw new Error(`Missing ${name} input`);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function send(element: HTMLElement): void {
    element
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  it('opens the lazy auth page at startup and projects the login into the layout', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('auth-layout login-form')).not.toBeNull();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Explora');
  });

  it('shows validation after submit and focuses the first invalid input', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[ngpError]')).toBeNull();
    fill(element, 'text', '');
    fill(element, 'password', '');
    send(element);
    await fixture.whenStable();
    expect(element.textContent).toContain('Ingresa tu usuario.');
    expect(document.activeElement).toBe(element.querySelector('input'));
    expect(TestBed.inject(Router).url).not.toBe('/seller/catalog');
  });

  it('prefills credentials and opens the catalog when login is clicked', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create('/auth');
    const element = harness.routeNativeElement;
    if (!element) throw new Error('Missing auth page');
    expect(element.querySelector<HTMLInputElement>('input[type="text"]')?.value).toBe('user1');
    expect(element.querySelector<HTMLInputElement>('input[type="password"]')?.value).toBe(
      'password1',
    );
    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await vi.waitFor(() => {
      expect(TestBed.inject(Router).url).toBe('/seller/catalog');
    });
  });
});
