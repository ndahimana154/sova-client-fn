# SOVA Client

![SOVA Marketplace](public/sova-logo-horizontal.svg)

SOVA Client is a responsive marketplace storefront for discovering everyday
products across technology, fashion, home, beauty, grocery, and sports
categories. It is currently a frontend prototype built with React and static
catalog data.

## Features

- Responsive storefront with desktop and mobile navigation
- Category, promotion, brand, and curated product sections
- Product ratings, discounts, and Rwandan franc price formatting
- In-memory shopping cart with quantity controls and subtotal calculation
- In-memory favorites list
- Accessible slide-out cart and favorites drawers
- Responsive product interactions for mouse and touch devices
- Staging deployment workflow through GitHub Actions

## Tech stack

- [React 19](https://react.dev/) for the user interface
- [TypeScript](https://www.typescriptlang.org/) with strict type checking
- [Vite 6](https://vite.dev/) for development and production builds
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
- ESLint 9 for code quality

## Getting started

### Prerequisites

- A recent Node.js LTS release
- npm

### Installation

```bash
git clone https://github.com/ndahimana154/sova-client-fn.git
cd sova-client-fn
npm install
```

Start the development server:

```bash
npm run dev
```

Vite prints the local development URL in the terminal, typically
`http://localhost:5173`.

No environment variables or external services are required for local
development. Product and promotion photos are loaded from Unsplash, so those
images require an internet connection.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run lint` | Run ESLint across the project |
| `npm run check` | Run linting followed by a production build |
| `npm run preview` | Serve the production build locally for inspection |

Before submitting a change, run:

```bash
npm run check
```

## Project structure

```text
.
├── public/                    Static logos and hero artwork
├── src/
│   ├── components/
│   │   ├── layout/            Header and footer
│   │   └── ui/                Reusable brand, drawer, and heading UI
│   ├── data/                  Product, category, and brand data
│   ├── features/
│   │   ├── cart/              Cart drawer and cart types
│   │   ├── catalog/           Product, category, and brand components
│   │   └── favorites/         Favorites drawer
│   ├── lib/                   Shared utilities
│   ├── pages/home/            Home page sections
│   ├── App.tsx                Application state and feature coordination
│   ├── index.css              Tailwind theme and shared component styles
│   └── main.tsx               React entry point
├── .github/workflows/         Staging deployment automation
├── index.html                 Vite HTML entry point
├── vite.config.ts             Vite, React, and Tailwind configuration
└── package.json               Dependencies and npm scripts
```

## How the application works

`App.tsx` owns the cart, favorites, drawer visibility, and toast message state.
It passes event handlers to the home page and drawers. Catalog content is
defined in `src/data/catalog.ts`, while `src/pages/home/HomePage.tsx` composes
the storefront sections.

Prices are stored as numbers and displayed as Rwandan francs by
`src/lib/formatPrice.ts`. The design tokens for SOVA's orange, neutral colors,
spacing helpers, buttons, and product interactions live in `src/index.css`.

To add or edit catalog content, update the exported arrays in
`src/data/catalog.ts`. Product names currently act as item identifiers, so each
name should remain unique.

## Current scope

This repository contains the storefront UI only. Cart and favorites data is
held in React state and resets when the page reloads. Search, authentication,
checkout, newsletter submission, navigation destinations, and backend catalog
integration are represented in the interface but are not connected to
production services yet.

## Production build

Create and inspect an optimized build locally:

```bash
npm run build
npm run preview
```

The generated static site is written to `dist/` and can be hosted by any static
web server.

## Staging deployment

The workflow in `.github/workflows/deploy-staging.yml` runs when changes are
pushed to the `staging` branch or when it is started manually. It connects to
the staging server over SSH and runs:

```bash
bash /var/www/sova/scripts/deploy-client.sh
```

The repository must define these GitHub Actions secrets:

- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_PORT` (optional; defaults to `22`)
- `SERVER_SSH_KEY`

The remote host is responsible for checking out/building the application in
its deployment script.
