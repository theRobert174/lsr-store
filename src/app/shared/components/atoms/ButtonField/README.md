# ButtonField

Importa `ButtonField` en `imports` del componente consumidor. Se aplica sobre un
botón nativo para conservar teclado, foco, atributos ARIA y envío de formularios.
`NgpButton` aporta los estados de interacción; no necesitas importar su tema de ejemplo.

```html
<button btn-field (click)="cancel()">Cancelar</button>
<button btn-field variant="secondary" size="sm">Acción secundaria</button>
<button btn-field variant="destructive">Eliminar</button>
<button btn-field aria-label="Agregar producto">
  <ng-icon slot="leading" name="…" aria-hidden="true" />
</button>
```

Variantes: `primary` (predeterminada), `secondary`, `destructive`, `outline`,
`ghost`, `link`. Tamaños: `sm`, `md` (predeterminado), `lg`, `xl`.
Los slots `leading` y `trailing` permiten añadir iconos antes y después del texto.
Los botones con solo un icono necesitan un nombre accesible, por ejemplo `aria-label`.
La variante `link` sigue siendo una acción; para navegar utiliza un enlace.

## Signal Forms (Angular 22.2)

Un botón de envío no representa un valor del formulario: no necesita
`FormValueControl`, `model()` ni `[formField]`. Usa `FormRoot` y los estados del formulario:

```ts
import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ButtonField } from './ButtonField';
import { InputField } from '@components/molecules/InputField/InputField';

@Component({
  imports: [ButtonField, InputField, FormField, FormRoot],
  template: `
    <form [formRoot]="fields">
      <input-field label="Nombre" [formField]="fields.name" />
      <button
        btn-field
        type="submit"
        [disabled]="fields().submitting() || fields().pending()"
        [attr.aria-busy]="fields().submitting()"
      >
        {{ fields().submitting() ? 'Guardando…' : 'Guardar' }}
      </button>
    </form>
  `,
})
export class ExampleForm {
  readonly data = signal({ name: '' });
  readonly fields = form(this.data, (path) => required(path.name), {
    submission: {
      action: async () => {
        // Sustituye esta demostración por tu servicio de persistencia.
        console.log(this.data());
      },
    },
  });
}
```

El tipo predeterminado es `button`: utiliza `type="submit"` explícitamente para enviar.
`FormRoot` ejecuta `submission.action` cuando el formulario es válido y gestiona
`submitting()`. Mantener el botón habilitado cuando hay errores permite intentar
enviar y mostrar la validación. `[disabled]` expone directamente el input de `NgpButton`;
usa booleanos para bloquear también los clics nativos.

`type="reset"` conserva el comportamiento HTML. Para reiniciar el modelo y el estado
de Signal Forms, usa un botón de acción con `(click)="fields().reset({ name: '' })"`.

## Estilos

Los tokens públicos `--lsr-button-*` están en `src/styles.css` para compartir el tema
entre todos los botones. `ButtonField.css` contiene tamaños, variantes y estados de
interacción. La variable `--ng-icon__size` pertenece a `ng-icons` y solo ajusta los iconos.
Puedes sobrescribir los tokens globalmente o en un contenedor:

```css
.checkout {
  --lsr-button-background: #166534;
  --lsr-button-background-hover: #14532d;
  --lsr-button-background-active: #052e16;
  --lsr-button-radius: 999px;
}
```

El tema inicial es claro; al definir uno oscuro ajusta también las superficies,
textos, bordes y foco para conservar el contraste.

Referencias: [NgpButton](https://angularprimitives.com/primitives/button/),
[envío con Signal Forms](https://angular.dev/guide/forms/signals/form-submission).
