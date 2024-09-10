import { BackgroundProvider } from '../types';
import debounce from 'debounce';
import type { Settings } from './settings';
import randomColor from 'randomcolor';
import Color from 'color';
import type { BackgroundCornerColorChangedEventArgs } from '$actions/dynamic-background';

export class RandomColorBackgroundProvider extends BackgroundProvider<Settings> {
  #unsubscribe!: () => void;

  get canGoNext() {
    return true;
  }

  get canGoBack() {
    return false;
  }

  goBack(): Promise<void> | void {
    return;
  }
  async goNext(): Promise<void> {
    await this.forceUpdate();
  }

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
    const color = Color.rgb(
      randomColor({
        luminosity: this.settings.luminosity.value,
        hue: this.settings.hue.value,
        format: 'rgbArray',
      }),
    );
    const hexColor = color.hex();
    this.node.style.backgroundColor = hexColor;
    this.node.dispatchEvent(
      new CustomEvent<BackgroundCornerColorChangedEventArgs>('cornerColorChanged', {
        detail: { color: hexColor, isDark: color.isDark() },
      }),
    );
  }
  destroy(): void {
    this.#unsubscribe();
    this.node.style.backgroundColor = '';
    this.node.style.transition = '';
  }
}
