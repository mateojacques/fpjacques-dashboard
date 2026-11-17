import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDateTime, formatPrice, truncate } from '@/lib/utils';
import type { Product } from '@/features/products/types';
import {
  useCatalogProducts,
  useCatalogSample,
  useCatalogSummary,
  useEvaluateCatalog,
} from '../api/catalog.queries';
import { ISSUE_LABELS } from '../issue-labels';
import { PUBLICATION_ISSUES, type PublicationIssue } from '../types';

function formatCount(value: number): string {
  return value.toLocaleString('es-AR');
}

function IssueBadges({ issues }: { issues: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {issues.map((issue) => (
        <Badge key={issue} variant="outline">
          {ISSUE_LABELS[issue as PublicationIssue] ?? issue}
        </Badge>
      ))}
    </div>
  );
}

function PendingTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No hay productos pendientes.</p>;
  }
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Código de proveedor</TableHead>
            <TableHead>Motivos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-sm">
                <Link to={`/products/${product.id}`} className="hover:underline">
                  {product.sku}
                </Link>
              </TableCell>
              <TableCell>{truncate(product.name, 60)}</TableCell>
              <TableCell className="font-mono text-sm">{product.supplierCode ?? '-'}</TableCell>
              <TableCell>
                <IssueBadges issues={product.publicationIssues} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SampleTable({ products }: { products: Product[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.thumbnailUrl || product.imageUrl ? (
                  <img
                    src={product.thumbnailUrl || product.imageUrl || ''}
                    alt={product.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    Sin img
                  </div>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm">
                <Link to={`/products/${product.id}`} className="hover:underline">
                  {product.sku}
                </Link>
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {product.category ? (
                  <Badge variant="outline">{product.category.name}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">{formatPrice(product.regularPrice)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CatalogPage() {
  const [issue, setIssue] = useState<PublicationIssue | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sampleDraw, setSampleDraw] = useState(0);

  const summary = useCatalogSummary();
  const pending = useCatalogProducts({
    publicationStatus: 'pending',
    issue,
    page,
    limit,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const sample = useCatalogSample(sampleDraw);
  const evaluate = useEvaluateCatalog();

  const handleEvaluate = async () => {
    try {
      const { data } = await evaluate.mutateAsync();
      toast.success(
        `Publicación evaluada: ${formatCount(data.published)} publicados, ${formatCount(data.pending)} pendientes.`
      );
    } catch {
      toast.error('No se pudo evaluar el catálogo.');
    }
  };

  const selectIssue = (value: PublicationIssue | undefined) => {
    setIssue(value);
    setPage(1);
  };

  const counts = summary.data?.data;

  return (
    <PageContainer
      title="Estado de publicación"
      description="Qué productos se muestran en la tienda y, para los que no, qué les falta."
      action={
        <Button onClick={handleEvaluate} disabled={evaluate.isPending}>
          {evaluate.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Volver a evaluar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Totals */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Publicados</CardDescription>
              <CardTitle className="text-3xl">
                {counts ? formatCount(counts.published) : '-'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className="text-3xl">
                {counts ? formatCount(counts.pending) : '-'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Último cambio de estado</CardDescription>
              <CardTitle className="text-xl">
                {counts?.lastCheckedAt ? formatDateTime(counts.lastCheckedAt) : 'Sin evaluar'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pending products by issue */}
        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>
              Un producto puede tener varios motivos. Elija uno para filtrar la lista.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={issue === undefined ? 'default' : 'outline'}
                onClick={() => selectIssue(undefined)}
              >
                Todos
              </Button>
              {PUBLICATION_ISSUES.map((code) => (
                <Button
                  key={code}
                  size="sm"
                  variant={issue === code ? 'default' : 'outline'}
                  onClick={() => selectIssue(code)}
                >
                  {ISSUE_LABELS[code]}
                  <span
                    className={cn(
                      'ml-2 font-mono text-xs',
                      issue === code ? 'opacity-80' : 'text-muted-foreground'
                    )}
                  >
                    {counts ? formatCount(counts.issues[code]) : '-'}
                  </span>
                </Button>
              ))}
            </div>

            {pending.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <PendingTable products={pending.data?.data ?? []} />
            )}

            {pending.data && pending.data.meta.totalPages > 0 && (
              <Pagination
                page={pending.data.meta.page}
                totalPages={pending.data.meta.totalPages}
                totalItems={pending.data.meta.total}
                limit={pending.data.meta.limit}
                onPageChange={setPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Random sample for the manual review */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Muestra de 100</CardTitle>
              <CardDescription>
                100 productos publicados elegidos al azar, para la revisión manual.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setSampleDraw((draw) => draw + 1)}
              disabled={sample.isFetching}
            >
              {sample.isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Dices className="mr-2 h-4 w-4" />
              )}
              {sampleDraw === 0 ? 'Sacar muestra' : 'Sacar otra muestra'}
            </Button>
          </CardHeader>
          {sample.data && (
            <CardContent>
              <SampleTable products={sample.data.data} />
            </CardContent>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
