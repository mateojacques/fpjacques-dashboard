import {
  contrast,
  ensureContrast,
  hexToRgb,
  oklchToRgb,
  rgbToHslTriplet,
  rgbToOklch,
  type Oklch,
  type Rgb,
} from './color';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentSource = 'primary' | 'secondary' | 'accent';
export type SidebarStyle = 'neutral' | 'brand';

export type BrandPalette = {
  primary: string;
  secondary: string;
  accent: string;
};

// Same fallback the storefront uses when its config can't be loaded.
export const FALLBACK_PALETTE: BrandPalette = {
  primary: '#4a90d9',
  secondary: '#2c5282',
  accent: '#ed8936',
};

export type ThemeOptions = {
  palette: BrandPalette;
  accentSource: AccentSource;
  sidebarStyle: SidebarStyle;
  dark: boolean;
};

export type ThemeTokens = Record<string, string>;

const WHITE: Rgb = [1, 1, 1];
const TEXT_RATIO = 4.5;

const triplet = (color: Oklch) => rgbToHslTriplet(oklchToRgb(color));

function brandColor(palette: BrandPalette, source: AccentSource): Oklch {
  const rgb = hexToRgb(palette[source]) ?? hexToRgb(FALLBACK_PALETTE[source])!;
  return rgbToOklch(rgb);
}

/**
 * A filled surface in the brand color plus a label color that reads on it.
 *
 * Light colors (yellows, pastels) stay exactly as the store set them and get
 * a dark label, like a yellow button on any shop. Other colors keep white
 * labels and are only darkened (or lightened, in dark mode) as much as needed
 * for 3:1 against the page and 4.5:1 for the label.
 */
function filled(color: Oklch, ink: Oklch, page: Oklch, dark: boolean) {
  const inkRgb = oklchToRgb(ink);

  if (!dark && color.l >= 0.8) {
    return { bg: ensureContrast(color, inkRgb, TEXT_RATIO, 'lighter'), fg: ink };
  }

  const base = ensureContrast(color, oklchToRgb(page), 3, dark ? 'lighter' : 'darker');
  if (!dark || contrast(oklchToRgb(base), WHITE) >= TEXT_RATIO) {
    return {
      bg: ensureContrast(base, WHITE, TEXT_RATIO, 'darker'),
      fg: { l: 1, c: 0, h: 0 } as Oklch,
    };
  }
  return { bg: ensureContrast(base, inkRgb, TEXT_RATIO, 'lighter'), fg: ink };
}

/**
 * Builds every color token of the panel from the store palette.
 *
 * Neutrals are tinted a little toward the brand hue so grays belong to the
 * brand instead of reading as stock slate. The brand color itself is spent
 * on actions, focus and the current selection only.
 */
export function buildTheme({ palette, accentSource, sidebarStyle, dark }: ThemeOptions): ThemeTokens {
  const brand = brandColor(palette, accentSource);
  const h = brand.h;
  // Achromatic brands (black, gray) get pure neutrals.
  const tint = brand.c < 0.02 ? 0 : Math.min(brand.c * 0.1, 0.011);
  const n = (l: number, k = 1): Oklch => ({ l, c: tint * k, h });

  const destructiveBase: Oklch = { l: dark ? 0.62 : 0.55, c: 0.2, h: 27 };

  if (!dark) {
    const ink = n(0.21, 1.6);
    const background = n(0.985, 0.5);
    const primary = filled(brand, ink, background, false);
    const destructive = filled(destructiveBase, ink, background, false);

    const selection: Oklch = { l: 0.94, c: Math.min(brand.c, 0.2) * 0.28, h };
    const selectionText = ensureContrast(
      { l: Math.min(brand.l, 0.5), c: brand.c, h },
      oklchToRgb(selection),
      TEXT_RATIO,
      'darker'
    );

    const sidebar =
      sidebarStyle === 'brand'
        ? brandSidebar(brand, 0.3)
        : {
            background: triplet(n(0.965, 1.2)),
            foreground: triplet(n(0.3, 1.6)),
            muted: triplet(n(0.47, 1.4)),
            border: triplet(n(0.91, 1.2)),
            hover: triplet(n(0.93, 1.4)),
            accent: triplet(selection),
            accentForeground: triplet(selectionText),
          };

    return tokens({
      background: triplet(background),
      foreground: triplet(ink),
      card: triplet({ l: 1, c: 0, h }),
      muted: triplet(n(0.955)),
      mutedForeground: triplet(n(0.47, 1.4)),
      subtle: triplet(n(0.95)),
      border: triplet(n(0.905, 1.2)),
      input: triplet(n(0.86, 1.2)),
      primary: triplet(primary.bg),
      primaryForeground: triplet(primary.fg),
      selection: triplet(selection),
      selectionForeground: triplet(selectionText),
      destructive: triplet(destructive.bg),
      destructiveForeground: triplet(destructive.fg),
      ring: triplet(primary.bg),
      sidebar,
    });
  }

  const ink = n(0.19, 1);
  const background = n(0.185, 1.1);
  const primary = filled(
    { ...brand, l: Math.min(Math.max(brand.l, 0.66), 0.84) },
    ink,
    background,
    true
  );
  const destructive = filled(destructiveBase, ink, background, true);

  const selection: Oklch = { l: 0.3, c: Math.min(brand.c, 0.2) * 0.45, h };
  const selectionText = ensureContrast(
    { l: Math.max(brand.l, 0.8), c: Math.min(brand.c, 0.12), h },
    oklchToRgb(selection),
    TEXT_RATIO,
    'lighter'
  );

  const sidebar =
    sidebarStyle === 'brand'
      ? brandSidebar(brand, 0.24)
      : {
          background: triplet(n(0.16, 1.1)),
          foreground: triplet(n(0.86, 0.8)),
          muted: triplet(n(0.68, 0.8)),
          border: triplet(n(0.25, 1.1)),
          hover: triplet(n(0.23, 1.2)),
          accent: triplet(selection),
          accentForeground: triplet(selectionText),
        };

  return tokens({
    background: triplet(background),
    foreground: triplet(n(0.95, 0.5)),
    card: triplet(n(0.215, 1.1)),
    muted: triplet(n(0.25, 1.1)),
    mutedForeground: triplet(n(0.72, 0.8)),
    subtle: triplet(n(0.26, 1.1)),
    border: triplet(n(0.3, 1.1)),
    input: triplet(n(0.36, 1.1)),
    primary: triplet(primary.bg),
    primaryForeground: triplet(primary.fg),
    selection: triplet(selection),
    selectionForeground: triplet(selectionText),
    destructive: triplet(destructive.bg),
    destructiveForeground: triplet(destructive.fg),
    ring: triplet(primary.bg),
    sidebar,
  });
}

