import { TestBed } from '@angular/core/testing';
import { BookCover } from './BookCover';

async function setup() {
  const fixture = TestBed.createComponent(BookCover);
  fixture.componentRef.setInput('title', 'Un título muy largo para la portada del libro');
  fixture.componentRef.setInput('author', 'Una autora');
  fixture.componentRef.setInput('copies', 5);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  return { fixture, element };
}

describe('BookCover', () => {
  it('exposes independent add and information actions without submitting a form', async () => {
    const { fixture, element } = await setup();
    const added = vi.fn();
    const info = vi.fn();
    fixture.componentInstance.addClick.subscribe(added);
    fixture.componentInstance.infoClick.subscribe(info);
    const addButton = element.querySelector<HTMLButtonElement>('.add-action')!;
    const infoButton = element.querySelector<HTMLButtonElement>('.info-action')!;

    infoButton.click();
    expect(info).toHaveBeenCalledTimes(1);
    expect(added).not.toHaveBeenCalled();
    addButton.click();
    addButton.click();
    expect(added).toHaveBeenCalledTimes(2);
    expect(info).toHaveBeenCalledTimes(1);
    expect(addButton.type).toBe('button');
    expect(infoButton.type).toBe('button');
    expect(addButton.getAttribute('aria-label')).toContain(fixture.componentInstance.title());
  });

  it('describes availability independently of the number of copies', async () => {
    const { fixture, element } = await setup();
    for (const [availability, description] of [
      ['yes', 'Disponible aquí'],
      ['no', 'No disponible'],
      ['yes-but-not-here', 'Disponible en otra sucursal'],
    ]) {
      fixture.componentRef.setInput('availability', availability);
      await fixture.whenStable();
      expect(element.getAttribute('data-availability')).toBe(availability);
      expect(element.querySelector('.availability-label')?.textContent).toBe(
        `5 copias. ${description}`,
      );
    }
  });

  it('uses a placeholder for missing or broken images and retries when the URL changes', async () => {
    const { fixture, element } = await setup();
    const image = element.querySelector('img')!;
    expect(image.getAttribute('src')).toBe('images/book-cover-placeholder.svg');
    fixture.componentRef.setInput('coverUrl', 'https://example.com/first.jpg');
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('https://example.com/first.jpg');
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('images/book-cover-placeholder.svg');
    fixture.componentRef.setInput('coverUrl', 'https://example.com/second.jpg');
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('https://example.com/second.jpg');
  });
});
