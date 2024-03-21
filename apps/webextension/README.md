# SvelTab web extension

## Developing

To develop with external services you will additionally need to signup for your own API keys and enter them into your `.env` file. Get started by copying the example provided `cp .env.example .env`

Once done, use

```bash
pnpm -r install
pnpm dev:webext
```

## Building

To build production artifacts use

```bash
pnpm -r install
pnpm nx build webextension
```

Then to generate web extension package based of production artifacts use

```bash
pnpm nx build:web-ext:firefox webextension
pnpm nx build:web-ext:chromium webextension
```
