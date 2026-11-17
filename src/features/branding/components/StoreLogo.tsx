import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useBrand } from '../hooks';

type StoreLogoProps = {
  /** The logo sits on a dark surface: prefer the footer logo, made for dark backgrounds. */
  onDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/** Bundled logo, used when no logo was uploaded in Apariencia › Marca. */
export const DEFAULT_LOGO_URL = '/logo.jpg';

// Same proportions as the storefront header box, so the logo crops identically.
const boxes = {
  sm: 'h-10 w-[114px]',
  md: 'h-[56px] w-[160px]',
  lg: 'h-[72px] w-[206px]',
};

// The bundled logo is square: same height, square box.
const squareBoxes = {
  sm: 'size-10 rounded-md',
  md: 'size-[56px] rounded-md',
  lg: 'size-[72px] rounded-lg',
};

/**
 * The store's own logo, as uploaded in Apariencia › Marca. Without one, the
 * bundled logo is shown; if an image fails to load, the store name is set as
 * a wordmark.
 */
export function StoreLogo({ onDark = false, size = 'md', className }: StoreLogoProps) {
  const { storeName, headerLogoUrl, footerLogoUrl, isLoading } = useBrand();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const configuredUrl = onDark ? (footerLogoUrl ?? headerLogoUrl) : headerLogoUrl;
  const url = configuredUrl ?? DEFAULT_LOGO_URL;

  if (isLoading) {
    return <Skeleton className={cn(boxes[size], className)} />;
  }

  if (url && url !== failedUrl) {
    return (
      <img
        src={url}
        alt={storeName}
        className={cn(
          configuredUrl ? boxes[size] : squareBoxes[size],
          'block shrink-0 object-cover object-center',
          className
        )}
        onError={() => setFailedUrl(url)}
      />
    );
  }

  return (
    <span
      className={cn(
        'block truncate font-semibold tracking-tight',
        { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }[size],
        className
      )}
    >
      {storeName}
    </span>
  );
}
