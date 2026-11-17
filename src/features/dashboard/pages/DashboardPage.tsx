import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight, FolderTree, Images, Package, Plus, type LucideIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useMetricsOverview } from '../api/metrics.queries';
import { DateRangeFilter } from '../components/DateRangeFilter';
import type { MetricsParams } from '../types';

type Shortcut = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const shortcuts: Shortcut[] = [
  {
    title: 'Nuevo producto',
    description: 'Agrega un producto al catálogo.',
    href: ROUTES.PRODUCT_CREATE,
    icon: Plus,
  },
  {
    title: 'Catálogo',
    description: 'Busca, edita o elimina productos.',
    href: ROUTES.PRODUCTS,
    icon: Package,
  },
  {
    title: 'Categorías',
    description: 'Ordena el árbol de categorías de la tienda.',
    href: ROUTES.CATEGORIES,
    icon: FolderTree,
  },
  {
    title: 'Carruseles',
    description: 'Elige los productos destacados de la portada.',
    href: ROUTES.CAROUSELS,
    icon: Images,
  },
];

const formatNumber = (n: number) => n.toLocaleString('es-AR');

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type StatProps = {
  label: string;
  value: string;
  detail: string;
  href: string;
  isLoading: boolean;
};

function Stat({ label, value, detail, href, isLoading }: StatProps) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-1 bg-card px-5 py-4 outline-none transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <dt className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      </dt>
      {isLoading ? (
        <dd className="space-y-2 pt-1">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3.5 w-28" />
        </dd>
      ) : (
        <>
          <dd className="text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
          <dd className="text-xs text-muted-foreground">{detail}</dd>
        </>
      )}
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [metricsParams, setMetricsParams] = useState<MetricsParams>({});
  const { data, isLoading, isError, error } = useMetricsOverview(metricsParams);

  const metrics = data?.data;
  const inRange = Boolean(metricsParams.startDate || metricsParams.endDate);
  const firstName = user?.fullName?.split(' ')[0];

  return (
    <PageContainer
      title={firstName ? `Hola, ${firstName}` : 'Inicio'}
      description={capitalize(format(new Date(), "EEEE d 'de' MMMM", { locale: es }))}
    >
      <div className="space-y-10">
        <section aria-labelledby="summary-heading" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="summary-heading" className="text-base font-semibold">
              Resumen
            </h2>
            <DateRangeFilter onChange={setMetricsParams} isLoading={isLoading} />
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertDescription>
                No se pudieron cargar las métricas.{' '}
                {error instanceof Error ? error.message : ''}
              </AlertDescription>
            </Alert>
          )}

          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
            <Stat
              label="Productos"
              value={metrics ? formatNumber(metrics.totalProducts) : '—'}
              detail={inRange ? 'creados en el período' : 'en el catálogo'}
              href={ROUTES.PRODUCTS}
              isLoading={isLoading}
            />
            <Stat
              label="Categorías"
              value={metrics ? formatNumber(metrics.totalCategories) : '—'}
              detail={inRange ? 'creadas en el período' : 'activas'}
              href={ROUTES.CATEGORIES}
              isLoading={isLoading}
            />
            <Stat
              label="Órdenes"
              value={metrics ? formatNumber(metrics.totalOrders) : '—'}
              detail={inRange ? 'recibidas en el período' : 'recibidas en total'}
              href={ROUTES.ORDERS}
              isLoading={isLoading}
            />
          </dl>
        </section>

        <section aria-labelledby="shortcuts-heading" className="space-y-3">
          <h2 id="shortcuts-heading" className="text-base font-semibold">
            Atajos
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-2">
            {shortcuts.map((item, index) => (
              <li key={item.href} className="bg-card">
                <Link
                  to={item.href}
                  className="group flex h-full items-center gap-4 px-5 py-4 outline-none transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                      index === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="block text-sm text-muted-foreground">{item.description}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageContainer>
  );
}
