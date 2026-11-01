import type { Renderer } from 'pixi.js';

export type Gender = 'male' | 'female';

export type Facing = 'left' | 'right';

export type BodyPart =
  | 'p1'
  | 'p1a'
  | 'p1b'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'p5'
  | 'p6'
  | 'p7'
  | 'p7b'
  | 'p8';

export type ColorSlot =
  | 'col0'
  | 'col0a'
  | 'col0c'
  | 'col1'
  | 'col1a'
  | 'col1b'
  | 'col1c'
  | 'col1d'
  | 'col2'
  | 'col2a'
  | 'col2b'
  | 'col3'
  | 'col3b'
  | 'col4'
  | 'col4a'
  | 'col4b';

export type BodyParts = Readonly<Record<BodyPart, number>>;

export type PortraitColors = Readonly<Record<ColorSlot, string>>;

export interface PortraitAppearance {
  gender: Gender;
  parts: BodyParts;
  colors: PortraitColors;
  facing?: Facing;
  scale?: number;
  highlightColorName?: ColorSlot;
  /** Disable the intentional black outline and selection highlight for source comparisons. */
  presentation?: boolean;
  /** Disable the intentional turquoise iris enhancement for source comparisons. */
  recolorIrises?: boolean;
}

export interface BruteDisplayOptions extends PortraitAppearance {
  renderer: Renderer;
}
