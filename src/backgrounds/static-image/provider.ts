import { BackgroundProvider } from "$stores/background-catalog";
import type { Settings } from "./settings";

export class StaticImageBackgroundProvider extends BackgroundProvider {
  update(settings: Settings): void {
    this.node.style.backgroundImage = `url("${settings.url}")`;
    this.node.style.backgroundSize = 'cover';
  }
  destroy(): void {
    this.node.style.backgroundImage = '';
    this.node.style.backgroundSize = '';
  }
}
