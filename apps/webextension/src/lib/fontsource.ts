export type FontSubset =
  | 'latin'
  | 'latin-ext'
  | 'cyrillic'
  | 'cyrillic-ext'
  | 'greek'
  | 'vietnamese'
  | 'hebrew'
  | 'cyrillic'
  | (string & NonNullable<unknown>);

export type FontStyle = 'normal' | 'italic' | (string & NonNullable<unknown>);

export enum FontWeight {
  Thin = 100,
  ExtraLight = 200,
  Light = 300,
  Normal = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
  Heavy = 900,
}

export type FontSource = {
  id: string;
  family: string;
  subsets: FontSubset[];
  weights: FontWeight[];
  styles: FontStyle[];
  unicodeRange: {
    [key: string]: string;
  };
  defSubset: string;
  variable: boolean;
  lastModified: string;
  category: string;
  version: string;
  type: string;
  variants: Record<
    `${FontWeight}`,
    {
      [style in FontStyle]?: {
        [subset in FontSubset]?: {
          url: {
            woff2: string;
            woff: string;
            ttf: string;
          };
        };
      };
    } | undefined
  >;
};
