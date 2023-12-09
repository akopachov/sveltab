import { BackgroundProvider } from "$stores/background-catalog";
import type { Settings } from "./settings";
import randomColor from 'randomcolor';

export class RandomColorBackgroundProvider extends BackgroundProvider {
  constructor(node: HTMLElement) {
    super(node);
    this.node.style.transition = 'background-color 0.3s ease';
  }
  update(settings: Settings): void {
    this.node.style.backgroundColor = randomColor({ luminosity: settings.luminosity, hue: settings.hue });
  }
  destroy(): void {
    this.node.style.backgroundColor = '';
    this.node.style.transition = '';
  }
}
