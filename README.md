# LsrStore

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.4.

## Installation

This project uses pnpm 12.15.0. Install dependencies with:

```bash
pnpm install
```

## Development server

To start a local development server, run:

```bash
pnpm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
pnpm ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
pnpm ng generate --help
```

## Building

To build the project run:

```bash
pnpm build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
pnpm test
```

## Running end-to-end tests

Playwright runs AuthPage tests in desktop Chromium and mobile Chromium (Pixel 7), including AXE accessibility checks. Install the browser once:

```bash
pnpm e2e:install
```

On Linux CI, install the browser and its system dependencies with `pnpm exec playwright install --with-deps chromium`.

```bash
pnpm e2e            # Run all E2E tests
pnpm e2e:ui         # Open the interactive test runner
pnpm e2e:report     # Open the latest HTML report
pnpm e2e:typecheck  # Type-check E2E tests and configuration
```

Playwright starts and stops Angular automatically at `http://127.0.0.1:4300`. Keep that port free. Failed tests save screenshots and traces in `test-results/`; the HTML report is saved in `playwright-report/`.

The E2E suite covers startup and fallback routes, required fields, focus management, keyboard submission, usernames without email formatting, retrying when the backend is unconfigured, responsive layout, and accessibility. `AUTHENTICATE` currently has no provider, so the browser tests assert the actual unconfigured-backend message. Successful authentication, rejected credentials, and pending submissions remain covered by `AuthPage.spec.ts` unit tests until a backend is connected.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
