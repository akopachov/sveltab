import { BackgroundProvider } from "$stores/background-catalog";
import type { Settings } from "./settings";

export class StaticImageBackgroundProvider extends BackgroundProvider {
  update(settings: Settings): void {
    this.node.style.backgroundImage = `url("${settings.url}")`;
    this.node.style.backgroundSize = 'cover';
    this.node.style.backgroundPosition = 'center';
    this.node.style.transition = 'background-image 0.3s ease-in-out';
  }
  destroy(): void {
    this.node.style.backgroundImage = '';
    this.node.style.backgroundSize = '';
    this.node.style.backgroundPosition = '';
    this.node.style.transition = '';
  }
}
