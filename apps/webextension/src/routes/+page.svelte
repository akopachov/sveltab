<script lang="ts">
  import { version } from '$app/environment';
  import {
    Accordion,
    AccordionItem,
    AppShell,
    Drawer,
    getDrawerStore,
    SlideToggle,
    type PopupSettings,
  } from '@skeletonlabs/skeleton';
  import WidgetFactorty from '$shared-components/widget-factory.svelte';
  import type { CatalogWidgetSettingsInitial, WidgetCatalogItem } from '$widgets/types';
  import { Widgets } from '$widgets/index';
  import WidgetCatalogItemPreview from '$shared-components/widget-catalog-item-preview.svelte';
  import WidgetSettingsComponent from '$shared-components/widget-settings.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { Backgrounds } from '$backgrounds/index';
  import {
    ActiveBackgroundProvider,
    dynamicBackground,
    type BackgroundCornerColorChangedEventArgs,
  } from '$actions/dynamic-background';
  import * as m from '$i18n/messages';
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import type { WidgetInstance } from '$lib/widget-instance';
  import pDebounce from 'p-debounce';
  import LanguageSelector from '$shared-components/language-selector.svelte';
  import Lightswitch from '$shared-components/lightswitch.svelte';
  import WidgetFilters from '$shared-components/active-filters.svelte';
  import DataManage from '$shared-components/data-manage.svelte';
  import { secondsToMilliseconds } from 'date-fns';
  import { Workspaces } from '$stores/workspace-index';
  import { useObservable } from '$lib/observable';
  import CustomStyles from '$shared-components/custom-styles.svelte';
  import { customStyles as customCss } from '$actions/custom-styles';
  import WidgetMoveController from '$shared-components/widget-move-controller.svelte';
  import FaviconSettings from '$shared-components/favicon-settings.svelte';
  import Favicon from '$shared-components/favicon.svelte';
  import { forceNextBackground, forcePreviousBackground } from '$actions/dynamic-background';

  const drawerStore = getDrawerStore();

  let workspaceId: string;
  let workspace: WorkspaceInstance | undefined;

  $: background = workspace?.background;
  $: customStyles = workspace?.customStyles || useObservable('');
  $: widgets = workspace?.widgets || useObservable(new Set<WidgetInstance>());
  $: hasChanges = workspace?.hasChanges || useObservable(false);

  onMount(async () => {
    ({ id: workspaceId, workspace: workspace } = await Workspaces.getDefault());
  });

  onDestroy(() => {
    if (workspace?.hasChanges.value === true) {
      Workspaces.save(workspaceId, workspace);
    }
  });

  let workspaceEl: HTMLElement;
  let selectedWidgets = new Set<WidgetInstance>();
  let moveable: WidgetMoveController;
  let widgetSettingsVisible = false;
  let menuButtonColor = '#fff';
  let menuButtonBackgroundColor = 'transparent';
  $: workspaceLocked = workspace?.isLocked || useObservable(true);
  $: {
    if ($workspaceLocked) {
      moveable?.unselectAll();
    }
  }
  $: {
    if ($hasChanges === true) {
      saveWorkspaceChangesDefer();
    }
  }

  const widgetSettingsPopupSettings: PopupSettings = {
    event: 'click',
    target: 'widgetSettingsPopup',
    placement: 'left',
    closeQuery: '',
    middleware: {
      flip: {
        fallbackAxisSideDirection: 'start',
      },
    },
    state: e => {
      widgetSettingsVisible = e.state;
    },
  };

  async function saveWorkspaceChanges() {
    if (workspace?.hasChanges.value === true) {
      await Workspaces.save(workspaceId, workspace);
    }
  }

  const saveWorkspaceChangesDefer = pDebounce(saveWorkspaceChanges, secondsToMilliseconds(10));

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (workspace?.hasChanges.value === true) {
      Workspaces.save(workspaceId, workspace);
    }

    if (workspace?.hasChanges.value === true) {
      event.preventDefault();
      event.returnValue = true;
    }
  }

  function openWidgetsMenu() {
    drawerStore.open({
      width: 'w-[300px]',
    });
  }

  async function onWidgetCatalogItemClick(widgetSettings: CatalogWidgetSettingsInitial) {
    if (!workspace) return;
    const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
    $workspaceLocked = false;
    await workspace.addWidget({
      ...widgetSettings,
      position: {
        ...widgetSettings.position,
        x: (workspaceEl.clientWidth / cqminBase) * 50 - widgetSettings.position.width / 2,
        y: (workspaceEl.clientHeight / cqminBase) * 50 - widgetSettings.position.height / 2,
      },
    });
  }

  function onWidgetCatalogItemDragStart(ev: DragEvent, widgetCatalogItem: WidgetCatalogItem) {
    if (ev.dataTransfer) {
      setTimeout(() => drawerStore.close(), 100);
      ev.dataTransfer.setData('text/json', JSON.stringify(widgetCatalogItem.settings));
    }
  }

  async function onWidgetCatalogItemDragDrop(e: DragEvent) {
    if (e.dataTransfer) {
      e.preventDefault();
      if (!workspace) return;
      const plainData = e.dataTransfer.getData('text/json');
      if (!plainData) return;
      const widgetSettings = <CatalogWidgetSettingsInitial>JSON.parse(plainData);
      const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
      $workspaceLocked = false;
      await workspace.addWidget({
        ...widgetSettings,
        position: {
          ...widgetSettings.position,
          x: (e.x / cqminBase) * 100 - widgetSettings.position.width / 2,
          y: (e.y / cqminBase) * 100 - widgetSettings.position.height / 2,
        },
      });
    }
  }

  function onWidgetCatalogItemDragOver(ev: DragEvent) {
    if (ev.dataTransfer) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'copy';
    }
  }

  function onWidgetDelete(e: CustomEvent<WidgetInstance>) {
    if (!workspace) return;
    moveable?.unselect(e.detail);
    workspace.removeWidget(e.detail);
  }

  async function onBackgroundTypeChanged(e: Event) {
    if (!workspace) return;
    const selectedIndex = Number((<HTMLSelectElement>e.target).selectedOptions[0].value);
    if (selectedIndex >= 0) {
      await workspace.setBackground(Backgrounds[selectedIndex].settings);
    }
  }

  function cornerColorChanged(e: CustomEvent<BackgroundCornerColorChangedEventArgs>) {
    menuButtonColor = e.detail.isDark ? '#fff' : '#000';
    menuButtonBackgroundColor = e.detail.color;
  }

  function firstOfSet<T>(set: Set<T>): [T, Exclude<number, 0>] | [null, 0] {
    for (const item of set) {
      return [item, set.size];
    }
    return [null, 0];
  }
