# BookCover

Tarjeta de libro con portada optimizada, título completo, autor, precio en MXN,
disponibilidad textual y acciones independientes para agregar y consultar información.

```html
<book-cover
  [title]="book.title"
  [author]="book.author"
  [price]="book.price"
  [copies]="book.copies"
  [availability]="book.availability"
  [coverUrl]="book.coverUrl"
  [inCart]="quantityFor(book.id)"
  [priority]="index < 4"
  (add-click)="addBook(book)"
  (info-click)="showInfo(book)"
/>
```

No agrega libros sin disponibilidad local ni al alcanzar las copias existentes.
Los outputs conservan los alias `add-click` e `info-click`. La página es responsable
del carrito y los mensajes de confirmación; la tarjeta solo presenta y emite acciones.

`NgOptimizedImage` recibe `sizes` con medidas responsivas. `priority` se reserva
para las primeras imágenes visibles. Las portadas ausentes o fallidas usan
`images/book-cover-placeholder.svg`; cambiar la URL reinicia la carga y el fallback.
