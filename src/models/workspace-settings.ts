import type { BackgroundSettingsInitial } from './background-settings';
import { type Unobserved } from './observable';
import type { WidgetSettingsInitial } from './widget-settings';

export type WorkspaceSettingsInitial = Partial<Unobserved<WorkspaceSettings>>;

export class WorkspaceSettings {
  constructor(initial: WorkspaceSettingsInitial) {
    this.widgets = initial.widgets || [];
    this.background = initial.background || { type: 'static-color' };
    this.name = initial.name || '';
  }

  name: string;
  widgets: WidgetSettingsInitial[];
  background: BackgroundSettingsInitial;
}
