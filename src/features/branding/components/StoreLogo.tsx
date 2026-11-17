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

// Same proportions as the storefront header box, so the logo crops identically.
const boxes = {
  sm: 'h-10 w-[114px]',
  md: 'h-[56px] w-[160px]',
  lg: 'h-[72px] w-[206px]',
};

/**
 * The store's own logo, as uploaded in Apariencia › Marca. Without one, the
 * store name is set as a wordmark, exactly as the storefront does.
 */
export function StoreLogo({ onDark = false, size = 'md', className }: StoreLogoProps) {
  const { storeName, headerLogoUrl, footerLogoUrl, isLoading } = useBrand();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const url = onDark ? (footerLogoUrl ?? headerLogoUrl) : headerLogoUrl;

  if (isLoading) {
    return <Skeleton className={cn(boxes[size], className)} />;
  }

  if (url && url !== failedUrl) {
    return (
      <img
        src={url}
        alt={storeName}
        className={cn(boxes[size], 'shrink-0 object-cover object-center', className)}
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
