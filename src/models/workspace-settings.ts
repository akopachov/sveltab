import type { BackgroundSettingsInitial } from './background-settings';
import { Subscribable, type OmitSubscribable } from './subscribable';
import type { WidgetSettingsInitial } from './widget-settings';

export type WorkspaceSettingsInitial = Partial<OmitSubscribable<WorkspaceSettings>>;

export class WorkspaceSettings extends Subscribable implements WorkspaceSettingsInitial {
  constructor(initial: WorkspaceSettingsInitial) {
    super();
    this.widgets = initial.widgets || [];
    this.background = initial.background || { type: 'static-color' };
  }

  widgets: WidgetSettingsInitial[];
  background: BackgroundSettingsInitial;
}
