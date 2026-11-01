import type { FramePart, Svg, Symbol } from './common';

export interface PlannedPart {
  placement: FramePart;
  definition: Symbol | Svg;
  occurrence: number;
  zIndex: number;
  filterKey?: string;
  coloredSvg?: Svg;
  mask?: { name: string; transform: FramePart['transform'] };
}

const definitions = new WeakMap<object, Map<string, Symbol | Svg>>();
const plans = new WeakMap<readonly FramePart[], PlannedPart[]>();
const singleSvgs = new WeakMap<Symbol, Svg | null>();
const emptyFrame: PlannedPart[] = [];
const emptyDefinitions = new Map<string, Symbol | Svg>();

/** Definition lookups are shared across portraits; generated data is immutable. */
export function getDefinitions(parts: Symbol['parts']): Map<string, Symbol | Svg> {
  if (!parts) {
    return emptyDefinitions;
  }

  let indexed = definitions.get(parts);

  if (!indexed) {
    indexed = new Map(parts.map((part) => [part.name, part]));
    definitions.set(parts, indexed);
  }

  return indexed;
}

function singleSvg(symbol: Symbol): Svg | undefined {
  if (singleSvgs.has(symbol)) {
    return singleSvgs.get(symbol) ?? undefined;
  }

  let result: Svg | undefined;

  // Colorizing a single unmodified SVG can be cached as a texture. Groups with
  // masks, transforms, nested selectors, or effects still use compositing filters.
  if (symbol.frames?.length === 1 && symbol.frames[0].length === 1) {
    const part = symbol.frames[0][0];

    if (
      !part.transform &&
      !part.colorTransform &&
      !part.colorIdx &&
      !part.partIdx &&
      !part.filters &&
      !part.blendMode &&
      !part.maskedBy &&
      !part.isMask
    ) {
      const child = getDefinitions(symbol.parts).get(part.name);
      result = child?.type === 'svg' ? child : child ? singleSvg(child) : undefined;
    }
  }

  singleSvgs.set(symbol, result ?? null);
  return result;
}

export function getFramePlan(symbol: Symbol, frame: number): PlannedPart[] {
  const placements = symbol.frames?.[frame];
  if (!placements?.length) {
    return emptyFrame;
  }

  let plan = plans.get(placements);
  if (plan) {
    return plan;
  }

  const indexed = getDefinitions(symbol.parts);
  const occurrences = new Map<string, number>();
  plan = [];

  for (let index = 0; index < placements.length; index++) {
    const part = placements[index];
    if (part.isMask) {
      continue;
    }

    const definition = indexed.get(part.name);
    if (!definition) {
      throw new Error(`Part ${part.name} not found in ${symbol.name}`);
    }

    const occurrence = occurrences.get(part.name) ?? 0;
    occurrences.set(part.name, occurrence + 1);
    const maskName = part.maskedBy ? `Symbol${part.maskedBy}` : undefined;
    const maskPlacement = maskName
      ? placements.find((candidate) => candidate.name === maskName)
      : undefined;
    if (maskName && !maskPlacement) {
      throw new Error(`Mask ${maskName} not found`);
    }

    plan.push({
      placement: part,
      definition,
      occurrence,
      zIndex: placements.length - index,
      // Serialize source effects once, rather than on each portrait construction.
      filterKey:
        part.colorTransform || part.filters
          ? JSON.stringify([part.colorTransform, part.filters])
          : undefined,
      coloredSvg:
        part.colorIdx && !part.filters && definition.type === 'symbol'
          ? singleSvg(definition)
          : undefined,
      mask: maskName ? { name: maskName, transform: maskPlacement!.transform } : undefined,
    });
  }

  plans.set(placements, plan);
  return plan;
}
