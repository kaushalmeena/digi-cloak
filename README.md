# Digi-Cloak

A web app that hides secrets in plain sight securely in images with the help of AES encryption and LSB steganography technique.

Live version is deployed at [https://kaushalmeena.github.io/digi-cloak/](https://kaushalmeena.github.io/digi-cloak/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes.

### Requirements

To install and run this project you need:

- [Node.js](https://nodejs.org/ "Node.js") `^22.22.3 || ^24.15.0 || >=26.0.0` (an `.nvmrc` is included — run `nvm use` if you use [nvm](https://github.com/nvm-sh/nvm "nvm"))
- [pnpm](https://pnpm.io/installation "pnpm")
- [git](https://git-scm.com/downloads "git") (only to clone this repository)

### Installation

To set up everything in your local machine, you need to follow these steps:

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

### Building

To create a production build:

```bash
pnpm build
```

The build output is written to the `dist` folder.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
