import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccentSource, BrandPalette, SidebarStyle, ThemeMode } from './theme';

/** Last store branding seen, so the next load paints in brand colors at once. */
export type CachedBrand = {
  storeName: string;
  headerLogoUrl: string | null;
  footerLogoUrl: string | null;
  faviconUrl: string | null;
  palette: BrandPalette;
};

type PanelThemeState = {
  mode: ThemeMode;
  accentSource: AccentSource;
  sidebarStyle: SidebarStyle;
  brand: CachedBrand | null;
};

type PanelThemeActions = {
  setMode: (mode: ThemeMode) => void;
  setAccentSource: (source: AccentSource) => void;
  setSidebarStyle: (style: SidebarStyle) => void;
  setBrand: (brand: CachedBrand) => void;
  resetPreferences: () => void;
};

export const DEFAULT_PREFERENCES = {
  mode: 'system',
  accentSource: 'primary',
  sidebarStyle: 'neutral',
} as const satisfies Omit<PanelThemeState, 'brand'>;

// Per device: each admin picks how the panel looks on their own screen.
export const usePanelThemeStore = create<PanelThemeState & PanelThemeActions>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      brand: null,

      setMode: (mode) => set({ mode }),
      setAccentSource: (accentSource) => set({ accentSource }),
      setSidebarStyle: (sidebarStyle) => set({ sidebarStyle }),
      setBrand: (brand) => set({ brand }),
      resetPreferences: () => set(DEFAULT_PREFERENCES),
    }),
    { name: 'panel-theme', version: 1 }
  )
);
