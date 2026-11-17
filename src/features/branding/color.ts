/**
 * Color math for the panel theme.
 *
 * Store colors arrive as hex. We work in OKLCH (perceptually even, so a
 * lightness step looks the same for every hue), map back into the sRGB
 * gamut, and emit the `h s% l%` triplets the Tailwind tokens expect.
 */

export type Rgb = [number, number, number]; // 0..1, gamma-encoded sRGB
export type Oklch = { l: number; c: number; h: number };

export function hexToRgb(hex: string | null | undefined): Rgb | null {
  if (!hex) return null;
  const value = hex.trim().replace(/^#/, '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function rgbToOklch([r, g, b]: Rgb): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const c = Math.sqrt(A * A + B * B);
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

function oklchToLinear({ l: L, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180;
  const A = c * Math.cos(rad);
  const B = c * Math.sin(rad);

  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** Converts to sRGB, lowering chroma (never lightness or hue) until it fits. */
export function oklchToRgb(color: Oklch): Rgb {
  const target = { ...color, l: Math.min(1, Math.max(0, color.l)) };
  let linear = oklchToLinear(target);

  if (!inGamut(linear)) {
    let lo = 0;
    let hi = target.c;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...target, c: mid }))) lo = mid;
      else hi = mid;
    }
    linear = oklchToLinear({ ...target, c: lo });
  }

  return linear.map((v) => toGamma(Math.min(1, Math.max(0, v)))) as Rgb;
}

/** `h s% l%` triplet for `hsl(var(--token))` in the Tailwind config. */
export function rgbToHslTriplet([r, g, b]: Rgb): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }

  return `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2 contrast ratio between two sRGB colors. */
export function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Moves `color` lightness in `direction` until it reaches `ratio` contrast
 * against `against`. Returns the color unchanged when it already passes.
 */
export function ensureContrast(
  color: Oklch,
  against: Rgb,
  ratio: number,
  direction: 'darker' | 'lighter'
): Oklch {
  let next = color;
  const step = direction === 'darker' ? -0.01 : 0.01;
  for (let i = 0; i < 100; i++) {
    if (contrast(oklchToRgb(next), against) >= ratio) return next;
    const l = next.l + step;
    if (l < 0 || l > 1) break;
    next = { ...next, l };
  }
  return next;
}
