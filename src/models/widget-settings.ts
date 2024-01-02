import { nanoid } from 'nanoid';
import { Subscribable, type OmitSubscribable } from './subscribable';
import type { Filter } from '$stores/active-filters-store';

export type WidgetPositionInitial = Partial<OmitSubscribable<WidgetPosition>>;

export enum WidgetMeasurementUnits {
  Scale = 'cqmin',
  Fixed = 'px',
}

export type RelativeContainer = { clientWidth: number; clientHeight: number };

export class WidgetPosition extends Subscribable implements WidgetPositionInitial {
  constructor(initial: WidgetPositionInitial) {
    super();
    this.x = initial.x || 0;
    this.y = initial.y || 0;
    this.offsetX = initial.offsetX || 0;
    this.offsetY = initial.offsetY || 0;
    this.width = initial.width || 10;
    this.height = initial.height || 10;
    this.sizeUnits = initial.sizeUnits || WidgetMeasurementUnits.Scale;
    this.positionUnits = initial.positionUnits || WidgetMeasurementUnits.Scale;
  }

  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  sizeUnits: WidgetMeasurementUnits;
  positionUnits: WidgetMeasurementUnits;

  updateMeasurement(
    relativeContainer: RelativeContainer,
    options: {
      offsetX?: number;
      offsetY?: number;
      sizeUnits?: WidgetMeasurementUnits;
      positionUnits?: WidgetMeasurementUnits;
    },
  ) {
    const offsetX = options.offsetX ?? this.offsetX;
    const offsetY = options.offsetY ?? this.offsetY;
    const sizeUnits = options.sizeUnits || this.sizeUnits;
    const positionUnits = options.positionUnits || this.positionUnits;

    const cqminBase = Math.min(relativeContainer.clientWidth, relativeContainer.clientHeight);
    let anythingChanged = false;

    const absPosition = this.getAbsolute(relativeContainer);

    if (offsetX !== this.offsetX || positionUnits !== this.positionUnits || sizeUnits !== this.sizeUnits) {
      const absNewOffsetX = (relativeContainer.clientWidth * offsetX) / 100;
      const newAbsX = absPosition.x - absNewOffsetX + (absPosition.width * offsetX) / 100;
      this.x = positionUnits === WidgetMeasurementUnits.Fixed ? newAbsX : (newAbsX / cqminBase) * 100;
      this.offsetX = offsetX;
      anythingChanged = true;
    }

    if (offsetY !== this.offsetY || positionUnits !== this.positionUnits || sizeUnits !== this.sizeUnits) {
      const absNewOffsetY = (relativeContainer.clientHeight * offsetY) / 100;

      const newAbsY = absPosition.y - absNewOffsetY + (absPosition.height * offsetY) / 100;
      this.y = positionUnits === WidgetMeasurementUnits.Fixed ? newAbsY : (newAbsY / cqminBase) * 100;
      this.offsetY = offsetY;
      anythingChanged = true;
    }

    if (sizeUnits !== this.sizeUnits) {
      this.width =
        sizeUnits === WidgetMeasurementUnits.Fixed ? absPosition.width : (absPosition.width / cqminBase) * 100;
      this.height =
        sizeUnits === WidgetMeasurementUnits.Fixed ? absPosition.height : (absPosition.height / cqminBase) * 100;
      anythingChanged = true;
    }

    this.sizeUnits = sizeUnits;
    this.positionUnits = positionUnits;
    if (anythingChanged) {
      this.notifyPropertiesChanged();
    }
  }

