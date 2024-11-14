import type { Component } from 'svelte';
import type { LazyLike } from '$lib/lazy';
import {
  BackgroundSettingsExtra,
  type BackgroundSettingsExtraInitial,
  type BackgroundSettingsInitial,
} from '$lib/background-settings';
import type { WorkspaceInstance } from '$lib/workspace-instance';

export type CatalogBackgroundSettingsInitial = BackgroundSettingsInitial;

export interface IBackgroundProvider {
  apply(abortSignal: AbortSignal): Promise<void> | void;
  forceUpdate(abortSignal: AbortSignal): Promise<void> | void;
  destroy(): Promise<void> | void;
  get canGoNext(): boolean;
  get canGoBack(): boolean;
  goNext(abortSignal: AbortSignal): Promise<void> | void;
  goBack(): Promise<void> | void;
}

export abstract class BackgroundProvider<T extends BackgroundSettingsExtra>
  extends EventTarget
  implements IBackgroundProvider
{
  constructor(node: HTMLElement, settings: T) {
    super();
    this.node = node;
    this.settings = settings;
  }

  protected node: HTMLElement;
  protected settings: T;

  abstract apply(abortSignal: AbortSignal): Promise<void> | void;
  abstract forceUpdate(abortSignal: AbortSignal): Promise<void> | void;
  abstract destroy(): Promise<void> | void;
  abstract get canGoNext(): boolean;
  abstract get canGoBack(): boolean;
  abstract goNext(abortSignal: AbortSignal): Promise<void> | void;
  abstract goBack(): Promise<void> | void;
}

export interface BackgroundCatalogItem {
  readonly name: () => string;
  readonly settings: CatalogBackgroundSettingsInitial;
  readonly components: BackgroundCatalogItemComponents;
  readonly lifecycle?: {
    readonly onRemove?: (workspace: WorkspaceInstance) => Promise<void> | void;
  };
}

export type BackgroundCatalogItemComponentProps = {
  settings: any;
  workspace?: WorkspaceInstance;
};

export interface BackgroundCatalogItemComponents {
  readonly provider: LazyLike<Promise<new (node: HTMLElement, settings: any) => IBackgroundProvider>>;
  readonly settings: {
    readonly component: LazyLike<Promise<Component<BackgroundCatalogItemComponentProps>>>;
    readonly model: LazyLike<Promise<new (initial: BackgroundSettingsExtraInitial<any>) => BackgroundSettingsExtra>>;
  };
}
