# SvelTab web extension

## Developing

To develop with external services you will additionally need to signup for your own API keys and enter them into your `.env` file. Get started by copying the example provided `cp .env.example .env`

Once done, use

```bash
pnpm install
pnpm dev
```

## Building

To build production artifacts use

```bash
pnpm install
pnpm build
```

Then to generate web extension package based of production artifacts use

```bash
pnpm build:web-ext
```
