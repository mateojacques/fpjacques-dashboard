import { useSyncExternalStore } from 'react';
import { useStorefrontConfig } from '@/features/storefront-config/api/storefront-config.queries';
import { usePanelThemeStore, type CachedBrand } from './store';
import { FALLBACK_PALETTE } from './theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToScheme(callback: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

/** Whether the panel renders dark, resolving "system" against the OS. */
export function useIsDark(): boolean {
  const mode = usePanelThemeStore((s) => s.mode);
  const systemDark = useSyncExternalStore(
    subscribeToScheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false
  );
  return mode === 'dark' || (mode === 'system' && systemDark);
}

export type Brand = CachedBrand & {
  isLoading: boolean;
  /** True once the live config arrived (not the cached copy). */
  isLive: boolean;
};

/**
 * The store's branding as configured in Apariencia, falling back to the last
 * copy cached on this device while the config loads.
 */
export function useBrand(): Brand {
  const { data, isLoading } = useStorefrontConfig();
  const cached = usePanelThemeStore((s) => s.brand);
  const config = data?.data;

  if (config) {
    return {
      storeName: config.branding.storeName,
      headerLogoUrl: config.branding.headerLogoUrl || null,
      footerLogoUrl: config.branding.footerLogoUrl || null,
      faviconUrl: config.branding.faviconUrl || null,
      palette: {
        primary: config.colors.primary,
        secondary: config.colors.secondary,
        accent: config.colors.accent,
      },
      isLoading: false,
      isLive: true,
    };
  }

  return {
    storeName: cached?.storeName ?? 'FP Jacques',
    headerLogoUrl: cached?.headerLogoUrl ?? null,
    footerLogoUrl: cached?.footerLogoUrl ?? null,
    faviconUrl: cached?.faviconUrl ?? null,
    palette: cached?.palette ?? FALLBACK_PALETTE,
    isLoading: isLoading && !cached,
    isLive: false,
  };
}
