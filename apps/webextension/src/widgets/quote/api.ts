import { PUBLIC_THEQUOTEAPI_KEY } from '$env/static/public';

export type Quote = { quote: string; author: string };
type QuoteProvider = () => Promise<Quote>;

const QuoteProviders: ReadonlyArray<QuoteProvider> = [
  async function quoteslate() {
    const response = await fetch('https://quoteslate.vercel.app/api/quotes/random').then(r => r.json());
    return { quote: response.quote, author: response.author };
  },
  async function dummyjson() {
    const response = await fetch('https://dummyjson.com/quotes/random').then(r => r.json());
    return { quote: response.quote, author: response.author };
  },
  async function thequoteapi() {
    const response = await fetch('https://thequoteapi.com/api/quotes/random/', {
      headers: { api_key: PUBLIC_THEQUOTEAPI_KEY },
    }).then(r => r.json());
    return { quote: response.text, author: response.author };
  },
];

export class QuoteFetchAggregatedError extends Error {
  constructor(public errors: Error[]) {
    super(`Failed to fetch quote: ${errors.map(e => e.message).join(', ')}`);
  }
}

export async function getRandomQuote(): Promise<Quote> {
  const errors: Error[] = [];
  for (const provider of QuoteProviders) {
    try {
      return await provider();
    } catch (error: any) {
      errors.push(error);
    }
  }

  throw new QuoteFetchAggregatedError(errors);
}
