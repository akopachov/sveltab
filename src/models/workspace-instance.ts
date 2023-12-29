import { ActiveFilters } from '$stores/active-filters-store';
import { BackgroundInstance } from './background-instance';
import type { BackgroundSettingsInitial } from './background-settings';
import { Subscribable } from './subscribable';
import { WidgetInstance } from './widget-instance';
import type { WidgetSettingsInitial } from './widget-settings';
import type { WorkspaceSettingsInitial } from './workspace-settings';

export class WorkspaceInstance extends Subscribable {
  #widgets: Set<WidgetInstance>;
  #background: BackgroundInstance;
  #hasChanges: boolean = false;
  #trackingObjects = new Map<Subscribable, () => void>();

  private constructor(name: string, widgets: WidgetInstance[], background: BackgroundInstance) {
    super();
    this.#widgets = new Set(widgets);
    this.#widgets.forEach(w => {
      this.#trackObjectChange(w.settings);
      if (w.settings.filter) {
        ActiveFilters.add(w.settings.filter);
      }
    });

    this.#background = background;
    this.#trackObjectChange(this.#background.settings);
    this.isLocked = true;
    this.name = name;
  }

  isLocked: boolean;
  name: string;

  #trackObjectChange(instance: Subscribable) {
    if (!this.#trackingObjects.has(instance)) {
      this.#trackingObjects.set(
        instance,
        instance.subscribe(
          () => {
            if (!this.#hasChanges) {
              this.#hasChanges = true;
              this.notifyPropertiesChanged();
            }
          },
          undefined,
          true,
        ),
      );
      for (const property of Object.getOwnPropertyNames(instance)) {
        const value = (<any>instance)[property];
        if (value instanceof Subscribable) {
          this.#trackObjectChange(value);
        }
      }
    }
  }

  #untrackObjectChange(instance: Subscribable) {
    const unsubscribe = this.#trackingObjects.get(instance);
    if (unsubscribe) {
      unsubscribe();
      this.#trackingObjects.delete(instance);
    }

    for (const property of Object.getOwnPropertyNames(instance)) {
      const value = (<any>instance)[property];
      if (value instanceof Subscribable) {
        this.#untrackObjectChange(value);
      }
    }
  }

  get hasChanges() {
    return this.#hasChanges;
  }

  get widgets(): ReadonlySet<WidgetInstance> {
    return this.#widgets;
  }

  get background() {
    return this.#background;
  }

  async setBackground(settings: BackgroundSettingsInitial) {
    if (this.#background) {
      this.#untrackObjectChange(this.#background.settings);
    }
    this.#background = await BackgroundInstance.create(settings);
    this.#hasChanges = true;
    this.#trackObjectChange(this.#background.settings);
    this.notifyPropertiesChanged();
  }

  async addWidget(settings: WidgetSettingsInitial) {
    const widget = await WidgetInstance.create(settings);
    this.#widgets.add(widget);
    this.#hasChanges = true;
    this.#trackObjectChange(widget.settings);
    this.notifyPropertiesChanged();
    if (widget.settings.filter) {
      ActiveFilters.add(widget.settings.filter);
    }
  }

  removeWidget(instance: WidgetInstance) {
    this.#widgets.delete(instance);
    this.#hasChanges = true;
    this.#untrackObjectChange(instance.settings);
    this.notifyPropertiesChanged();
    if (instance.settings.filter) {
      ActiveFilters.remove(instance.settings.filter);
    }
  }

  export(): Required<WorkspaceSettingsInitial> {
    return {
      name: this.name,
      background: this.#background.settings,
      widgets: [...this.#widgets].map(m => m.settings),
    };
  }

  async commit(handler: (data: Required<WorkspaceSettingsInitial>) => Promise<void>) {
    await handler(this.export());
    this.#hasChanges = false;
    this.notifyPropertiesChanged();
  }

  static async create(settings: WorkspaceSettingsInitial) {
    const background = await BackgroundInstance.create(settings.background || { type: 'static-color' });
    const widgets = await Promise.all((settings.widgets || []).map(m => WidgetInstance.create(m)));
    return new WorkspaceInstance(settings.name || '', widgets, background);
  }
}
