import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useBrand, useIsDark } from '../hooks';
import { usePanelThemeStore } from '../store';
import { buildTheme } from '../theme';

/**
 * Paints the panel in the store's palette. Renders nothing: it writes the
 * color tokens on <html>, toggles dark mode and keeps the tab title and
 * favicon on brand.
 */
export function PanelThemeSync() {
  const brand = useBrand();
  const isDark = useIsDark();
  const accentSource = usePanelThemeStore((s) => s.accentSource);
  const sidebarStyle = usePanelThemeStore((s) => s.sidebarStyle);
  const setBrand = usePanelThemeStore((s) => s.setBrand);

  const { primary, secondary, accent } = brand.palette;
  const tokens = useMemo(
    () =>
      buildTheme({
        palette: { primary, secondary, accent },
        accentSource,
        sidebarStyle,
        dark: isDark,
      }),
    [primary, secondary, accent, accentSource, sidebarStyle, isDark]
  );

  // Before paint, so a reload never flashes the wrong colors.
  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(tokens)) {
      root.style.setProperty(name, value);
    }
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [tokens, isDark]);

  const { storeName, headerLogoUrl, footerLogoUrl, faviconUrl, isLive } = brand;

  useEffect(() => {
    if (!isLive) return;
    setBrand({
      storeName,
      headerLogoUrl,
      footerLogoUrl,
      faviconUrl,
      palette: { primary, secondary, accent },
    });
  }, [isLive, storeName, headerLogoUrl, footerLogoUrl, faviconUrl, primary, secondary, accent, setBrand]);

  useEffect(() => {
    document.title = `${storeName} · Administración`;
  }, [storeName]);

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!faviconUrl) {
      link?.remove();
      return;
    }
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);

  return null;
}