/** A sidebar drenched in a deep shade of the brand color. */
function brandSidebar(brand: Oklch, depth: number) {
  const h = brand.h;
  const c = Math.min(brand.c, 0.11);
  const background: Oklch = { l: depth, c, h };
  const bgRgb = oklchToRgb(background);
  const foreground = ensureContrast({ l: 0.92, c: c * 0.25, h }, bgRgb, 7, 'lighter');
  const muted = ensureContrast({ l: 0.76, c: c * 0.35, h }, bgRgb, TEXT_RATIO, 'lighter');
  const selection: Oklch = { l: depth + 0.1, c: Math.min(c * 1.2, 0.14), h };

  return {
    background: triplet(background),
    foreground: triplet(foreground),
    muted: triplet(muted),
    border: triplet({ l: depth + 0.06, c, h }),
    hover: triplet({ l: depth + 0.05, c, h }),
    accent: triplet(selection),
    accentForeground: triplet({ l: 0.99, c: 0, h }),
  };
}

type TokenInput = {
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  subtle: string;
  border: string;
  input: string;
  primary: string;
  primaryForeground: string;
  selection: string;
  selectionForeground: string;
  destructive: string;
  destructiveForeground: string;
  ring: string;
  sidebar: {
    background: string;
    foreground: string;
    muted: string;
    border: string;
    hover: string;
    accent: string;
    accentForeground: string;
  };
};

function tokens(t: TokenInput): ThemeTokens {
  return {
    '--background': t.background,
    '--foreground': t.foreground,
    '--card': t.card,
    '--card-foreground': t.foreground,
    '--popover': t.card,
    '--popover-foreground': t.foreground,
    '--primary': t.primary,
    '--primary-foreground': t.primaryForeground,
    '--secondary': t.subtle,
    '--secondary-foreground': t.foreground,
    '--muted': t.muted,
    '--muted-foreground': t.mutedForeground,
    '--accent': t.subtle,
    '--accent-foreground': t.foreground,
    '--selection': t.selection,
    '--selection-foreground': t.selectionForeground,
    '--destructive': t.destructive,
    '--destructive-foreground': t.destructiveForeground,
    '--border': t.border,
    '--input': t.input,
    '--ring': t.ring,
    '--sidebar-background': t.sidebar.background,
    '--sidebar-foreground': t.sidebar.foreground,
    '--sidebar-muted': t.sidebar.muted,
    '--sidebar-primary': t.primary,
    '--sidebar-primary-foreground': t.primaryForeground,
    '--sidebar-accent': t.sidebar.accent,
    '--sidebar-accent-foreground': t.sidebar.accentForeground,
    '--sidebar-hover': t.sidebar.hover,
    '--sidebar-border': t.sidebar.border,
    '--sidebar-ring': t.ring,
  };
}
