import { storage } from '$stores/storage';
import { browser } from '$app/environment';

const IMAGE_BACKGROUND_HISTORY_KEY = 'imageBackgroundHistory';
const MAX_HISTORY_LENGTH = 100;

export interface ImageBackgroundHistoryStorage {
  url: string[];
  provider: string;
  currentIndex: number;
}

export class ImageBackgroundHistory {
  #ready: boolean = false;
  #history: string[] = [];
  #provider: string;
  #currentIndex: number = -1;

  constructor(provider: string) {
    this.#provider = provider;
    storage.local.get(IMAGE_BACKGROUND_HISTORY_KEY).then(result => {
      let pendingItems: string[] = [];
      if (this.#history.length > 0) {
        pendingItems = this.#history;
      }
      const storedHistory = result[IMAGE_BACKGROUND_HISTORY_KEY] as ImageBackgroundHistoryStorage;
      if (storedHistory?.provider === provider) {
        this.#history = storedHistory.url || [];
        for (const item of pendingItems) {
          this.add(item);
        }
        this.#currentIndex = Math.min(this.#history.length - 1, storedHistory.currentIndex);
      } else {
        this.#currentIndex = this.#history.length - 1;
      }
      this.#ready = true;
    });

    if (browser) {
      window.addEventListener('beforeunload', () => this.save());
    }
  }

  add(url: string) {
    if (this.#history[this.#history.length - 1] === url) return;
    this.#history.push(url);
    if (this.#history.length > MAX_HISTORY_LENGTH) {
      this.#history.shift();
    }

    this.#currentIndex = this.#history.length - 1;
  }

  clear() {
    this.#history = [];
    this.#currentIndex = -1;
  }

  getPrevious(): string | null {
    if (this.#currentIndex < 0) return null;
    this.#currentIndex--;
    return this.#history[this.#currentIndex];
  }

  getNext(): string | null {
    if (this.#currentIndex >= this.#history.length - 1) return null;
    this.#currentIndex++;
    return this.#history[this.#currentIndex];
  }

  get current() {
    return this.#history[this.#currentIndex];
  }

  get hasPrevious() {
    return this.#currentIndex > 0;
  }

  get hasNext() {
    return this.#currentIndex < this.#history.length - 1;
  }

  async save() {
    if (!this.#ready) return;
    await storage.local.set({
      [IMAGE_BACKGROUND_HISTORY_KEY]: {
        provider: this.#provider,
        url: this.#history,
        currentIndex: this.#currentIndex,
      } satisfies ImageBackgroundHistoryStorage,
    });
  }
}
