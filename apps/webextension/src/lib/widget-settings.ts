import { nanoid } from 'nanoid';
import type { Filter } from '$stores/active-filters-store';
import { useObservable, type Observable, type Unobserved } from './observable.svelte';

export type WidgetPositionInitial = Partial<Unobserved<WidgetPosition>>;

export const enum WidgetMeasurementUnits {
  Scale = 'cqmin',
  Fixed = 'px',
}

export type RelativeContainer = { clientWidth: number; clientHeight: number };

export class WidgetPosition {
  constructor(initial: WidgetPositionInitial) {
    this.x = useObservable(initial.x || 0);
    this.y = useObservable(initial.y || 0);
    this.offsetX = useObservable(initial.offsetX || 0);
    this.offsetY = useObservable(initial.offsetY || 0);
    this.width = useObservable(initial.width || 10);
    this.height = useObservable(initial.height || 10);
    this.sizeUnits = useObservable(initial.sizeUnits || WidgetMeasurementUnits.Scale);
    this.positionUnits = useObservable(initial.positionUnits || WidgetMeasurementUnits.Scale);
  }

  readonly x: Observable<number>;
  readonly y: Observable<number>;
  readonly offsetX: Observable<number>;
  readonly offsetY: Observable<number>;
  readonly width: Observable<number>;
  readonly height: Observable<number>;
  readonly sizeUnits: Observable<WidgetMeasurementUnits>;
  readonly positionUnits: Observable<WidgetMeasurementUnits>;

  updateMeasurement(
    relativeContainer: RelativeContainer,
    options: {
      offsetX?: number;
      offsetY?: number;
      sizeUnits?: WidgetMeasurementUnits;
      positionUnits?: WidgetMeasurementUnits;
    },
  ) {
    const offsetX = options.offsetX ?? this.offsetX.value;
    const offsetY = options.offsetY ?? this.offsetY.value;
    const sizeUnits = options.sizeUnits || this.sizeUnits.value;
    const positionUnits = options.positionUnits || this.positionUnits.value;

    const cqminBase = Math.min(relativeContainer.clientWidth, relativeContainer.clientHeight);

    const absPosition = this.getAbsolute(relativeContainer);

    if (
      offsetX !== this.offsetX.value ||
      positionUnits !== this.positionUnits.value ||
      sizeUnits !== this.sizeUnits.value
    ) {
      const absNewOffsetX = (relativeContainer.clientWidth * offsetX) / 100;
      const newAbsX = absPosition.x - absNewOffsetX + (absPosition.width * offsetX) / 100;
      this.x.value = positionUnits === WidgetMeasurementUnits.Fixed ? newAbsX : (newAbsX / cqminBase) * 100;
      this.offsetX.value = offsetX;
    }

    if (
      offsetY !== this.offsetY.value ||
      positionUnits !== this.positionUnits.value ||
      sizeUnits !== this.sizeUnits.value
    ) {
      const absNewOffsetY = (relativeContainer.clientHeight * offsetY) / 100;

      const newAbsY = absPosition.y - absNewOffsetY + (absPosition.height * offsetY) / 100;
      this.y.value = positionUnits === WidgetMeasurementUnits.Fixed ? newAbsY : (newAbsY / cqminBase) * 100;
      this.offsetY.value = offsetY;
    }

    if (sizeUnits !== this.sizeUnits.value) {
      this.width.value =
        sizeUnits === WidgetMeasurementUnits.Fixed ? absPosition.width : (absPosition.width / cqminBase) * 100;
      this.height.value =
        sizeUnits === WidgetMeasurementUnits.Fixed ? absPosition.height : (absPosition.height / cqminBase) * 100;
    }

    this.sizeUnits.value = sizeUnits;
    this.positionUnits.value = positionUnits;
  }

  setFromAbsolute(
    relativeContainer: RelativeContainer,
    absPosition: { x: number; y: number; width: number; height: number },
  ) {
    const cqminBase = Math.min(relativeContainer.clientWidth, relativeContainer.clientHeight);
    const newWidth =
      this.sizeUnits.value === WidgetMeasurementUnits.Fixed ? absPosition.width : (absPosition.width / cqminBase) * 100;
    if (newWidth !== this.width.value) {
      this.width.value = newWidth;
    }

    const newHeight =
      this.sizeUnits.value === WidgetMeasurementUnits.Fixed
        ? absPosition.height
        : (absPosition.height / cqminBase) * 100;
    if (newHeight !== this.height.value) {
      this.height.value = newHeight;
    }

    const absOffsetX = (relativeContainer.clientWidth * this.offsetX.value) / 100;
    const absX = absPosition.x + (absPosition.width * this.offsetX.value) / 100 - absOffsetX;
    const newX = this.positionUnits.value === WidgetMeasurementUnits.Fixed ? absX : (absX / cqminBase) * 100;
    if (newX !== this.x.value) {
      this.x.value = newX;
    }

    const absOffsetY = (relativeContainer.clientHeight * this.offsetY.value) / 100;
    const absY = absPosition.y + (absPosition.height * this.offsetY.value) / 100 - absOffsetY;
    const newY = this.positionUnits.value === WidgetMeasurementUnits.Fixed ? absY : (absY / cqminBase) * 100;
    if (newY !== this.y.value) {
      this.y.value = newY;
    }
  }

