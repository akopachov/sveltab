import { BackgroundProvider } from "$stores/background-catalog";
import { getStorage } from "$stores/storage";
import type { Settings } from "./settings";

const LocalSettingsKey = 'RandomImageBackgroundProvider_LocalSettings';

interface LocalSettings {
  lastChangedTime: number;
  lastUrl: string;
}

export class RandomImageBackgroundProvider extends BackgroundProvider {
  #interval: unknown;
  #lastSettings: Settings | undefined;
  constructor(node: HTMLElement) {
    super(node);
    this.#interval = setInterval(() => { 
      if (this.#lastSettings) {
        this.update(this.#lastSettings);
      }
    }, 60000);
  }

  async update(settings: Settings) {
    this.#lastSettings = settings;
    const storage = await getStorage();
    const localSettings: LocalSettings = (await storage.local.get(LocalSettingsKey))[LocalSettingsKey] || { lastChangedTime: 0, lastUrl: '' };
    const timeSinceLastChange = (new Date().valueOf() - localSettings.lastChangedTime) / 1000;
    if (timeSinceLastChange >= settings.updateInterval) {
      const response = await fetch(`https://source.unsplash.com/random/${window.innerWidth}×${window.innerHeight}/?${settings.searchTerms}`, { method: 'head' })
      localSettings.lastUrl = response.url;
      localSettings.lastChangedTime = new Date().valueOf();
      storage.local.set({ [LocalSettingsKey]: localSettings });
    }
    this.node.style.backgroundImage = `url("${localSettings.lastUrl}")`;
    this.node.style.backgroundSize = 'cover';
    this.node.style.backgroundPosition = 'center';
    this.node.style.transition = 'background-image 0.3s ease-in-out';
  }
  destroy() {
    clearInterval(this.#interval);
    this.node.style.backgroundImage = '';
    this.node.style.backgroundSize = '';
    this.node.style.backgroundPosition = '';
    this.node.style.transition = '';
  }
}
