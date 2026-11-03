# Publicar la demo

## Verificar la compilación local

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm test --watch=false
pnpm e2e:typecheck
pnpm build
pnpm exec playwright install chromium
pnpm e2e:production
pnpm preview
```

Abre `http://localhost:4173/seller/catalog` directamente y recarga. El servidor incluido sirve `index.html` para las rutas de Angular y devuelve 404 para archivos estáticos inexistentes.

## Netlify o Vercel

Importa el repositorio en tu cuenta y usa la configuración incluida. La compilación es `pnpm build` y la salida `dist/lsr-store/browser`. Selecciona Node 24.15.0 o superior de la rama 24 y el pnpm definido en `packageManager`.

Los archivos estáticos existentes se sirven normalmente; las rutas de la aplicación deben reescribirse a `index.html` con respuesta 200. Esta es la [configuración requerida por Angular para aplicaciones con rutas](https://angular.dev/tools/cli/deployment).

Después de obtener la URL pública:

1. Añade el enlace real a la sección “Probar la demo” del README y al campo Website del repositorio.
2. Comprueba acceso directo y recarga en `/auth`, `/seller/catalog` y `/seller/checkout`.
3. Completa una venta, recarga el ticket y prueba “Imprimir ticket”.
4. La imagen Open Graph utiliza la captura incluida en `public/images/social-preview.png`, alojada en la rama principal del repositorio. Si cambias la visibilidad o el nombre del repositorio, cambia `og:image` en `src/index.html` a la URL pública absoluta de esa imagen en tu hosting.

No se ha ejecutado una publicación desde este checkout.

## Hosting bajo un subdirectorio

Por ejemplo, si el sitio vive en `/lsr-store/`:

```bash
pnpm ng build --base-href /lsr-store/
pnpm preview --base-path /lsr-store/
```

Abre `http://localhost:4173/lsr-store/seller/catalog`. El hosting debe reescribir las rutas de ese prefijo a `/lsr-store/index.html`. Los recursos de la aplicación usan rutas relativas al `base href`.

En GitHub Pages, los enlaces profundos requieren una estrategia adicional de fallback porque Pages no ofrece estas reescrituras de servidor. Las configuraciones incluidas para Netlify y Vercel permiten conservar URLs normales y respuesta 200 sin ese comportamiento adicional.

## Alcance de los datos

Cada origen de navegador conserva su propio carrito, nombre demo y hasta 50 tickets bajo claves `lsr-demo:v1:*`. Un ticket compartido con otro navegador no estará disponible allí. Restablecer la demo elimina únicamente esas claves; no utiliza `localStorage.clear()`.

Las ventas no reducen el catálogo original: son simulaciones independientes sobre un inventario ilustrativo. No se solicitan datos financieros ni se guardan contraseñas.
