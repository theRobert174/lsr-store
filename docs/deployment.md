# Publicar LSR en Cloudflare

La dirección preparada es **https://libreria.rodrigomartinez.dev**. Es un proyecto
independiente llamado `lsr-store`. El portafolio continúa en `rodrigomartinez.dev`.
El subdominio está configurado en el código, pero no se ha publicado desde este checkout.

## Qué archivos intervienen

- `cloudflare.config.ts`: nombre, subdominio y comportamiento SPA para rutas de Angular.
- `scripts/cloudflare-build.mjs`: compila Angular y después empaqueta los archivos estáticos.
- `scripts/cloudflare-package.mjs`: genera `.cloudflare/output/v0/` con los utilitarios oficiales de Cloudflare.
- `.github/workflows/ci.yml`: comprueba formato, tipos, pruebas y la preparación del despliegue; no publica.

La aplicación se sirve como **Workers Static Assets**, sin funciones de servidor ni
API. Las rutas como `/seller/catalog` y `/seller/checkout` cargan `index.html`.

La CLI `cf` beta todavía no configura ni compila Angular directamente. Por eso Angular
conserva su compilación habitual y el script empaqueta su salida para
`cf deploy --prebuilt`. La CLI y el utilitario de empaquetado tienen versiones exactas
para evitar cambios inesperados en el formato beta. No ejecutes `cf init` ni `cf deploy`
sin `--prebuilt` en este proyecto.

## Opción 1: publicar desde tu terminal

Usa Node **22.23.1** y pnpm **12.15.0**:

```bash
pnpm install --frozen-lockfile
pnpm cloudflare:typecheck
pnpm build:cloudflare
pnpm cloudflare:check
```

`cloudflare:check` valida los archivos sin subirlos ni modificar tu cuenta.

Para publicar, inicia sesión con tu cuenta de Cloudflare y ejecuta:

```bash
pnpm exec cf auth login
pnpm exec cf auth whoami
pnpm deploy:cloudflare
```

El navegador solicita el inicio de sesión. Selecciona la cuenta que administra
`rodrigomartinez.dev`. Si tienes varias cuentas, la CLI puede pedir cuál usar.
No pegues tokens ni contraseñas en el chat o en el repositorio.

`pnpm deploy:cloudflare` publica el paquete que generó `pnpm build:cloudflare`. Vuelve a compilar
antes de cada publicación para incluir tus últimos cambios. El dominio configurado
es únicamente `libreria.rodrigomartinez.dev`; la CLI gestionará su asociación al Worker.
Si ese subdominio ya tiene otro servicio, revisa el conflicto antes de reemplazarlo.

## Opción 2: conectar GitHub desde el panel

Primero sube a GitHub los cambios preparados en este proyecto. Después:

1. En Cloudflare abre **Workers & Pages → Create application**.
2. Importa el repositorio `theRobert174/lsr-store` como un proyecto Workers.
3. En la pantalla **Set up your application**, cambia los valores predeterminados
   por estos. Los nombres de la tabla corresponden al formulario en inglés:

   | Campo visible                      | Qué poner                                                              |
   | ---------------------------------- | ---------------------------------------------------------------------- |
   | **Project name**                   | `lsr-store`                                                            |
   | **Build command**                  | `pnpm run build:cloudflare`                                            |
   | **Deploy command**                 | `pnpm run deploy:cloudflare`                                           |
   | **Enable Preview builds**          | Desactivado                                                            |
   | **Preview command**                | No se utiliza con Preview builds desactivado; puede conservar su valor |
   | **Protect with Cloudflare Access** | Desactivado, para que la demo sea pública                              |

   Los comandos `npx wrangler deploy` y `npx wrangler preview` que aparecen al abrir
   el formulario son valores predeterminados del panel. Este proyecto tiene sus
   propios scripts: usa el **Deploy command** de la tabla y desactiva los previews.

   Abre **Advanced settings** y localiza las variables de compilación
   (**Build variables**, **Environment variables** o **Variables and secrets**, según
   la sección mostrada). Añade `NODE_VERSION=22.23.1` y `PNPM_VERSION=12.15.0`.
   Si aparece el directorio raíz, conserva la raíz del repositorio (`/` o el valor
   predeterminado). La rama de producción es `main`; si no se muestra en esta
   pantalla, compruébala después en **Settings → Builds**.

   Antes de pulsar **Deploy**, comprueba que los cambios de este proyecto ya están
   subidos a GitHub en `main`, incluidos `package.json`, `pnpm-lock.yaml`,
   `cloudflare.config.ts` y los dos scripts `scripts/cloudflare-*.mjs`. Cloudflare
   compila el repositorio remoto, no los archivos locales del IDE.

4. Pulsa **Deploy** y revisa el registro de compilación. El panel gestiona la autorización del
   despliegue; no necesitas iniciar sesión con la CLI dentro del build.
5. Comprueba en **Settings → Domains & Routes** que aparece
   `libreria.rodrigomartinez.dev`. Si falta, usa **Add → Custom Domain** con ese nombre.
   Cloudflare gestiona el registro DNS y el certificado para el dominio personalizado.

Workers recibe los archivos desde `.cloudflare/output/v0/`; no pide una carpeta de
salida como Pages. La salida original de Angular sigue siendo `dist/lsr-store/browser`.

Para las ramas de vista previa, deja deshabilitadas las publicaciones automáticas al
principio. Esta configuración declara el subdominio de producción; prepara un destino
separado antes de habilitar despliegues de otras ramas.

## Comprobar la publicación

1. Abre `https://libreria.rodrigomartinez.dev` y pulsa **Explorar demo**.
2. Abre `/seller/catalog` directamente y recarga.
3. Agrega un libro, entra al checkout y recarga: el carrito debe conservarse.
4. Completa una venta simulada, recarga el ticket y prueba su impresión.
5. Comprueba que `/images/social-preview.png` y `/favicon.svg` cargan.
6. Añade una tarjeta a tu portafolio con enlace a la demo y al repositorio.

El título, URL canónica y la imagen para compartir ya apuntan al subdominio propuesto.
Si prefieres otro nombre, actualiza `worker.domains` en `cloudflare.config.ts`, las
URLs de `src/index.html` y esta guía antes de compilar.

## Comprobaciones locales

```bash
pnpm format:check
pnpm test --watch=false
pnpm e2e:typecheck
pnpm cloudflare:typecheck
pnpm build:cloudflare
pnpm cloudflare:check
pnpm e2e:production
```

Para revisar sin publicar, `pnpm preview` sirve la compilación en
`http://localhost:4173`. Instala Chromium una vez con `pnpm e2e:install` para E2E.

## Alcance de los datos

Cada origen de navegador conserva su propio carrito, nombre demo y hasta 50 tickets
bajo claves `lsr-demo:v1:*`. Un ticket compartido con otro navegador no estará disponible
allí. Los datos del desarrollo local no se trasladan al nuevo subdominio. Restablecer
la demo elimina únicamente las claves de LSR.

Las ventas no reducen el catálogo original: son simulaciones sobre un inventario
ilustrativo. No se solicitan datos financieros ni se guardan contraseñas.

## Referencias oficiales

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Routing SPA](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Desplegar Build Output con cf](https://developers.cloudflare.com/cf/projects/#deploy-a-prebuilt-build)
- [Comandos y variables de Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Dominios personalizados de Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
