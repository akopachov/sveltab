import type { BackgroundSettingsInitial } from './background-settings';
import { useObservable, type Observable, type Unobserved } from './observable.svelte';
import type { WidgetSettingsInitial } from './widget-settings';

export type WorkspaceSettingsInitial = Partial<Unobserved<WorkspaceSettings>>;

export type FaviconInfoInitial = Partial<Unobserved<FaviconInfo>>;

export class FaviconInfo {
  constructor(initial: FaviconInfoInitial) {
    this[16] = useObservable(initial[16] || '');
    this[32] = useObservable(initial[32] || '');
    this[48] = useObservable(initial[48] || '');
    this.ico = useObservable(initial.ico || '');
  }

  16: Observable<string>;
  32: Observable<string>;
  48: Observable<string>;
  ico: Observable<string>;
}

export type SnappableSettingsInitial = Partial<Unobserved<SnappableSettings>>;

export class SnappableSettings {
  constructor(initial: SnappableSettingsInitial) {
    this.enabled = useObservable(initial.enabled ?? false);
    this.gridSnapWidth = useObservable(initial.gridSnapWidth ?? 10);
    this.gridSnapHeight = useObservable(initial.gridSnapHeight ?? 10);
  }

  enabled: Observable<boolean>;
  gridSnapWidth: Observable<number>;
  gridSnapHeight: Observable<number>;
}

export class WorkspaceSettings {
  constructor(initial: WorkspaceSettingsInitial) {
    this.widgets = initial.widgets || [];
    this.background = initial.background || { type: 'static-color' };
    this.name = initial.name || '';
    this.customStyles = initial.customStyles || '';
    this.favicon = initial.favicon || { 16: '', 32: '', 48: '', ico: '' };
    this.assets = initial.assets || [];
    this.snappableSettings = initial.snappableSettings || { enabled: false };
  }

  name: string;
  widgets: WidgetSettingsInitial[];
  background: BackgroundSettingsInitial;
  customStyles: string;
  favicon: FaviconInfoInitial;
  assets: string[];
  snappableSettings: SnappableSettingsInitial;
}
