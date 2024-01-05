import { BackgroundProvider } from '$stores/background-catalog';
import type { Settings } from './settings';

export class StaticColorBackgroundProvider extends BackgroundProvider<Settings> {
  #unsubscribe!: () => void;
  apply(): void {
    this.#unsubscribe = this.settings.color.subscribe(() => this.forceUpdate());
  }
  forceUpdate(): void {
    this.node.style.backgroundColor = this.settings.color.value;
  }
  destroy(): void {
    this.node.style.backgroundColor = '';
    this.#unsubscribe();
  }
}
