import { cn } from '@/lib/utils';

type PageContainerProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({
  title,
  description,
  action,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8', className)}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>

      {children}
    </div>
  );
}
