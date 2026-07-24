<div align="center">

<img src="public/favicon.svg" alt="Digi-Cloak logo" width="96" height="96" />

# Digi-Cloak

**Hide secrets in plain sight.**

A free, open-source web app that tucks your private messages inside ordinary
images — guarded by **AES encryption** and **LSB steganography**, so what you
share looks like nothing more than a picture.

[**Try it live**](https://kaushalmeena.github.io/digi-cloak/)

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639?logo=opensourceinitiative&logoColor=white)](LICENSE) [![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## Features

- **AES encryption** — your message is scrambled with AES using a secret
  password only you know.
- **LSB steganography** — the encrypted bytes are woven into an image's pixels,
  invisible to the eye.
- **Share anywhere** — send the image anywhere; without your password it is just
  a picture.
- **Client-side only** — everything runs 100% in your browser; no uploads, no
  servers, no tracking.
- **PWA** — installable and offline-ready on any device.

## How It Works

1. **Encrypt** — your message is scrambled with AES using a secret password only
   you know.
2. **Hide** — the encrypted bytes are woven into an image's pixels via LSB
   steganography, invisible to the eye.
3. **Share** — send the image anywhere; without your password it is just a
   picture.
4. **Reveal** — drop the image back in, enter the password, and the secret
   reappears.

> Everything runs **100% in your browser** — no uploads, no servers, no tracking.

## Tech Stack

| Area              | Tools                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Framework**     | [Angular 22](https://angular.dev) · [TypeScript](https://www.typescriptlang.org) · [RxJS](https://rxjs.dev) |
| **Styling**       | [Tailwind CSS 4](https://tailwindcss.com) · [PostCSS](https://postcss.org) |
| **Cryptography**  | [crypto-js](https://github.com/brix/crypto-js) (AES)                  |
| **Steganography** | Custom LSB encoder on the Canvas API, run in a Web Worker              |
| **PWA**           | Angular Service Worker (installable, offline-ready)                   |
| **Testing**       | [Karma](https://karma-runner.github.io) + [Jasmine](https://jasmine.github.io) (unit) · [Playwright](https://playwright.dev) (e2e) |
| **Tooling**       | [pnpm](https://pnpm.io) · [ESLint](https://eslint.org) · [Prettier](https://prettier.io) |
| **Hosting**       | [GitHub Pages](https://pages.github.com)                              |

## Getting Started

These instructions will get you a copy of the project up and running on your
local machine for development purposes.

### Requirements

To install and run this project you need:

- [Node.js](https://nodejs.org/) `^22.22.3 || ^24.15.0 || >=26.0.0` (an `.nvmrc` is included — run `nvm use` if you use [nvm](https://github.com/nvm-sh/nvm))
- [pnpm](https://pnpm.io/installation)
- [git](https://git-scm.com/downloads) (only to clone this repository)

### Installation

To set up everything on your local machine, follow these steps:

1. Clone this repo and then change directory to the `digi-cloak` folder:

```bash
git clone https://github.com/kaushalmeena/digi-cloak.git
cd digi-cloak
```

2. Install project dependencies using pnpm:

```bash
pnpm install
```

### Running

To run the project simply run:

```bash
pnpm dev
```

Your app should now be running on [localhost:4200](http://localhost:4200/).

### Testing

To run the unit tests:

```bash
pnpm test
```

To run the end-to-end tests (Playwright):

```bash
pnpm exec playwright install chromium   # first time only
pnpm e2e
```

To lint the project:

```bash
pnpm lint
```

To format the code with Prettier:

```bash
pnpm format
```

### Building

To create a production build:

```bash
pnpm build
```

The build output is written to the `dist` folder.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please
[open an issue](https://github.com/kaushalmeena/digi-cloak/issues/new/choose)
first to discuss it. For code changes, fork the repository, create a branch,
and open a pull request.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE)
file for details.
