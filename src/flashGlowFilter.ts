import { Filter } from 'pixi.js';
import type { FlashFilter } from './common';
import { FLASH_FILTER_VERTEX } from './flashFilterVertex';

// Flash's outer glow is a blurred alpha silhouette behind the original image.
// This sampling kernel approximates its blur; the comparison view deliberately
// reports rasterizer differences rather than treating them as exact matches.
const FRAGMENT = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform vec4 glowColor;
uniform vec2 radius;
uniform float strength;
uniform float innerGlow;
uniform float knockout;

void main(void)
{
  vec4 original = texture(uTexture, vTextureCoord);
  float blurred = 0.0;
  float total = 0.0;

  for (int x = -4; x <= 4; x++) {
    for (int y = -4; y <= 4; y++) {
      vec2 samplePoint = vec2(float(x), float(y)) / 4.0;
      float weight = exp(-2.0 * dot(samplePoint, samplePoint));
      float alpha = texture(uTexture,
        vTextureCoord + samplePoint * radius * uInputSize.zw).a;
      blurred += mix(alpha, 1.0 - alpha, innerGlow) * weight;
      total += weight;
    }
  }

  float alpha = clamp(blurred / total * strength, 0.0, 1.0) * glowColor.a;
  alpha *= mix(1.0 - original.a, original.a, innerGlow);
  vec4 glow = vec4(glowColor.rgb * alpha, alpha);
  finalColor = glow + original * (1.0 - knockout) * (1.0 - innerGlow * alpha);
}
`;

export function createFlashGlowFilter(source: FlashFilter, scale: number): Filter {
  const color = source.color ?? [255, 255, 255, 255];
  const filter = Filter.from({
    gl: {
      vertex: FLASH_FILTER_VERTEX,
      fragment: FRAGMENT,
      name: 'flash-glow',
    },
    resources: {
      glowUniforms: {
        glowColor: { value: color.map((channel) => channel / 255), type: 'vec4<f32>' },
        radius: {
          value: [((source.blurX ?? 0) * scale) / 2, ((source.blurY ?? 0) * scale) / 2],
          type: 'vec2<f32>',
        },
        strength: { value: source.strength ?? 1, type: 'f32' },
        innerGlow: { value: (source.flags ?? 0) & 128 ? 1 : 0, type: 'f32' },
        knockout: { value: (source.flags ?? 0) & 64 ? 1 : 0, type: 'f32' },
      },
    },
  });
  filter.padding = Math.ceil(Math.max(source.blurX ?? 0, source.blurY ?? 0) * scale);
  return filter;
}
