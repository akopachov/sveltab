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
  import WidgetFactorty from '$components/widget-factory.svelte';
  import { writable } from 'svelte/store';
  import { WidgetsCatalog, type CatalogWidgetSettingsInitial, type WidgetCatalogItem } from '$stores/widgets-catalog';
  import WidgetCatalogItemPreview from '$components/widget-catalog-item-preview.svelte';
  import WidgetSettingsComponent from '$components/widget-settings.svelte';
  import { onMount } from 'svelte';
  import { BackgroundCatalog } from '$stores/background-catalog';
  import { dynamicBackground } from '$actions/dynamic-background';
  import * as m from '$i18n/messages';
  import type { WorkspaceInstance } from '$models/workspace-instance';
  import type { WidgetInstance } from '$models/widget-instance';
  import { getWorkspace, saveWorkspace } from '$stores/workspace-store';
  import { fade } from 'svelte/transition';
  import pDebounce from 'p-debounce';
  import LanguageSelect from '$components/language-select.svelte';

  const drawerStore = getDrawerStore();

  const workspaceId = 'default';
  let workspace: WorkspaceInstance | undefined;

  $: background = $workspace?.background;
  $: widgets = $workspace?.widgets || [];

  onMount(async () => {
    workspace = await getWorkspace(workspaceId);
  });

  let workspaceEl: HTMLElement;
  let dragnDropPreviewCanvas: HTMLCanvasElement;
  let selectedWidgetEl: HTMLElement | undefined | null;
  let selectedWidget = writable<WidgetInstance | null | undefined>();
  $: selectedWidgetSettings = $selectedWidget?.settings;
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
    placement: 'bottom',
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
      $selectedWidget = widget;

      const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
      const widgetPos = widget.settings.position;

      selectedWidgetEl.style.left = `${
        (widgetPos.x / 100) * cqminBase + (widgetPos.offsetX / 100) * workspaceEl.clientWidth
      }px`;
      selectedWidgetEl.style.top = `${
        (widgetPos.y / 100) * cqminBase + (widgetPos.offsetY / 100) * workspaceEl.clientHeight
      }px`;
      selectedWidgetEl.style.width = `${(widgetPos.width / 100) * cqminBase}px`;
      selectedWidgetEl.style.height = `${(widgetPos.height / 100) * cqminBase}px`;
      selectedWidgetEl.classList.add('selected');

      setTimeout(() => {
        moveable.dragStart(e);
      });
    }
  }

  function unselectWidget() {
    if (selectedWidgetEl && selectedWidgetSettings) {
      const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
      const widgetPos = selectedWidgetSettings.position;
      let moved = false;

      if (selectedWidgetEl.style.left) {
        const absOffsetX = (workspaceEl.clientWidth * widgetPos.offsetX) / cqminBase;
        const widgetPosX = (parseFloat(selectedWidgetEl.style.left) / cqminBase) * 100 - absOffsetX;
        selectedWidgetEl.style.left = '';
        if (widgetPosX != widgetPos.x) {
          widgetPos.x = widgetPosX;
          moved = true;
        }
      }

      if (selectedWidgetEl.style.top) {
        const absOffsetY = (workspaceEl.clientHeight * widgetPos.offsetY) / cqminBase;
        const widgetPosY = (parseFloat(selectedWidgetEl.style.top) / cqminBase) * 100 - absOffsetY;
        selectedWidgetEl.style.top = '';
        if (widgetPosY != widgetPos.y) {
          widgetPos.y = widgetPosY;
          moved = true;
        }
      }

      if (selectedWidgetEl.style.width) {
        let widgetPosWidth = (parseFloat(selectedWidgetEl.style.width) / cqminBase) * 100;
        selectedWidgetEl.style.width = '';
        if (widgetPosWidth != widgetPos.width) {
          widgetPos.width = widgetPosWidth;
          moved = true;
        }
      }

      if (selectedWidgetEl.style.height) {
        let widgetPosHeight = (parseFloat(selectedWidgetEl.style.height) / cqminBase) * 100;
        selectedWidgetEl.style.height = '';
        if (widgetPosHeight != widgetPos.height) {
          widgetPos.height = widgetPosHeight;
          moved = true;
        }
      }

      selectedWidgetEl.classList.remove('selected');

      if (moved) {
        widgetPos.notifyPropertiesChanged();
      }
    }
    selectedWidgetEl = null;
    $selectedWidget = null;
  }

  async function onWidgetCatalogItemClick(widgetSettings: CatalogWidgetSettingsInitial) {
    if (!workspace) return;
    const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
    workspace.isLocked = false;
    await workspace.addWidget({
      ...widgetSettings,
      position: {
        ...widgetSettings.position,
        x: (workspaceEl.clientWidth / cqminBase) * 50,
        y: (workspaceEl.clientHeight / cqminBase) * 50,
      },
    });
  }

  function onWidgetCatalogItemDragStart(ev: DragEvent, widgetCatalogItem: WidgetCatalogItem) {
    if (ev.dataTransfer) {
      setTimeout(() => drawerStore.close(), 100);
      ev.dataTransfer.setData('text/json', JSON.stringify(widgetCatalogItem.settings));
      const img = new Image();
      img.src = widgetCatalogItem.previewImageUri;
      const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
      const baseWidth = (widgetCatalogItem.settings.position.width! / 100) * cqminBase;
      const baseHeight = (widgetCatalogItem.settings.position.height! / 100) * cqminBase;
      dragnDropPreviewCanvas.width = baseWidth;
      dragnDropPreviewCanvas.height = baseHeight;
      dragnDropPreviewCanvas
        .getContext('2d')
        ?.drawImage(img, 0, 0, dragnDropPreviewCanvas.width, dragnDropPreviewCanvas.height);
      ev.dataTransfer.setDragImage(dragnDropPreviewCanvas, 0, 0);
    }
  }

  async function onWidgetCatalogItemDragDrop(e: DragEvent) {
    if (e.dataTransfer) {
      e.preventDefault();
      if (!workspace) return;
      const widgetSettings = <CatalogWidgetSettingsInitial>JSON.parse(e.dataTransfer.getData('text/json'));
      const cqminBase = Math.min(workspaceEl.clientWidth, workspaceEl.clientHeight);
      workspace.isLocked = false;
      await workspace.addWidget({
        ...widgetSettings,
        position: {
          ...widgetSettings.position,
          x: (e.x / cqminBase) * 100,
          y: (e.y / cqminBase) * 100,
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

<svelte:window on:beforeunload={onBeforeUnload} />

{#if !workspace}
  <div
    out:fade={{ duration: 300 }}
    class="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center flex-col backdrop-blur-md bg-surface-50 dark:bg-surface-600 !bg-opacity-50">
    <ProgressRadial meter="stroke-primary-500" track="stroke-primary-500/30" />
  </div>
{/if}

<Drawer>
  <div class="flex flex-col h-full w-full">
    <canvas bind:this={dragnDropPreviewCanvas} class="hidden"></canvas>
    <Accordion>
      <AccordionItem>
        <svelte:fragment slot="lead">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </svelte:fragment>
        <svelte:fragment slot="summary">{m.Core_Sidebar_Settings()}</svelte:fragment>
        <svelte:fragment slot="content">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span>{m.Core_Sidebar_Settings_Language()}</span>
            <LanguageSelect />
          </label>
        </svelte:fragment>
      </AccordionItem>
    </Accordion>
    <div class="block mt-auto mb-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label flex justify-center items-center">
        <span>{m.Core_Sidebar_LockWorkspace()}</span>
        <SlideToggle name="stWorkspaceEditMode" class="ml-3" bind:checked={workspaceLocked} size="sm" />
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
    <p class="absolute top-0 left-28">{$workspace?.hasChanges}</p>
    {#each widgets as widget (widget.id)}
      <WidgetFactorty
        {widget}
        {widgetSettingsPopupSettings}
        on:mousedown={e => !workspaceLocked && selectExistingWidget(e, widget)}
        on:delete={onWidgetDelete}
        isSelected={!workspaceLocked && widget === $selectedWidget}
        class="widget-container" />
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
        elementGuidelines={['.widget-container:not(.selected)', '.workspace']}
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
    style:visibility={!workspaceLocked && $selectedWidget ? 'visible' : 'hidden'}>
    {#if widgetSettingsVisible && $selectedWidget}
      <WidgetSettingsComponent widget={$selectedWidget} workspace={workspaceEl} />
    {/if}
  </div>
</AppShell>
