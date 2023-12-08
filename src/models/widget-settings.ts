import { Subscribable, type OmitSubscribable } from "./subscribable";

export type WidgetPositionInitial = Partial<OmitSubscribable<WidgetPosition>>;

export class WidgetPosition extends Subscribable {
  constructor(initial: WidgetPositionInitial) {
    super()
    this.x = initial.x || 0;
    this.y = initial.y || 0;
    this.offsetX = initial.offsetX || 0;
    this.offsetY = initial.offsetY || 0;
    this.width = initial.width || 10;
    this.height = initial.height || 10;
  }

  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export class WidgetSettingsExtra extends Subscribable {
  [key: string | number | symbol]: any;
}
export type WidgetSettingsExtraInitial<T extends WidgetSettingsExtra> = Partial<OmitSubscribable<T>>
export type WidgetSettingsInitial = Partial<Omit<OmitSubscribable<WidgetSettings>, 'extra' | 'position'>> & Required<Pick<WidgetSettings, 'type'>> & { extra?: WidgetSettingsExtraInitial<WidgetSettingsExtra> } & { position?: WidgetPositionInitial }

export class WidgetSettings extends Subscribable {
  constructor(initial: WidgetSettingsInitial, extraConstructor: (new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra)) {
    super()
    this.type = initial.type;
    this.rotation = initial.rotation || 0;
    this.zIndex = initial.zIndex || 0;
    this.borderRadius = initial.borderRadius || 0;
    this.keepRatio = Boolean(initial.keepRatio);
    this.extra = new extraConstructor(initial.extra || {});
    this.position = new WidgetPosition(initial.position || {});
  }

  type: string;
  position: WidgetPosition;
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
