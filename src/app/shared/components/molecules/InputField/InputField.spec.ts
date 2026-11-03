import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { InputField } from './InputField';

@Component({
  imports: [InputField],
  template: `<input-field label="Search" [(value)]="query" [readonly]="readOnly()" />`,
})
class PlainInputHost {
  readonly query = signal('Initial');
  readonly readOnly = signal(false);
}

@Component({
  imports: [InputField, FormField],
  template: `<input-field label="Email" type="email" [formField]="fields.email" />`,
})
class SignalFormHost {
  readonly data = signal({ email: '' });
  readonly locked = signal(false);
  readonly fields = form(this.data, (path) => {
    required(path.email, { message: 'Email is required' });
    disabled(path.email, () => this.locked());
  });
}

function getInput(element: HTMLElement): HTMLInputElement {
  const input = element.querySelector('input');
  if (!input) throw new Error('Expected an input');
  return input;
}

describe('InputField', () => {
  it('synchronizes a plain signal in both directions without a form', async () => {
    const fixture = TestBed.createComponent(PlainInputHost);
    await fixture.whenStable();
    const input = getInput(fixture.nativeElement);

    expect(input.value).toBe('Initial');
    input.value = 'Search term';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.query()).toBe('Search term');

    fixture.componentInstance.query.set('Updated');
    fixture.componentInstance.readOnly.set(true);
    await fixture.whenStable();
    expect(input.value).toBe('Updated');
    expect(input.readOnly).toBe(true);
  });

  it('associates the label and validation message with the native input', async () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const input = getInput(element);
    const label = element.querySelector('label');
    const error = element.querySelector('[ngpError]');

    expect(label?.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-labelledby')?.split(' ')).toContain(label?.id);
    expect(error?.textContent).toContain('Email is required');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(error?.id);
    expect(input.required).toBe(true);

    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.fields.email().touched()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');

    input.value = 'hello@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.data().email).toBe('hello@example.com');
    expect(fixture.componentInstance.fields.email().dirty()).toBe(true);
    expect(element.querySelector('[ngpError]')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('propagates model changes, disabled state, reset and focus from Signal Forms', async () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    await fixture.whenStable();
    const input = getInput(fixture.nativeElement);
    const host = fixture.componentInstance;

    host.data.set({ email: 'updated@example.com' });
    host.locked.set(true);
    await fixture.whenStable();
    expect(input.value).toBe('updated@example.com');
    expect(input.disabled).toBe(true);

    host.locked.set(false);
    host.fields().reset({ email: '' });
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
    expect(input.value).toBe('');
    expect(host.fields.email().touched()).toBe(false);

    host.fields.email().focusBoundControl();
    expect(document.activeElement).toBe(input);
  });
});
