# SvelTab

[![License](https://img.shields.io/github/license/akopachov/sveltab)](/LICENSE)

A beautiful, customisable New Tab page for Firefox and Chrome.

We care about your privacy and your experience. SvelTab is private, fast, and free.

Key concepts and decisions behind SvelTab:

1. No ads, no trackers, no analytics, no data-mining or simillar things
2. Preference to open-sourced privacy-oriented 3rd party services
3. Load time should be low, overall performance should be high
4. No support for obsolete browsers, no polyfills
5. Firefox as a primary browser for development and testing

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

## Want to say thank you?

* Buy me a coffee [here](https://ko-fi.com/akopachov) (No account needed, one-time)
* Become a patron at [Patreon](https://patreon.com/akopachov) (Account needed)
* [Z.Cash](https://z.cash/): `t1PCzJrd96RUfzjzhBERfXEFvSi7W6V86hM`
* [TON](https://ton.org/): `EQCSBzoTb1B7RhXnka5RegmdjHR3gQwRVgZHNPPqzjjvlW9T`