  setFromAbsolute(
    relativeContainer: RelativeContainer,
    absPosition: { x: number; y: number; width: number; height: number },
  ) {
    const cqminBase = Math.min(relativeContainer.clientWidth, relativeContainer.clientHeight);
    let anythingChanged = false;
    const newWidth =
      this.sizeUnits === WidgetMeasurementUnits.Fixed ? absPosition.width : (absPosition.width / cqminBase) * 100;
    if (newWidth !== this.width) {
      this.width = newWidth;
      anythingChanged = true;
    }

    const newHeight =
      this.sizeUnits === WidgetMeasurementUnits.Fixed ? absPosition.height : (absPosition.height / cqminBase) * 100;
    if (newHeight !== this.height) {
      this.height = newHeight;
      anythingChanged = true;
    }

    const absOffsetX = (relativeContainer.clientWidth * this.offsetX) / 100;
    const absX = absPosition.x + (absPosition.width * this.offsetX) / 100 - absOffsetX;
    const newX = this.positionUnits === WidgetMeasurementUnits.Fixed ? absX : (absX / cqminBase) * 100;
    if (newX !== this.x) {
      this.x = newX;
      anythingChanged = true;
    }

    const absOffsetY = (relativeContainer.clientHeight * this.offsetY) / 100;
    const absY = absPosition.y + (absPosition.height * this.offsetY) / 100 - absOffsetY;
    const newY = this.positionUnits === WidgetMeasurementUnits.Fixed ? absY : (absY / cqminBase) * 100;
    if (newY !== this.y) {
      this.y = newY;
      anythingChanged = true;
    }

    if (anythingChanged) {
      this.notifyPropertiesChanged();
    }
  }

  getAbsolute(relativeContainer: RelativeContainer) {
    const cqminBase = Math.min(relativeContainer.clientWidth, relativeContainer.clientHeight);

    const absWidth = this.sizeUnits === WidgetMeasurementUnits.Fixed ? this.width : (this.width / 100) * cqminBase;
    const absHeight = this.sizeUnits === WidgetMeasurementUnits.Fixed ? this.height : (this.height / 100) * cqminBase;

    const absX = this.positionUnits === WidgetMeasurementUnits.Fixed ? this.x : (this.x / 100) * cqminBase;
    const absY = this.positionUnits === WidgetMeasurementUnits.Fixed ? this.y : (this.y / 100) * cqminBase;

    return {
      width: absWidth,
      height: absHeight,
      x: absX + (this.offsetX / 100) * relativeContainer.clientWidth - (absWidth * this.offsetX) / 100,
      y: absY + (this.offsetY / 100) * relativeContainer.clientHeight - (absHeight * this.offsetY) / 100,
    };
  }
}

export class WidgetSettingsExtra extends Subscribable implements WidgetSettingsExtraInitial<any> {
  [key: string | number | symbol]: any;
}
export type WidgetSettingsExtraInitial<T extends WidgetSettingsExtra> = Partial<OmitSubscribable<T>>;
export type WidgetSettingsInitial = Partial<Omit<OmitSubscribable<WidgetSettings>, 'extra' | 'position'>> &
  Required<Pick<WidgetSettings, 'type'>> & { extra?: WidgetSettingsExtraInitial<WidgetSettingsExtra> } & {
    position?: WidgetPositionInitial;
  };

export class WidgetSettings extends Subscribable implements WidgetSettingsInitial {
  constructor(
    initial: WidgetSettingsInitial,
    extraConstructor: new (initial: WidgetSettingsExtraInitial<any>) => WidgetSettingsExtra,
  ) {
    super();
    this.id = initial.id || nanoid();
    this.type = initial.type;
    this.rotation = initial.rotation || 0;
    this.zIndex = initial.zIndex || 0;
    this.borderRadius = initial.borderRadius || 0;
    this.keepRatio = Boolean(initial.keepRatio);
    this.extra = new extraConstructor(initial.extra || {});
    this.position = new WidgetPosition(initial.position || {});
    this.filter = initial.filter;
  }

  readonly id: string;
  readonly type: string;
  readonly position: WidgetPosition;
  rotation: number;
  zIndex: number;
  borderRadius: number;
  readonly extra: WidgetSettingsExtra;
  keepRatio: boolean;
  filter: Filter | undefined;
}

export type FontSettingsInitial = Partial<OmitSubscribable<FontSettings>>;
export class FontSettings extends Subscribable implements FontSettingsInitial {
  constructor(initial: FontSettingsInitial) {
    super();
    this.id = initial.id || 'noto-sans';
    this.weight = initial.weight || 400;
    this.size = initial.size;
  }

  id: string;
  weight: number;
  size: number | undefined;
}

export type ShadowSettingsInitial = Partial<OmitSubscribable<ShadowSettings>>;
export class ShadowSettings extends Subscribable implements ShadowSettingsInitial {
  constructor(initial: ShadowSettingsInitial) {
    super();
    this.offsetX = initial.offsetX || 0;
    this.offsetY = initial.offsetY || 0;
    this.blur = initial.blur || 0;
    this.color = initial.color || '#000';
  }

  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}
