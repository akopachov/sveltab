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

  export let selected: Set<WidgetInstance>;
  export let widgets: ReadonlySet<WidgetInstance>;
  export let workspace: HTMLElement;

  $: snappableList = [...Array.from(widgets, m => (selected.has(m) ? null : m.htmlElement)), workspace];
  $: widgetElementMap = new Map(Array.from(widgets, m => [m.htmlElement!, m]));
  $: selectedWidgetHtmlElementsMap = new Map(Array.from(selected, m => [m.htmlElement!, m]));

  let moveableRef: Moveable;
  let selectoRef: Selecto;
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

    selectedWidgetEl.classList.add('selected');
    selected.add(widget);
  }

  export function unselectAll() {
    selected.forEach(widget => unselect(widget));
  }

  export function unselect(widget: WidgetInstance) {
    if (selected.has(widget)) {
      const selectedWidgetEl = widget.htmlElement!;
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
    selected.forEach(widget => {
      widget.settings.rotation.value = detail.lastEvent.rotation;
    });
  }

  function onRotateGroupEnd({ detail: { events } }: CustomEvent<OnRotateGroupEnd>) {
    events.forEach(ev => {
      const widget = widgetElementMap.get(ev.target as HTMLElement);
      if (widget) {
        widget.settings.rotation.value = ev.lastEvent.rotation;
        ev.target.style.left = `${ev.lastEvent.drag.left}px`;
        ev.target.style.top = `${ev.lastEvent.drag.top}px`;
      }
    });
    setTimeout(() => moveableRef.updateRect());
  }

  function onDragStart({ detail: e }: CustomEvent<OnDragStart>) {
    let target = e.inputEvent.target;
    if (moveableRef.isMoveableElement(target)) {
      e.stop();
    } else {
      let widget = null;
      while (target && !(widget = selectedWidgetHtmlElementsMap.get(target))) {
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
      moveableRef.waitToChangeTarget().then(() => {
        moveableRef.dragStart(e.inputEvent);
      });
    }

    selected.forEach(w => {
      if (w.htmlElement && !e.selected.includes(w.htmlElement)) {
        unselect(w);
      }
    });

    e.selected.forEach(el => {
      if (el instanceof HTMLElement) {
        const widget = widgetElementMap.get(el);
        if (widget) {
          select(widget, el);
        }
      }
    });
    selected = selected;
  }
</script>

<Moveable
  bind:this={moveableRef}
  target={Array.from(selectedWidgetHtmlElementsMap.keys())}
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
  bind:this={selectoRef}
  container={workspace}
  rootContainer={workspace}
  dragContainer={workspace}
  selectableTargets={Array.from(widgetElementMap.keys())}
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
