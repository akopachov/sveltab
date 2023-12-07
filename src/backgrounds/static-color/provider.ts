import { BackgroundProvider } from "$stores/background-catalog";
import type { Settings } from "./settings";

export class StaticColorBackgroundProvider extends BackgroundProvider {
  update(settings: Settings): void {
    this.node.style.backgroundColor = settings.color;
  }
  destroy(): void {
    this.node.style.backgroundColor = '';
  }
}
