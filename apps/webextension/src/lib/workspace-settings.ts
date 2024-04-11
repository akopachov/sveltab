import type { BackgroundSettingsInitial } from './background-settings';
import { useObservable, type Observable, type Unobserved } from './observable';
import type { WidgetSettingsInitial } from './widget-settings';

export type WorkspaceSettingsInitial = Partial<Unobserved<WorkspaceSettings>>;

export type FaviconInfoInitial = Partial<Unobserved<FaviconInfo>>;

export class FaviconInfo {
  constructor(initial: FaviconInfoInitial) {
    this[16] = useObservable(initial[16] || '');
    this[32] = useObservable(initial[32] || '');
    this.ico = useObservable(initial.ico || '');
  }

  16: Observable<string>;
  32: Observable<string>;
  ico: Observable<string>;
}

export class WorkspaceSettings {
  constructor(initial: WorkspaceSettingsInitial) {
    this.widgets = initial.widgets || [];
    this.background = initial.background || { type: 'static-color' };
    this.name = initial.name || '';
    this.customStyles = initial.customStyles || '';
    this.favicon = initial.favicon || { 16: '', 32: '', ico: '' };
  }

  name: string;
  widgets: WidgetSettingsInitial[];
  background: BackgroundSettingsInitial;
  customStyles: string;
  favicon: FaviconInfoInitial;
}
