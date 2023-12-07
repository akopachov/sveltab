import { BackgroundProvider } from "$stores/background-catalog";
import type { Settings } from "./settings";
import randomColor from 'randomcolor';

export class RandomColorBackgroundProvider extends BackgroundProvider {
  update(settings: Settings): void {
    this.node.style.backgroundColor = randomColor({ luminosity: settings.luminosity, hue: settings.hue });
  }
  destroy(): void {
    this.node.style.backgroundColor = '';
  }
}
