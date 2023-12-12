import { Subscribable, type OmitSubscribable } from './subscribable';

export type BackgroundSettingsInitial = Partial<OmitSubscribable<BackgroundSettings>> &
  Required<Pick<BackgroundSettings, 'type'>>;

export class BackgroundSettings extends Subscribable implements BackgroundSettingsInitial {
  constructor(
    initial: BackgroundSettingsInitial,
    extraConstructor: new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra,
  ) {
    super();

    this.type = initial.type || '';
    this.extra = new extraConstructor(initial.extra || {});
  }

  readonly type: string;
  readonly extra: BackgroundSettingsExtra;
}

export class BackgroundSettingsExtra extends Subscribable {
  [key: string | number | symbol]: any;
}
export type BackgroundSettingsExtraInitial<T extends BackgroundSettingsExtra> = Partial<OmitSubscribable<T>>;
