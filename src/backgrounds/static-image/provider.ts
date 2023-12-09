import { ImageBackgroundProviderBase } from "$backgrounds/common-image/provider-base";
import type { Settings } from "./settings";

export class StaticImageBackgroundProvider extends ImageBackgroundProviderBase {
  update(settings: Settings): void {
    this.setImage(settings);
  }
  destroy(): void {
    super.destroy();
  }
}
