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
  import Selecto, { type OnDragStart, type OnSelectEnd } from 'svelte-selecto';

  let {
    widgets,
    selected,
    workspace,
    widgetControlsZone,
  }: {
    widgets: ReadonlySet<WidgetInstance>;
    selected: Set<WidgetInstance>;
    workspace: HTMLElement;
    widgetControlsZone: string;
  } = $props();

  let snappableList = $derived([
    ...Array.from(widgets, m => (selected.has(m) ? null : `#${m.htmlElementId}`)),
    workspace,
  ]);
  let widgetElementMap = $derived(new Map(Array.from(widgets, m => [m.htmlElementId, m])));
  let selectedWidgetHtmlElementsMap = $derived(new Map(Array.from(selected, m => [m.htmlElementId, m])));

  let moveableRef: any = $state();
  let moveableInstance: Moveable | undefined = $derived(moveableRef?.getInstance());
  const unspecified: any = undefined;

  function select(widget: WidgetInstance, selectedWidgetEl: HTMLElement) {
    if (selected.has(widget)) {
      return;
    }

    const absolutePos = widget.settings.position.getAbsolute(workspace);

    selectedWidgetEl.style.width = `${absolutePos.width}px`;
    selectedWidgetEl.style.height = `${absolutePos.height}px`;
    selectedWidgetEl.style.left = `${absolutePos.x}px`;
    selectedWidgetEl.style.top = `${absolutePos.y}px`;
    selectedWidgetEl.style.transform = `rotate(${widget.settings.rotation.value}deg)`;

    selectedWidgetEl.classList.add('selected');
    selected.add(widget);
  }

  export function unselectAll() {
    selected.forEach(widget => unselect(widget));
  }

  export function unselect(widget: WidgetInstance) {
    if (selected.has(widget)) {
      const selectedWidgetEl = document.getElementById(widget.htmlElementId)!;
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
      selectedWidgetEl.style.transform = '';

      selectedWidgetEl.classList.remove('selected');
      selected.delete(widget);
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
    selected.forEach(widget => {
      widget.settings.rotation.value = detail.lastEvent.rotation;
    });
  }

  function onRotateGroupEnd({ detail: { events } }: CustomEvent<OnRotateGroupEnd>) {
    events.forEach(ev => {
      const widget = widgetElementMap.get(ev.target.id);
      if (widget) {
        widget.settings.rotation.value = ev.lastEvent.rotation;
        ev.target.style.left = `${ev.lastEvent.drag.left}px`;
        ev.target.style.top = `${ev.lastEvent.drag.top}px`;
      }
    });
    setTimeout(() => moveableInstance?.updateRect());
  }

  function onDragStart({ detail: e }: CustomEvent<OnDragStart>) {
    let target = <HTMLElement | null>e.inputEvent.target;
    if (target && moveableInstance?.isMoveableElement(target)) {
      e.stop();
    } else {
      let widget = null;
      while (target && !(widget = selectedWidgetHtmlElementsMap.get(target.id))) {
        if (widgetControlsZone && target.matches(widgetControlsZone)) {
          e.stop();
          return;
        }

        target = target.parentElement;
      }
      if (widget) {
        e.stop();
      }
    }
  }

  function onSelectEnd({ detail: e }: CustomEvent<OnSelectEnd>) {
    if (e.isDragStart) {
      e.inputEvent.preventDefault();
      moveableInstance?.waitToChangeTarget().then(() => {
        moveableInstance?.dragStart(e.inputEvent);
      });
    }

    e.removed.forEach(el => {
      if (el instanceof HTMLElement) {
        const widget = widgetElementMap.get(el.id);
        if (widget) {
          unselect(widget);
        }
      }
    });

    e.selected.forEach(el => {
      if (el instanceof HTMLElement) {
        const widget = widgetElementMap.get(el.id);
        if (widget) {
          select(widget, el);
        }
      }
    });
  }
</script>

<Moveable
  bind:this={moveableRef}
  target={Array.from(selectedWidgetHtmlElementsMap.keys(), v => `#${v}`)}
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
  elementGuidelines={snappableList}
  snapContainer={workspace}
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

<Selecto
  container={workspace}
  rootContainer={workspace}
  dragContainer={workspace}
  selectableTargets={Array.from(widgetElementMap.keys(), v => `#${v}`)}
  hitRate={50}
  selectByClick={true}
  selectFromInside={false}
  clickBySelectEnd={unspecified}
  continueSelectWithoutDeselect={unspecified}
  continueSelect={unspecified}
  toggleContinueSelectWithoutDeselect={unspecified}
  keyContainer={unspecified}
  boundContainer={workspace}
  scrollOptions={unspecified}
  innerScrollOptions={unspecified}
  checkInput={false}
  preventDefault={false}
  cspNonce=""
  getElementRect={unspecified}
  dragCondition={unspecified}
  portalContainer={null}
  checkOverflow={false}
  toggleContinueSelect={['ctrl']}
  ratio={0}
  className=""
  preventDragFromInside={unspecified}
  on:dragStart={onDragStart}
  on:selectEnd={onSelectEnd} />
