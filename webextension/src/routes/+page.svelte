<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    AppShell,
    Drawer,
    getDrawerStore,
    SlideToggle,
    type PopupSettings,
    ProgressRadial,
  } from '@skeletonlabs/skeleton';
  import { resize } from '@svelte-put/resize';
  import WidgetFactorty from '$shared-components/widget-factory.svelte';
  import { WidgetsCatalog, type CatalogWidgetSettingsInitial, type WidgetCatalogItem } from '$stores/widgets-catalog';
  import WidgetCatalogItemPreview from '$shared-components/widget-catalog-item-preview.svelte';
  import WidgetSettingsComponent from '$shared-components/widget-settings.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { BackgroundCatalog } from '$stores/background-catalog';
  import { dynamicBackground } from '$actions/dynamic-background';
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

  const saveWorkspaceChangesDefer = pDebounce(async () => {
    if (workspace?.hasChanges.value === true) {
      await Workspaces.save(workspaceId, workspace);
    }
  }, secondsToMilliseconds(10));

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
      width: 'w-[280px]',
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
      await workspace.setBackground(BackgroundCatalog[selectedIndex].settings);
    }
  }
</script>

<svelte:window on:beforeunload={onBeforeUnload} />
<svelte:document use:customCss={$customStyles} />

<Drawer>
  <div class="flex flex-col h-full w-full">
    <Accordion autocollapse>
      <AccordionItem>
        <svelte:fragment slot="lead">
          <span class="w-6 h-6 icon-[streamline--widget]"></span>
        </svelte:fragment>
        <svelte:fragment slot="summary">{m.Core_Sidebar_NewWidget()}</svelte:fragment>
        <svelte:fragment slot="content">
          <div class="grid gap-2 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] p-2">
            {#each WidgetsCatalog as item (item.settings.type)}
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
            {#each BackgroundCatalog as item, index (item.settings.type)}
              <option value={index} selected={$background?.settings?.type === item.settings.type}>{item.name()}</option>
            {/each}
          </select>
          <hr />
          {#if $background}
            {#await $background.components.settings.component.getValue()}
              <ProgressRadial width="w-12 ml-[auto] mr-[auto]" />
            {:then component}
              <svelte:component this={component} settings={$background.settings.extra} />
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
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span>{m.Core_Sidebar_Settings_Language()}</span>
            <LanguageSelector />
          </label>
          <div class="label">
            <span>{m.Core_Sidebar_Settings_Data()}</span>
            <DataManage bind:activeWorkspaceId={workspaceId} bind:activeWorkspace={workspace} />
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
    <div class="block mt-auto mb-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label flex justify-center items-center">
        <span>{m.Core_Sidebar_LockWorkspace()}</span>
        {#if workspace}
          <SlideToggle name="stWorkspaceEditMode" class="ml-3" bind:checked={$workspaceLocked} size="sm" />
        {/if}
      </label>
    </div>
  </div>
</Drawer>
<AppShell>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="[container-type:size] w-screen h-screen overflow-hidden max-w-[100vw] max-h-[100vh] workspace"
    on:drop={onWidgetCatalogItemDragDrop}
    on:dragover={onWidgetCatalogItemDragOver}
    bind:this={workspaceEl}
    use:resize
    on:resized={() => moveable?.unselectAll()}>
    <div class="w-full h-full -z-10" use:dynamicBackground={$background}></div>
    <div class="fixed left-0 top-0 z-[99999] h-[43px] w-[43px] overflow-hidden transition-[width] hover:w-[86px]">
      <div class="w-max flex flex-row">
        <button
          type="button"
          class="btn-icon bg-transparent text-white hover:bg-surface-500"
          title={m.Core_MainMenu_Menu_Title()}
          on:click={openWidgetsMenu}>
          <span class="w-6 h-6 icon-[material-symbols--menu]"></span>
        </button>
        <button
          type="button"
          class="btn-icon bg-transparent text-white hover:bg-surface-500"
          on:click={() => ($workspaceLocked = !$workspaceLocked)}
          title={$workspaceLocked
            ? m.Core_MainMenu_LockWorkspaceToggle_Title_Unlock()
            : m.Core_MainMenu_LockWorkspaceToggle_Title_Lock()}>
          <span class="w-6 h-6 {$workspaceLocked ? 'icon-[ic--twotone-lock]' : 'icon-[ic--round-lock-open]'}"></span>
        </button>
      </div>
    </div>
    {#each $widgets as widget (widget.id)}
      <WidgetFactorty
        {widget}
        {widgetSettingsPopupSettings}
        on:mousedown={e => !$workspaceLocked && moveable?.select(widget, e)}
        on:delete={onWidgetDelete}
        isSelected={!$workspaceLocked && selectedWidgets.has(widget)}
        id="widget_{widget.id}"
        class="widget_{widget.settings.type}"
        workspaceLocked={$workspaceLocked} />
    {/each}
    {#if !$workspaceLocked}
      <WidgetMoveController
        bind:this={moveable}
        bind:selected={selectedWidgets}
        widgets={$widgets}
        workspace={workspaceEl} />
    {/if}
  </div>
  <div
    class="card p-2 w-fit max-w-[100cqw] shadow-xl [z-index:99999]"
    data-popup={widgetSettingsPopupSettings.target}
    style:visibility={!$workspaceLocked && selectedWidgets.size === 1 ? 'visible' : 'hidden'}>
    {#if widgetSettingsVisible && selectedWidgets.size === 1}
      <WidgetSettingsComponent widget={selectedWidgets.values().next().value} workspace={workspaceEl} />
    {/if}
  </div>
  <WidgetFilters />
</AppShell>
