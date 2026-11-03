import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { NgpFormField, NgpLabel, NgpError } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'input-field',
  imports: [NgpInput, NgpLabel, NgpFormField, NgpError],
  template: `
    <div ngpFormField>
      <label ngpLabel>{{ label() }}</label>
      <input
        #control
        ngpInput
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [required]="required()"
        [name]="name()"
        [autocomplete]="autocomplete()"
        (input)="value.set(control.value)"
        (blur)="touch.emit()"
      />
      <div aria-live="polite">
        @for (error of visibleErrors(); track $index) {
          <p ngpError [ngpErrorValidator]="error.kind">{{ error.message ?? error.kind }}</p>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    [ngpFormField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      min-width: 0;
    }
    [ngpInput] {
      min-height: 2.75rem;
      box-sizing: border-box;
      width: 100%;
      border-radius: 0.5rem;
      padding: 0 16px;
      border: 1px solid #64748b;
      box-shadow: var(--ngp-input-shadow);
      background-color: var(--ngp-background, #ffffff);
      color: var(--ngp-text-primary, #0f172a);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      outline: none;
    }
    [ngpInput]:focus {
      outline: 2px solid var(--ngp-focus-ring, #1d4ed8);
      outline-offset: 2px;
    }
    [ngpInput]::placeholder {
      color: var(--ngp-text-placeholder, #475569);
    }
    [ngpLabel] {
      color: var(--ngp-text-primary, #0f172a);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 510;
      margin: 0;
    }
    [ngpError] {
      color: #b91c1c;
      font-size: 0.875rem;
      margin: 0;
    }
  `,
})
export class InputField implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input('Label');
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('Placeholder');
  readonly errors = input<readonly ValidationError[]>([]);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly name = input('');
  readonly autocomplete = input('');
  /** Defaults to all errors for existing consumers; forms can defer them until touched. */
  readonly displayErrors = input<readonly ValidationError[]>();
  protected readonly visibleErrors = computed(() => this.displayErrors() ?? this.errors());
  readonly touch = output<void>();

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }
}
