import { BackgroundProvider } from '$stores/background-catalog';
import debounce from 'debounce';
import type { Settings } from './settings';
import randomColor from 'randomcolor';

export class RandomColorBackgroundProvider extends BackgroundProvider<Settings> {
  #unsubscribe!: () => void;

  apply(): void {
    this.node.style.transition = 'background-color 0.3s ease';
    const forceUpdateDeb = debounce(() => this.forceUpdate(), 10);
    const hueUnsubscribe = this.settings.hue.subscribe(() => forceUpdateDeb());
    const luminosityUnsubscribe = this.settings.luminosity.subscribe(() => forceUpdateDeb());
    this.#unsubscribe = () => {
      hueUnsubscribe();
      luminosityUnsubscribe();
    };
    this.forceUpdate();
  }
  forceUpdate(): void {
    this.node.style.backgroundColor = randomColor({
      luminosity: this.settings.luminosity.value,
      hue: this.settings.hue.value,
    });
  }
  destroy(): void {
    this.#unsubscribe();
    this.node.style.backgroundColor = '';
    this.node.style.transition = '';
  }
}
