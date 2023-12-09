import { BackgroundProvider } from "$stores/background-catalog";
export abstract class ImageBackgroundProviderBase extends BackgroundProvider {
  constructor(node: HTMLElement) {
    super(node);
    this.node.style.backgroundSize = 'cover';
    this.node.style.backgroundPosition = 'center';
    this.node.style.transition = 'background-image 0.3s ease-in-out';
  }
  setImage(settings: {url: string, blur: number}): void {
    this.node.style.backgroundImage = `url("${settings.url}")`;
    if (settings.blur > 0) { 
      this.node.style.filter = `blur(${settings.blur}px)`;
      this.node.style.position = 'absolute';
      this.node.style.inset = `-${settings.blur}px ${settings.blur}px ${settings.blur}px -${settings.blur}px`;
      this.node.style.width = `calc(100% + ${settings.blur * 2}px)`;
      this.node.style.height = `calc(100% + ${settings.blur * 2}px)`;
    } else {
      this.node.style.filter = '';
      this.node.style.inset = '';
      this.node.style.width = '';
      this.node.style.height = '';
      this.node.style.position = '';
    }
  }
  destroy(): void {
    this.node.style.backgroundImage = '';
    this.node.style.backgroundSize = '';
    this.node.style.backgroundPosition = '';
    this.node.style.transition = '';
    this.node.style.filter = '';
    this.node.style.inset = '';
    this.node.style.width = '';
    this.node.style.height = '';
    this.node.style.position = '';
  }
}
