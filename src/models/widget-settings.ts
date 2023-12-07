import { Subscribable, type OmitSubscribable } from "./subscribable";

export class WidgetSettingsExtra extends Subscribable {
  [key: string | number | symbol]: any;
}
export type WidgetSettingsExtraInitial<T extends WidgetSettingsExtra> = Partial<OmitSubscribable<T>>
export type WidgetSettingsInitial = Partial<Omit<OmitSubscribable<WidgetSettings>, 'extra'>> & Required<Pick<WidgetSettings, 'type'>> & { extra?: WidgetSettingsExtraInitial<WidgetSettingsExtra> }

export class WidgetSettings extends Subscribable {
  constructor(initial: WidgetSettingsInitial, extraConstructor: (new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra)) {
    super()
    this.type = initial.type;
    this.x = initial.x || 0;
    this.y = initial.y || 0;
    this.width = initial.width || 10;
    this.height = initial.height || 10;
    this.rotation = initial.rotation || 0;
    this.zIndex = initial.zIndex || 0;
    this.borderRadius = initial.borderRadius || 0;
    this.keepRatio = Boolean(initial.keepRatio);
    this.extra = new extraConstructor(initial.extra || {});
  }

  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  borderRadius: number;
  extra: WidgetSettingsExtra;
  keepRatio: boolean;
}

export type FontSettingsInitial = Partial<OmitSubscribable<FontSettings>>
export class FontSettings extends Subscribable {
  constructor(initial: FontSettingsInitial) {
    super();
    this.id = initial.id || 'noto-sans';
    this.weight = initial.weight || 400;
  }

  id: string;
  weight: number;
}
