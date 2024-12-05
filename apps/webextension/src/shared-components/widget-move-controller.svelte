<script lang="ts">
  import type { WidgetInstance } from '$lib/widget-instance';
  import Moveable, {
    type OnDrag,
    type OnDragGroup,
    type OnResize,
    type OnResizeGroup,
    type OnRotate,
    type OnRotateGroup,
    type OnChangeTargets,
  } from 'svelte-moveable';
  import Selecto, { type OnDragStart, type OnSelectEnd } from 'svelte-selecto';

  let {
    widgets,
    selected,
    workspace,
    widgetControlsZone,
    dirtyWidth = $bindable(),
    dirtyHeight = $bindable(),
    dirtyRotation = $bindable(),
  }: {
    widgets: ReadonlySet<WidgetInstance>;
    selected: Set<WidgetInstance>;
    workspace: HTMLElement;
    widgetControlsZone: string;
    dirtyWidth?: number;
    dirtyHeight?: number;
    dirtyRotation?: number;
  } = $props();

  let snappableList = $derived([
    ...Array.from(widgets, m => (selected.has(m) ? null : `#${m.htmlElementId}`)),
    workspace,
  ]);
  let widgetElementMap = $derived(new Map(Array.from(widgets, m => [m.htmlElementId, m])));
  let selectedWidgetHtmlElementsMap = $derived(new Map(Array.from(selected, m => [m.htmlElementId, m])));

  let moveableRef: any = $state.raw();
  let moveableInstance: Moveable | undefined = $derived(moveableRef?.getInstance());
  const unspecified: any = undefined;

  $effect(() => {
    if (dirtyWidth !== undefined || dirtyHeight !== undefined) {
      const requester = moveableInstance?.request('resizable');
      if (dirtyWidth !== undefined && dirtyWidth > 0) {
        requester?.request({ offsetWidth: dirtyWidth });
      }

      if (dirtyHeight !== undefined && dirtyHeight > 0) {
        requester?.request({ offsetHeight: dirtyHeight });
      }

      requester?.requestEnd();
    }
  });
  $effect(() => {
    if (dirtyRotation !== undefined) {
      const requester = moveableInstance?.request('rotatable');
      requester?.request({ rotate: normalizeRotation(dirtyRotation) });
      requester?.requestEnd();
    }
  });

  function select(widget: WidgetInstance, selectedWidgetEl: HTMLElement) {
    if (selected.has(widget)) {
      return;
    }

    const absolutePos = widget.settings.position.getAbsolute(workspace);

    selectedWidgetEl.style.width = `${absolutePos.width}px`;
    selectedWidgetEl.style.height = `${absolutePos.height}px`;
    selectedWidgetEl.style.left = `${absolutePos.x}px`;
    selectedWidgetEl.style.top = `${absolutePos.y}px`;
    selectedWidgetEl.style.transform = `rotate(${normalizeRotation(widget.settings.rotation.value)}deg)`;

    selectedWidgetEl.classList.add('selected');
    selected.add(widget);
  }

  function normalizeRotation(rotation: number) {
    if (rotation >= 360) {
      rotation = rotation % 360;
    } else if (rotation < 0) {
      rotation += Math.ceil(-rotation / 360) * 360;
    }

    return rotation;
  }

  export function unselectAll() {
    selected.forEach(widget => unselect(widget));
  }

  export function unselect(widget: WidgetInstance) {
    if (selected.has(widget)) {
      const selectedWidgetEl = document.getElementById(widget.htmlElementId)!;
      const selectedWidgetSettings = widget.settings;
      const translateTransform = /translate\((.+)px,\s*(.+)px\)/.exec(selectedWidgetEl.style.transform);
      const xTranslate = translateTransform && translateTransform.length > 1 ? parseFloat(translateTransform[1]) : 0;
      const yTranslate = translateTransform && translateTransform.length > 2 ? parseFloat(translateTransform[2]) : 0;
      selectedWidgetSettings.position.setFromAbsolute(workspace, {
        x: parseFloat(selectedWidgetEl.style.left) + xTranslate,
        y: parseFloat(selectedWidgetEl.style.top) + yTranslate,
        width: parseFloat(selectedWidgetEl.style.width),
        height: parseFloat(selectedWidgetEl.style.height),
      });
      const rotationTransform = /rotate\((.+)deg\)/.exec(selectedWidgetEl.style.transform);
      selectedWidgetSettings.rotation.value = normalizeRotation(
        parseFloat(rotationTransform && rotationTransform.length > 1 ? rotationTransform[1] : ''),
      );

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

    dirtyWidth = Math.round(e.width);
    dirtyHeight = Math.round(e.height);
  }

  function onTargetChanged({ detail }: CustomEvent<OnChangeTargets>) {
    if (detail.targets.length == 1) {
      const rect = detail.moveable.getRect();
      dirtyWidth = Math.round(rect.offsetWidth);
      dirtyHeight = Math.round(rect.offsetHeight);
      dirtyRotation = normalizeRotation(Math.round(rect.rotation));
    }
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
    let rotation = normalizeRotation(e.rotation);
    e.target.style.transform = `rotate(${rotation}deg)`;
    if ((e as any).isRequest !== true) {
      dirtyRotation = Math.round(rotation);
    }
  }

  function onRotateGroup({ detail: { events } }: CustomEvent<OnRotateGroup>) {
    events.forEach(ev => {
      ev.target.style.transform = ev.drag.transform;
    });
  }

  function onRotateGroupEnd() {
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
  on:changeTargets={onTargetChanged}
  on:resizeGroup={onResizeGroup}
  on:rotate={onRotate}
  on:rotateGroup={onRotateGroup}
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
