import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormRoot, required } from '@angular/forms/signals';
import { ButtonField } from './ButtonField';

@Component({
  imports: [ButtonField, FormRoot],
  template: `
    <form [formRoot]="fields">
      <button btn-field (click)="cancelCount.update(increment)">Cancelar</button>
      <button
        btn-field
        type="submit"
        [disabled]="locked() || fields().submitting()"
        [attr.aria-busy]="fields().submitting()"
      >
        {{ fields().submitting() ? 'Guardando…' : 'Guardar' }}
      </button>
    </form>
  `,
})
class FormHost {
  readonly data = signal({ name: '' });
  readonly locked = signal(false);
  readonly cancelCount = signal(0);
  readonly increment = (value: number) => value + 1;
  readonly save = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  readonly fields = form(this.data, (path) => required(path.name), {
    submission: { action: async () => this.save() },
  });
}

function getButtons(element: HTMLElement): [HTMLButtonElement, HTMLButtonElement] {
  const buttons = element.querySelectorAll('button');
  if (buttons.length !== 2) throw new Error('Expected cancel and submit buttons');
  return [buttons[0], buttons[1]];
}

describe('ButtonField with Signal Forms', () => {
  it('keeps ordinary actions from submitting and honors native disabled behavior', async () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.componentInstance.data.set({ name: 'Rodrigo' });
    await fixture.whenStable();
    const [cancel, submit] = getButtons(fixture.nativeElement);

    cancel.click();
    await fixture.whenStable();
    expect(cancel.type).toBe('button');
    expect(fixture.componentInstance.cancelCount()).toBe(1);
    expect(fixture.componentInstance.save).not.toHaveBeenCalled();

    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    expect(submit.disabled).toBe(true);
    expect(submit.hasAttribute('data-disabled')).toBe(true);
    submit.click();
    expect(fixture.componentInstance.save).not.toHaveBeenCalled();
  });

  it('lets Signal Forms reject invalid submissions and mark fields touched', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const [, submit] = getButtons(fixture.nativeElement);

    submit.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.save).not.toHaveBeenCalled();
    expect(fixture.componentInstance.fields.name().touched()).toBe(true);
  });

  it('submits through FormRoot and prevents duplicate clicks while saving', async () => {
    const fixture = TestBed.createComponent(FormHost);
    const host = fixture.componentInstance;
    let finish: () => void = () => {};
    const saved = new Promise<void>((resolve) => {
      finish = resolve;
    });
    host.save.mockReturnValue(saved);
    host.data.set({ name: 'Rodrigo' });
    await fixture.whenStable();
    const [, submit] = getButtons(fixture.nativeElement);

    submit.click();
    await fixture.whenStable();
    expect(host.save).toHaveBeenCalledTimes(1);
    expect(host.fields().submitting()).toBe(true);
    expect(submit.disabled).toBe(true);
    expect(submit.getAttribute('aria-busy')).toBe('true');
    expect(submit.textContent).toContain('Guardando');
    submit.click();
    expect(host.save).toHaveBeenCalledTimes(1);

    finish();
    await saved;
    await expect.poll(() => host.fields().submitting()).toBe(false);
    await fixture.whenStable();
    expect(host.fields().submitting()).toBe(false);
    expect(submit.disabled).toBe(false);
    expect(submit.textContent).toContain('Guardar');
  });
});
