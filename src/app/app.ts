import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  host: {
    '(document:dragstart)': 'preventImageAction($event)',
    '(document:contextmenu)': 'preventImageAction($event)',
  },
})
export class App {
  protected preventImageAction(event: Event): void {
    const target = event.target;
    // Book covers place action buttons over the image.
    if (target instanceof Element && target.closest('img, book-cover')) {
      event.preventDefault();
    }
  }
}