</script>

<svelte:window on:beforeunload={onBeforeUnload} />
<svelte:document use:customCss={$customStyles} />

<svelte:head>
  <Favicon workspaceInstance={workspace} />
</svelte:head>

<Drawer>
  <div class="flex flex-col h-full w-full">
    <Accordion autocollapse>
      <AccordionItem>
        <svelte:fragment slot="lead">
          <span class="w-6 h-6 icon-[streamline--widget]"></span>
        </svelte:fragment>
        <svelte:fragment slot="summary">{m.Core_Sidebar_NewWidget()}</svelte:fragment>
        <svelte:fragment slot="content">
          <div class="flex flex-col gap-1 p-2 list">
            {#each Widgets as item (item.settings.type)}
              <WidgetCatalogItemPreview
                widgetCatalogItem={item}
                class="aspect-square"
                draggable
                on:dragstart={ev => onWidgetCatalogItemDragStart(ev, item)}
                on:click={() => onWidgetCatalogItemClick(item.settings)} />
            {/each}
          </div>
        </svelte:fragment>
      </AccordionItem>
      <AccordionItem>
        <svelte:fragment slot="lead">
          <span class="w-6 h-6 icon-[fluent--color-background-24-regular]"></span>
        </svelte:fragment>
        <svelte:fragment slot="summary">{m.Core_Sidebar_Background()}</svelte:fragment>
        <svelte:fragment slot="content">
          <select class="select" on:change={onBackgroundTypeChanged}>
            {#each Backgrounds as item, index (item.settings.type)}
              <option value={index} selected={$background?.settings?.type === item.settings.type}>{item.name()}</option>
            {/each}
          </select>
          <hr />
          {#if $background}
            {#await $background.components.settings.component.value then component}
              <svelte:component this={component} settings={$background.settings.extra} {workspace} />
            {/await}
          {/if}
        </svelte:fragment>
      </AccordionItem>
      <AccordionItem>
        <svelte:fragment slot="lead">
          <span class="w-6 h-6 icon-[gala--settings]"></span>
        </svelte:fragment>
        <svelte:fragment slot="summary">{m.Core_Sidebar_Settings()}</svelte:fragment>
        <svelte:fragment slot="content">
          <div class="label">
            <span>{m.Core_Sidebar_Settings_ColorScheme()}</span>
            <Lightswitch />
          </div>
          <div>
            <span>{m.Favicon_Settings_Label()}</span>
            <FaviconSettings workspaceInstance={workspace} />
          </div>
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span>{m.Core_Sidebar_Settings_Language()}</span>
            <LanguageSelector />
          </label>
          <div class="label">
            <span>{m.Core_Sidebar_Settings_Data()}</span>
            <DataManage
              bind:activeWorkspaceId={workspaceId}
              bind:activeWorkspace={workspace}
              on:dataImported={() => drawerStore.close()} />
          </div>
        </svelte:fragment>
      </AccordionItem>
      <AccordionItem>
        <svelte:fragment slot="lead">
          <span class="w-6 h-6 icon-[game-icons--gear-hammer]"></span>
        </svelte:fragment>
        <svelte:fragment slot="summary">{m.Core_Sidebar_Advanced()}</svelte:fragment>
        <svelte:fragment slot="content">
          <div class="label">
            <span>{m.Core_Sidebar_Advanced_CustomStyles()}</span>
            <CustomStyles bind:styles={$customStyles} />
          </div>
        </svelte:fragment>
      </AccordionItem>
    </Accordion>
    <div class="text-center mt-3">
      <a class="anchor text-xs" rel="noreferrer" referrerpolicy="no-referrer" href="https://sveltab.com/#support">
        {m.Core_Sidebar_SayThanksDev()}
      </a>
    </div>
    <div class="block mt-auto">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label flex justify-center items-center mb-3">
        <span>{m.Core_Sidebar_LockWorkspace()}</span>
        {#if workspace}
          <SlideToggle name="stWorkspaceEditMode" class="ml-3" bind:checked={$workspaceLocked} size="sm" />
        {/if}
      </label>
      <span class="block text-[10px] p-2 leading-none">{m.Core_Version({ version })}</span>
    </div>
  </div>
</Drawer>
<AppShell>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="[container-type:size] w-screen h-screen overflow-hidden max-w-[100vw] max-h-[100vh] workspace"
    on:drop={onWidgetCatalogItemDragDrop}
    on:dragover={onWidgetCatalogItemDragOver}
    bind:this={workspaceEl}>
    <div
      class="absolute w-full h-full -z-10"
      use:dynamicBackground={$background}
      on:cornerColorChanged={cornerColorChanged}>
    </div>
    <div
      class="fixed left-0 top-0 z-[99999] h-[43px] w-[43px] overflow-hidden transition-[width] hoverable:hover:w-[172px]">
      <div class="w-max flex flex-row">
        <button
          type="button"
          class="btn-icon bg-transparent hover:bg-[var(--st-bg-color)]"
          style:color={menuButtonColor}
          style:--st-bg-color={menuButtonBackgroundColor}
          title={m.Core_MainMenu_Menu_Title()}
          on:click={openWidgetsMenu}>
          <span class="w-6 h-6 icon-[tdesign--menu-application]"></span>
        </button>
        <button
          type="button"
          class="btn-icon bg-transparent hover:bg-[var(--st-bg-color)]"
          style:color={menuButtonColor}
          style:--st-bg-color={menuButtonBackgroundColor}
          on:click={() => ($workspaceLocked = !$workspaceLocked)}
          title={$workspaceLocked
            ? m.Core_MainMenu_LockWorkspaceToggle_Title_Unlock()
            : m.Core_MainMenu_LockWorkspaceToggle_Title_Lock()}>
          <span class="w-6 h-6 {$workspaceLocked ? 'icon-[ic--twotone-lock]' : 'icon-[ic--round-lock-open]'}"></span>
        </button>
        {#if $ActiveBackgroundProvider?.canGoBack === true}
          <button
            type="button"
            class="btn-icon bg-transparent hover:bg-[var(--st-bg-color)]"
            style:color={menuButtonColor}
            style:--st-bg-color={menuButtonBackgroundColor}
            on:click={() => forcePreviousBackground()}
            title={m.Core_MainMenu_PreviousBackground_Title()}>
            <span class="w-7 h-7 icon-[carbon--previous-outline]"></span>
          </button>
        {/if}
        {#if $ActiveBackgroundProvider?.canGoNext === true}
          <button
            type="button"
            class="btn-icon bg-transparent hover:bg-[var(--st-bg-color)]"
            style:color={menuButtonColor}
            style:--st-bg-color={menuButtonBackgroundColor}
            on:click={() => forceNextBackground()}
            title={m.Core_MainMenu_NextBackground_Title()}>
            <span class="w-7 h-7 icon-[carbon--next-outline]"></span>
          </button>
        {/if}
      </div>
    </div>
    {#key workspace}
      {#each $widgets as widget (widget.id)}
        <WidgetFactorty
          {widget}
          {widgetSettingsPopupSettings}
          on:delete={onWidgetDelete}
          showControls={!$workspaceLocked && selectedWidgets.has(widget) && selectedWidgets.size === 1}
          class="widget widget_{widget.settings.type}"
          controlsClassName="widget-control"
          workspaceLocked={$workspaceLocked}
          on:autosettingsupdate={saveWorkspaceChanges} />
      {/each}
    {/key}
    {#if !$workspaceLocked}
      <WidgetMoveController
        bind:this={moveable}
        bind:selected={selectedWidgets}
        widgets={$widgets}
        workspace={workspaceEl}
        widgetControlsZone=".widget-control" />
    {/if}
  </div>
  <div
    class="card p-2 w-fit max-w-[100cqw] shadow-xl [z-index:99999]"
    data-popup={widgetSettingsPopupSettings.target}
    style:visibility={!$workspaceLocked && selectedWidgets.size === 1 ? 'visible' : 'hidden'}>
    {#if widgetSettingsVisible}
      {@const [widget, totalCount] = firstOfSet(selectedWidgets)}
      {#if totalCount === 1}
        <WidgetSettingsComponent {widget} workspace={workspaceEl} />
      {/if}
    {/if}
  </div>
  <WidgetFilters />
</AppShell>

<style>
</style>
