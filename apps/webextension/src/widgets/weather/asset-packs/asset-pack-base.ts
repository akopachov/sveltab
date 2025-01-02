export const enum TimeOfDay {
  Day = 'day',
  Night = 'night',
}

export type WmoCodeMap = ReadonlyArray<string | [string, string] | undefined> & { length: 100 };

export abstract class BaseAssetsPack {
  #baseUrl: string;
  #wmoCodeMap: WmoCodeMap;
  #canBeColored: boolean;

  protected constructor(baseUrl: string, wmoCodeMap: WmoCodeMap, canBeColored: boolean) {
    this.#baseUrl = baseUrl;
    this.#wmoCodeMap = wmoCodeMap;
    this.#canBeColored = canBeColored;
  }

  getIconUrl(wmoCode: number, timeOfDay: TimeOfDay, color: string): string | undefined {
    const entry = this.#wmoCodeMap[wmoCode];
    let icon: string | undefined;
    if (!Array.isArray(entry)) {
      icon = entry;
    } else {
      icon = timeOfDay === TimeOfDay.Day ? entry[0] : entry[1];
    }

    if (!icon) {
      return undefined;
    }

    if (this.#canBeColored) {
      icon = icon.replace('{color}', encodeURIComponent(color));
    }

    return `${this.#baseUrl}/${icon}`;
  }
}