  getAbsolute(relativeContainer: RelativeContainer) {
    const cqminBase = Math.min(relativeContainer.clientWidth, relativeContainer.clientHeight);

    const absWidth =
      this.sizeUnits.value === WidgetMeasurementUnits.Fixed ? this.width.value : (this.width.value / 100) * cqminBase;
    const absHeight =
      this.sizeUnits.value === WidgetMeasurementUnits.Fixed ? this.height.value : (this.height.value / 100) * cqminBase;

    const absX =
      this.positionUnits.value === WidgetMeasurementUnits.Fixed ? this.x.value : (this.x.value / 100) * cqminBase;
    const absY =
      this.positionUnits.value === WidgetMeasurementUnits.Fixed ? this.y.value : (this.y.value / 100) * cqminBase;

    return {
      width: absWidth,
      height: absHeight,
      x: absX + (this.offsetX.value / 100) * relativeContainer.clientWidth - (absWidth * this.offsetX.value) / 100,
      y: absY + (this.offsetY.value / 100) * relativeContainer.clientHeight - (absHeight * this.offsetY.value) / 100,
    };
  }
}

export class WidgetSettingsExtra {
  [key: string | number | symbol]: any;
}
export type WidgetSettingsExtraInitial<T extends WidgetSettingsExtra> = Partial<Unobserved<T>>;
export type WidgetSettingsInitial = Partial<Omit<Unobserved<WidgetSettings>, 'extra' | 'position'>> &
  Required<Pick<WidgetSettings, 'type'>> & { extra?: WidgetSettingsExtraInitial<WidgetSettingsExtra> } & {
    position?: WidgetPositionInitial;
  };

export class WidgetSettings {
  constructor(
    initial: WidgetSettingsInitial,
    extraConstructor: new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra,
  ) {
    this.id = initial.id || nanoid();
    this.type = initial.type;
    this.rotation = useObservable(initial.rotation || 0);
    this.zIndex = useObservable(initial.zIndex || 0);
    this.borderRadius = useObservable(initial.borderRadius || 0);
    this.borderSize = useObservable(initial.borderSize || 0);
    this.borderColor = useObservable(initial.borderColor || '#000');
    this.keepRatio = useObservable(Boolean(initial.keepRatio));
    this.extra = new extraConstructor(initial.extra || {});
    this.position = new WidgetPosition(initial.position || {});
    this.filter = useObservable(initial.filter);
  }

  readonly id: string;
  readonly type: string;
  readonly position: WidgetPosition;
  readonly rotation: Observable<number>;
  readonly zIndex: Observable<number>;
  readonly borderRadius: Observable<number>;
  readonly borderSize: Observable<number>;
  readonly borderColor: Observable<string>;
  readonly extra: WidgetSettingsExtra;
  readonly keepRatio: Observable<boolean>;
  readonly filter: Observable<Filter | undefined>;
}

export type FontSettingsInitial = Partial<Unobserved<FontSettings>>;
export class FontSettings {
  constructor(initial: FontSettingsInitial) {
    this.id = useObservable(initial.id || 'noto-sans');
    this.weight = useObservable(initial.weight || 400);
    this.size = useObservable(initial.size);
  }

  readonly id: Observable<string>;
  readonly weight: Observable<number>;
  readonly size: Observable<number | undefined>;
}

export type ShadowSettingsInitial = Partial<Unobserved<ShadowSettings>>;
export class ShadowSettings {
  constructor(initial: ShadowSettingsInitial) {
    this.offsetX = useObservable(initial.offsetX || 0);
    this.offsetY = useObservable(initial.offsetY || 0);
    this.blur = useObservable(initial.blur || 0);
    this.color = useObservable(initial.color || '#000');
  }

  readonly offsetX: Observable<number>;
  readonly offsetY: Observable<number>;
  readonly blur: Observable<number>;
  readonly color: Observable<string>;
}

export type TextStrokeSettingsInitial = Partial<Unobserved<TextStrokeSettings>>;
export class TextStrokeSettings {
  constructor(initial: TextStrokeSettingsInitial) {
    this.size = useObservable(initial.size || 0);
    this.color = useObservable(initial.color || '#000');
  }

  readonly size: Observable<number>;
  readonly color: Observable<string>;
}
