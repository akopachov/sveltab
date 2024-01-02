import type { Unobserved } from './observable';

export type BackgroundSettingsInitial = Partial<BackgroundSettings> & Required<Pick<BackgroundSettings, 'type'>>;

export class BackgroundSettings implements BackgroundSettingsInitial {
  constructor(
    initial: BackgroundSettingsInitial,
    extraConstructor: new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra,
  ) {
    this.type = initial.type || '';
    this.extra = new extraConstructor(initial.extra || {});
  }

  readonly type: string;
  readonly extra: BackgroundSettingsExtra;
}

export class BackgroundSettingsExtra {
  [key: string | number | symbol]: any;
}
export type BackgroundSettingsExtraInitial<T extends BackgroundSettingsExtra> = Partial<Unobserved<T>>;
