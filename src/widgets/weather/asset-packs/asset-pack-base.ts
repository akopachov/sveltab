export enum TimeOfDay {
  Day = 'day',
  Night = 'night',
}

export type WmoCodeMap = ReadonlyArray<string | [string, string] | undefined> & { length: 100 };

export abstract class BaseAssetsPack {
  #baseUrl: string;
  #wmoCodeMap: ReadonlyArray<string | [string, string] | undefined>;

  protected constructor(baseUrl: string, wmoCodeMap: WmoCodeMap) {
    this.#baseUrl = baseUrl;
    this.#wmoCodeMap = wmoCodeMap;
  }

  getIconUrl(wmoCode: number, timeOfDay: TimeOfDay): string | undefined {
    const entry = this.#wmoCodeMap[wmoCode];
    let icon: string | undefined;
    if (!Array.isArray(entry)) {
      icon = entry;
    } else {
      icon = timeOfDay === TimeOfDay.Day ? entry[0] : entry[1];
    }
    return icon ? `${this.#baseUrl}/${icon}` : icon;
  }
}
