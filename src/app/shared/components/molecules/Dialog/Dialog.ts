import { Component, Directive, inject } from '@angular/core';
import { injectDialogRef, NgpDialog, NgpDialogOverlay } from 'ng-primitives/dialog';

/** Shared modal behavior; each feature owns its content and visual design. */
@Directive({
  selector: '[dialog-panel]',
  hostDirectives: [NgpDialog],
  host: {
    style: 'display: block; max-height: calc(100dvh - 2rem); overflow-y: auto;',
  },
})
export class DialogPanel {
  readonly #ref = injectDialogRef();

  close(): void {
    void this.#ref.close();
  }
}

@Component({
  selector: 'dialog-overlay',
  hostDirectives: [NgpDialogOverlay],
  template: `<ng-content />`,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      background: rgb(15 23 42 / 65%);
      backdrop-filter: blur(5px);
    }
  `,
})
export class DialogOverlay {}
