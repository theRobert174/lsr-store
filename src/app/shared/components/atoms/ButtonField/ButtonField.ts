import { Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

@Component({
  selector: 'button[btn-field]',
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: `
    <ng-content select="[slot=leading]" />
    <ng-content />
    <ng-content select="[slot=trailing]" />
  `,
  host: {
    '[attr.type]': 'type()',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
  styleUrl: './ButtonField.css',
})
export class ButtonField {
  /** Prevent accidental form submissions; opt in with type="submit". */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /**
   * The size of the button.
   */
  readonly size = input<ButtonSize>('md');
  /**
   * The variant of the button.
   */
  readonly variant = input<ButtonVariant>('primary');
}
