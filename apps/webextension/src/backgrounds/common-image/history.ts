import { storage } from '$stores/storage';
import { browser } from '$app/environment';
import pDebounce from 'p-debounce';
import { secondsToMilliseconds } from 'date-fns';

const IMAGE_BACKGROUND_HISTORY_KEY = 'imageBackgroundHistory';
const MAX_HISTORY_LENGTH = 100;

export interface ImageBackgroundHistoryStorage {
  url: string[];
  provider: string | null;
  currentIndex: number;
}

export class ImageBackgroundHistory {
  #historyRestored: boolean = false;
  #history: string[] = [];
  #provider: string | null = null;
  #currentIndex: number = -1;
  #unsubscribe: (() => void) | undefined;
  #hasChanges: boolean = false;
  #saveDebounced = pDebounce(() => this.save(), secondsToMilliseconds(5));

  constructor() {
    if (browser) {
      const beforeUnloadHandler = () => this.save();
      window.addEventListener('beforeunload', beforeUnloadHandler);
      this.#unsubscribe = () => window.removeEventListener('beforeunload', beforeUnloadHandler);
    }
  }

  async setProvider(provider: string) {
    if (this.#provider === provider) return;

    this.#provider = provider;
    if (!this.#historyRestored) {
      const storedHistory = (await storage.local.get(IMAGE_BACKGROUND_HISTORY_KEY))[
        IMAGE_BACKGROUND_HISTORY_KEY
      ] as ImageBackgroundHistoryStorage;
      let pendingItems: string[] = [];
      if (this.#history.length > 0) {
        pendingItems = this.#history;
      }
      if (storedHistory?.provider === this.#provider) {
        this.#history = storedHistory.url || [];
        for (const item of pendingItems) {
          this.add(item);
        }
        this.#currentIndex = Math.min(this.#history.length - 1, storedHistory.currentIndex);
      } else {
        this.#currentIndex = this.#history.length - 1;
      }

      this.#historyRestored = true;
    } else {
      this.clear();
    }
  }

  add(url: string) {
    if (this.#history[this.#history.length - 1] === url) return;
    this.#history.push(url);
    if (this.#history.length > MAX_HISTORY_LENGTH) {
      this.#history.shift();
    }

    this.#currentIndex = this.#history.length - 1;
    this.#hasChanges = true;
    this.#saveDebounced();
  }

  clear() {
    this.#history = [];
    this.#currentIndex = -1;
    this.#hasChanges = true;
    this.#saveDebounced();
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
    if (!this.#historyRestored || !this.#hasChanges) return;
    await storage.local.set({
      [IMAGE_BACKGROUND_HISTORY_KEY]: {
        provider: this.#provider,
        url: this.#history,
        currentIndex: this.#currentIndex,
      } satisfies ImageBackgroundHistoryStorage,
    });
    this.#hasChanges = false;
  }

  dispose() {
    if (this.#unsubscribe) {
      this.#unsubscribe();
    }
  }
}
