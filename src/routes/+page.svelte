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
  import Moveable from 'svelte-moveable';
  import { resize } from '@svelte-put/resize';
  import WidgetFactorty from '$shared-components/widget-factory.svelte';
  import { WidgetsCatalog, type CatalogWidgetSettingsInitial, type WidgetCatalogItem } from '$stores/widgets-catalog';
  import WidgetCatalogItemPreview from '$shared-components/widget-catalog-item-preview.svelte';
  import WidgetSettingsComponent from '$shared-components/widget-settings.svelte';
  import { onMount } from 'svelte';
  import { BackgroundCatalog } from '$stores/background-catalog';
  import { dynamicBackground } from '$actions/dynamic-background';
  import * as m from '$i18n/messages';
  import type { WorkspaceInstance } from '$models/workspace-instance';
  import type { WidgetInstance } from '$models/widget-instance';
  import { getWorkspace, saveWorkspace } from '$stores/workspace-store';
  import { fade } from 'svelte/transition';
  import pDebounce from 'p-debounce';
  import LanguageSelector from '$shared-components/language-selector.svelte';
  import Lightswitch from '$shared-components/lightswitch.svelte';
  import WidgetFilters from '$shared-components/active-filters.svelte';

  const drawerStore = getDrawerStore();

  const workspaceId = 'default';
  let workspace: WorkspaceInstance | undefined;

  $: background = $workspace?.background;
  $: widgets = <Iterable<WidgetInstance>>($workspace?.widgets || []);
  $: snappableList = Array.from(widgets, m => (selectedWidget?.id === m.id ? null : `#widget_${m.id}`));

  onMount(async () => {
    workspace = await getWorkspace(workspaceId);
  });

  let workspaceEl: HTMLElement;
  let selectedWidgetEl: HTMLElement | undefined | null;
  let selectedWidget: WidgetInstance | null | undefined;
  $: selectedWidgetSettings = selectedWidget?.settings;
  let moveable: Moveable;
  let widgetSettingsVisible = false;
  $: workspaceLocked = $workspace?.isLocked || false;
  $: {
    if (workspaceLocked) {
      unselectWidget();
    }
  }
  $: {
    if ($workspace?.hasChanges === true) {
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
    if (workspace?.hasChanges === true) {
      await saveWorkspace(workspaceId, workspace);
    }
  }, 10_000);

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (workspace?.hasChanges === true) {
      saveWorkspace(workspaceId, workspace);
    }

    if (workspace?.hasChanges === true) {
      event.preventDefault();
      event.returnValue = true;
    }
  }

  function openWidgetsMenu() {
    drawerStore.open({
      width: 'w-[280px]',
    });
  }

  function selectExistingWidget(e: MouseEvent, widget: WidgetInstance) {
    if (e.button === 0 && moveable) {
      e.stopPropagation();
      unselectWidget();
      selectedWidgetEl = e.currentTarget as HTMLElement;
      selectedWidget = widget;

      const absolutePos = widget.settings.position.getAbsolute(workspaceEl);

      selectedWidgetEl.style.width = `${absolutePos.width}px`;
      selectedWidgetEl.style.height = `${absolutePos.height}px`;
      selectedWidgetEl.style.left = `${absolutePos.x}px`;
      selectedWidgetEl.style.top = `${absolutePos.y}px`;

      selectedWidgetEl.classList.add('selected');

      setTimeout(() => {
        moveable.dragStart(e);
      });
    }
  }

  function unselectWidget() {
    if (selectedWidgetEl && selectedWidgetSettings) {
      selectedWidgetSettings.position.setFromAbsolute(workspaceEl, {
        x: parseFloat(selectedWidgetEl.style.left),
        y: parseFloat(selectedWidgetEl.style.top),
        width: parseFloat(selectedWidgetEl.style.width),
        height: parseFloat(selectedWidgetEl.style.height),
      });

      selectedWidgetEl.style.width = '';
      selectedWidgetEl.style.height = '';
      selectedWidgetEl.style.left = '';
      selectedWidgetEl.style.top = '';

      selectedWidgetEl.classList.remove('selected');
    }
    selectedWidgetEl = null;
    selectedWidget = null;
  }

  async function onWidgetCatalogItemClick(widgetSettings: CatalogWidgetSettingsInitial) {
    if (!workspace) return;
    const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
    workspace.isLocked = false;
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
      workspace.isLocked = false;
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
    unselectWidget();
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

<svelte:window on:beforeunload={onBeforeUnload} on:resize={() => unselectWidget()} />

{#if !workspace}
  <div
    out:fade={{ duration: 300 }}
    class="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center flex-col backdrop-blur-md bg-surface-50 dark:bg-surface-600 !bg-opacity-50">
    <ProgressRadial meter="stroke-primary-500" track="stroke-primary-500/30" />
  </div>
{/if}
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
              <option value={index} selected={background?.settings?.type === item.settings.type}>{item.name()}</option>
            {/each}
          </select>
          <hr />
          {#if background}
            {#await background.components.settings.component.getValue()}
              <ProgressRadial width="w-12 ml-[auto] mr-[auto]" />
            {:then component}
              <svelte:component this={component} settings={background.settings.extra} />
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
        </svelte:fragment>
      </AccordionItem>
    </Accordion>
    <div class="block mt-auto mb-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label flex justify-center items-center">
        <span>{m.Core_Sidebar_LockWorkspace()}</span>
        {#if $workspace}
          <SlideToggle name="stWorkspaceEditMode" class="ml-3" bind:checked={$workspace.isLocked} size="sm" />
        {/if}
      </label>
    </div>
  </div>
</Drawer>
<AppShell>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="[container-type:size] w-screen h-screen overflow-hidden max-w-[100vw] max-h-[100vh] workspace"
    on:drop={onWidgetCatalogItemDragDrop}
    on:dragover={onWidgetCatalogItemDragOver}
    on:mousedown={unselectWidget}
    bind:this={workspaceEl}
    use:resize
    on:resized={unselectWidget}>
    <div class="w-full h-full -z-10" use:dynamicBackground={background}></div>
    <button
      type="button"
      class="btn-icon bg-transparent text-white hover:bg-surface-500 fixed top-0 left-0"
      on:click={openWidgetsMenu}>
      <span class="w-6 h-6 icon-[material-symbols--menu]"></span>
    </button>
    {#each widgets as widget (widget.id)}
      <WidgetFactorty
        {widget}
        {widgetSettingsPopupSettings}
        on:mousedown={e => !workspaceLocked && selectExistingWidget(e, widget)}
        on:delete={onWidgetDelete}
        isSelected={!workspaceLocked && widget === selectedWidget}
        id="widget_{widget.id}"
        class="widget_{widget.settings.type}"
        {workspaceLocked} />
    {/each}
    {#if !workspaceLocked}
      <Moveable
        bind:this={moveable}
        target={selectedWidgetEl}
        origin={false}
        edge={false}
        draggable={true}
        throttleDrag={0}
        renderDirections={['nw', 'ne', 'sw', 'se', 'n', 'w', 's', 'e']}
        resizable={true}
        throttleResize={0}
        scalable={false}
        rotatable={true}
        throttleRotate={0}
        warpable={false}
        pinchable={false}
        keepRatio={selectedWidgetSettings?.keepRatio}
        snappable={true}
        snapGap={true}
        snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
        elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
        elementGuidelines={[...snappableList, '.workspace']}
        snapContainer={'.workspace'}
        bounds={{ left: 0, top: 0, right: 0, bottom: 0, position: 'css' }}
        isDisplaySnapDigit={true}
        on:drag={({ detail: e }) => {
          e.target.style.left = `${e.left}px`;
          e.target.style.top = `${e.top}px`;
        }}
        on:resize={({ detail: e }) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.left = `${e.drag.left}px`;
          e.target.style.top = `${e.drag.top}px`;
        }}
        on:rotate={({ detail: e }) => {
          e.target.style.transform = e.drag.transform;
        }}
        on:rotateEnd={({ detail: e }) => {
          if (selectedWidgetSettings) {
            selectedWidgetSettings.rotation = e.lastEvent.rotation;
          }
        }} />
    {/if}
  </div>
  <div
    class="card p-2 w-fit max-w-[100cqw] shadow-xl [z-index:99999]"
    data-popup={widgetSettingsPopupSettings.target}
    style:visibility={!workspaceLocked && selectedWidget ? 'visible' : 'hidden'}>
    {#if widgetSettingsVisible && selectedWidget}
      <WidgetSettingsComponent widget={selectedWidget} workspace={workspaceEl} />
    {/if}
  </div>
  <WidgetFilters />
</AppShell>
