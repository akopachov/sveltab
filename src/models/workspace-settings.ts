import { Subscribable, type OmitSubscribable } from "./subscribable";
import type { WidgetSettingsInitial } from "./widget-settings";

export type WorkspaceSettingsInitial = Partial<OmitSubscribable<WorkspaceSettings>>;

export class WorkspaceSettings extends Subscribable {
  constructor(initial: WorkspaceSettingsInitial) {
    super();
    this.widgets = initial.widgets || [];
    this.background = initial.background || {};
  }

  widgets: WidgetSettingsInitial[];
  background: BackgroundSettingsInitial;
}

export type BackgroundSettingsInitial = Partial<OmitSubscribable<BackgroundSettings>>;

export class BackgroundSettings extends Subscribable {
  constructor(initial: BackgroundSettingsInitial, extraConstructor: (new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra)) {
    super();

    this.type = initial.type || '';
    this.extra = new extraConstructor(initial.extra || {});
  }

  type: string;
  extra: BackgroundSettingsExtra;
}

export class BackgroundSettingsExtra extends Subscribable {
  [key: string | number | symbol]: any;
}
export type BackgroundSettingsExtraInitial<T extends BackgroundSettingsExtra> = Partial<OmitSubscribable<T>>
