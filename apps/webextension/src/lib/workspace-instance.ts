import { ActiveFilters } from '$stores/active-filters-store';
import { BackgroundInstance } from './background-instance';
import type { BackgroundSettingsInitial } from './background-settings';
import { useObservable, type Observable, type Subscribable, type ReadOnlyObservable, unobserve } from './observable';
import { WidgetInstance } from './widget-instance';
import type { WidgetSettingsInitial } from './widget-settings';
import { FaviconInfo, type FaviconInfoInitial, type WorkspaceSettingsInitial } from './workspace-settings';

export class WorkspaceInstance {
  #widgets: Observable<Set<WidgetInstance>>;
  #background: Observable<BackgroundInstance>;
  #hasChanges: Observable<boolean> = useObservable(false);
  #trackingObjects = new Map<Subscribable<any>, () => void>();

  private constructor(
    name: string,
    widgets: WidgetInstance[],
    background: BackgroundInstance,
    customStyles: string,
    favicon: FaviconInfoInitial,
  ) {
    this.#widgets = useObservable(new Set(widgets));
    this.#widgets.value.forEach(w => {
      this.#trackObjectChange(w.settings);
      if (w.settings.filter.value) {
        ActiveFilters.add(w.settings.filter.value);
      }
    });

    this.#background = useObservable(background);
    this.#trackObjectChange(this.#background.value.settings);
    if (this.#background.value.settings.extra?.filter?.value) {
      ActiveFilters.add(this.#background.value.settings.extra.filter.value);
    }
    this.isLocked = useObservable(true);
    this.name = useObservable(name);
    this.customStyles = useObservable(customStyles);
    this.favicon = new FaviconInfo(favicon);

    this.#trackObjectChange(this.name);
    this.#trackObjectChange(this.customStyles);
    this.#trackObjectChange(this.favicon);
  }

  readonly isLocked: Observable<boolean>;
  readonly name: Observable<string>;
  readonly customStyles: Observable<string>;
  readonly favicon: FaviconInfo;

  #trackObjectChange(instance: any) {
    if (!instance) return;

    if (!this.#trackingObjects.has(instance)) {
      if (typeof instance.subscribe === 'function') {
        let subscribed = false;
        this.#trackingObjects.set(
          instance,
          instance.subscribe(() => {
            if (subscribed && !this.#hasChanges.value) {
              this.#hasChanges.value = true;
            }
          }),
        );
        subscribed = true;
      }
      if (typeof instance === 'object') {
        for (const property of Object.getOwnPropertyNames(instance)) {
          const value = (<any>instance)[property];
          if (value && typeof value === 'object') {
            this.#trackObjectChange(value);
          }
        }
      }
    }
  }

  #untrackObjectChange(instance: any) {
    if (!instance) return;
    const unsubscribe = this.#trackingObjects.get(instance);
    if (unsubscribe) {
      unsubscribe();
      this.#trackingObjects.delete(instance);
    }

    if (typeof instance === 'object') {
      for (const property of Object.getOwnPropertyNames(instance)) {
        const value = (<any>instance)[property];
        if (value && typeof value === 'object') {
          this.#untrackObjectChange(value);
        }
      }
    }
  }

  get hasChanges(): ReadOnlyObservable<boolean> {
    return this.#hasChanges;
  }

  get widgets(): ReadOnlyObservable<ReadonlySet<WidgetInstance>> {
    return this.#widgets;
  }

  get background(): ReadOnlyObservable<BackgroundInstance> {
    return this.#background;
  }

  async setBackground(settings: BackgroundSettingsInitial) {
    if (this.#background.value) {
      this.#untrackObjectChange(this.#background.value.settings);
      if (this.#background.value.settings.extra?.filter?.value) {
        ActiveFilters.remove(this.#background.value.settings.extra.filter.value);
      }
    }
    this.#background.value = await BackgroundInstance.create(settings);
    this.#hasChanges.value = true;
    this.#trackObjectChange(this.#background.value.settings);
    if (this.#background.value.settings.extra?.filter?.value) {
      ActiveFilters.add(this.#background.value.settings.extra.filter.value);
    }
  }

  async addWidget(settings: WidgetSettingsInitial) {
    const widget = await WidgetInstance.create(settings);
    this.#widgets.value = this.#widgets.value.add(widget);
    this.#hasChanges.value = true;
    this.#trackObjectChange(widget.settings);
    if (widget.settings.filter.value) {
      ActiveFilters.add(widget.settings.filter.value);
    }
  }

  removeWidget(instance: WidgetInstance) {
    this.#widgets.value.delete(instance);
    this.#widgets.set(this.#widgets.value);
    this.#hasChanges.value = true;
    this.#untrackObjectChange(instance.settings);
    if (instance.settings.filter.value) {
      ActiveFilters.remove(instance.settings.filter.value);
    }
  }

  export() {
    return {
      name: this.name.value,
      background: unobserve(this.#background.value.settings),
      widgets: [...this.#widgets.value].map(m => unobserve(m.settings)),
      customStyles: this.customStyles.value,
      favicon: unobserve(this.favicon),
    } satisfies WorkspaceSettingsInitial;
  }

  async commit(handler: (data: any) => Promise<void>) {
    await handler(this.export());
    this.#hasChanges.value = false;
  }

  static async create(settings: WorkspaceSettingsInitial) {
    const background = await BackgroundInstance.create(settings.background || { type: 'static-color' });
    const widgets = await Promise.all((settings.widgets || []).map(m => WidgetInstance.create(m)));
    return new WorkspaceInstance(
      settings.name || '',
      widgets,
      background,
      settings.customStyles || '',
      settings.favicon || {},
    );
  }
}
