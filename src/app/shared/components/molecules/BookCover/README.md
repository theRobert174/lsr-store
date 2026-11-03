# BookCover

Molécula que combina una portada, autor, título, existencias y dos acciones. El host
es la tarjeta: ocupa el ancho del contenedor y mantiene una proporción de 9:16.
Importa `BookCover` en el componente consumidor.

```ts
import { BookCover } from '@components/molecules/BookCover/BookCover';
```

```html
<book-cover
  title="Harry Potter y la piedra filosofal"
  author="J. K. Rowling"
  [coverUrl]="book.coverUrl"
  [copies]="5"
  availability="yes"
  sizes="(max-width: 600px) 50vw, 25vw"
  (add-click)="addBook(book)"
  (info-click)="showBookInfo(book)"
/>
```

`title` y `author` son obligatorios. `coverUrl` acepta `string | null`; sin URL,
con una URL vacía o si la carga falla se muestra `images/book-cover-placeholder.svg`.
Al cambiar la URL se intenta cargar la nueva portada. `sizes` debe reflejar el ancho
de la tarjeta en el layout consumidor.

`copies` vale `0` por defecto y es independiente de `availability`:

| availability       | Color    | Descripción accesible       |
| ------------------ | -------- | --------------------------- |
| `yes`              | Verde    | Disponible aquí             |
| `no` (por defecto) | Rosa     | No disponible               |
| `yes-but-not-here` | Amarillo | Disponible en otra sucursal |

Presionar la portada muestra el “+” usando `NgpPress`; activar el botón emite
`add-click` sin payload y reproduce un desvanecimiento de 700 ms. El botón de
información emite únicamente `info-click`, también sin payload. Ambos funcionan
con teclado y no envían formularios. El “+” también se muestra al enfocar con
teclado para que la acción sea identificable. Se respeta `prefers-reduced-motion`.
La disponibilidad no bloquea la acción de agregar; esa decisión corresponde al consumidor.

Autor y título ocupan una línea cada uno y se truncan con ellipsis. El texto completo
se conserva en el DOM y en el atributo `title`. La cantidad tiene una descripción
accesible que comunica disponibilidad sin depender del color.
