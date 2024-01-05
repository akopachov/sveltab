<script lang="ts">
  import type { WidgetInstance } from '$lib/widget-instance';
  import Moveable, {
    type OnDrag,
    type OnDragGroup,
    type OnResize,
    type OnResizeGroup,
    type OnRotate,
    type OnRotateEnd,
    type OnRotateGroup,
    type OnRotateGroupEnd,
  } from 'svelte-moveable';

  export let selected: Set<WidgetInstance>;
  export let widgets: ReadonlySet<WidgetInstance>;
  export let workspace: HTMLElement;

  $: {
    workspace.addEventListener('mousedown', onWorkspaceClick);
  }

  $: snappableList = Array.from(widgets, m => (selectedWidgets.has(m) ? null : `#widget_${m.id}`));

  let moveable: Moveable;
  let selectedWidgets = new Map<WidgetInstance, HTMLElement>();

  export function select(widget: WidgetInstance, e: MouseEvent) {
    if (e.button === 0 && moveable) {
      e.stopPropagation();

      if (e.ctrlKey && selectedWidgets.has(widget)) {
        unselect(widget);
      } else if (!selectedWidgets.has(widget)) {
        if (!e.ctrlKey) {
          unselectAll();
        }
        const selectedWidgetEl = e.currentTarget as HTMLElement;

        const absolutePos = widget.settings.position.getAbsolute(workspace);

        selectedWidgetEl.style.width = `${absolutePos.width}px`;
        selectedWidgetEl.style.height = `${absolutePos.height}px`;
        selectedWidgetEl.style.left = `${absolutePos.x}px`;
        selectedWidgetEl.style.top = `${absolutePos.y}px`;

        selectedWidgetEl.classList.add('selected');
        selectedWidgets.set(widget, selectedWidgetEl);
        selectedWidgets = selectedWidgets;
        selected.add(widget);
        selected = selected;
      }

      setTimeout(() => {
        moveable.dragStart(e);
      });
    }
  }

  export function unselectAll() {
    selectedWidgets.forEach((_, widget) => unselect(widget));
  }

  function onWorkspaceClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement && e.target.closest('.moveable-control-box') === null) {
      unselectAll();
    }
  }

  export function unselect(widget: WidgetInstance) {
    const selectedWidgetEl = selectedWidgets.get(widget);
    if (selectedWidgetEl) {
      const selectedWidgetSettings = widget.settings;
      selectedWidgetSettings.position.setFromAbsolute(workspace, {
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
      selectedWidgets.delete(widget);
      selectedWidgets = selectedWidgets;
      selected.delete(widget);
      selected = selected;
    }
  }

  function onDrag({ detail: e }: CustomEvent<OnDrag>) {
    e.target.style.left = `${e.left}px`;
    e.target.style.top = `${e.top}px`;
  }

  function onDragGroup({ detail: { events } }: CustomEvent<OnDragGroup>) {
    events.forEach(ev => {
      ev.target.style.left = `${ev.left}px`;
      ev.target.style.top = `${ev.top}px`;
    });
  }

  function onResize({ detail: e }: CustomEvent<OnResize>) {
    e.target.style.width = `${e.width}px`;
    e.target.style.height = `${e.height}px`;
    e.target.style.left = `${e.drag.left}px`;
    e.target.style.top = `${e.drag.top}px`;
  }

  function onResizeGroup({ detail: { events } }: CustomEvent<OnResizeGroup>) {
    events.forEach(ev => {
      ev.target.style.width = `${ev.width}px`;
      ev.target.style.height = `${ev.height}px`;
      ev.target.style.left = `${ev.drag.left}px`;
      ev.target.style.top = `${ev.drag.top}px`;
    });
  }

  function onRotate({ detail: e }: CustomEvent<OnRotate>) {
    e.target.style.transform = e.drag.transform;
  }

  function onRotateGroup({ detail: { events } }: CustomEvent<OnRotateGroup>) {
    events.forEach(ev => {
      ev.target.style.transform = ev.drag.transform;
    });
  }

  function onRotateEnd({ detail }: CustomEvent<OnRotateEnd>) {
    selectedWidgets.forEach((_, widget) => {
      widget.settings.rotation.value = detail.lastEvent.rotation;
    });
  }

  function onRotateGroupEnd({ detail: { events } }: CustomEvent<OnRotateGroupEnd>) {
    const targetToWidget = new Map<Element, WidgetInstance>(Array.from(selectedWidgets.entries(), ([k, v]) => [v, k]));
    events.forEach(ev => {
      const widget = targetToWidget.get(ev.target);
      if (widget) {
        widget.settings.rotation.value = ev.lastEvent.rotation;
        ev.target.style.left = `${ev.lastEvent.drag.left}px`;
        ev.target.style.top = `${ev.lastEvent.drag.top}px`;
      }
    });
    setTimeout(() => moveable.updateRect());
  }
</script>

<svelte:window on:resize={() => unselectAll()} />

<Moveable
  bind:this={moveable}
  target={Array.from(selectedWidgets.values())}
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
  keepRatio={false}
  snappable={true}
  snapGap={true}
  snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
  elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
  elementGuidelines={[...snappableList, '.workspace']}
  snapContainer={'.workspace'}
  bounds={{ left: 0, top: 0, right: 0, bottom: 0, position: 'css' }}
  isDisplaySnapDigit={true}
  on:drag={onDrag}
  on:dragGroup={onDragGroup}
  on:resize={onResize}
  on:resizeGroup={onResizeGroup}
  on:rotate={onRotate}
  on:rotateGroup={onRotateGroup}
  on:rotateEnd={onRotateEnd}
  on:rotateGroupEnd={onRotateGroupEnd} />
