import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ImportProgress } from '../components/ImportProgress';
import { ImportSummaryCard } from '../components/ImportSummaryCard';
import { useImportJob } from '../api/imports.queries';
import type { ImportJobType } from '../types';

// Where each kind of job is started, so "back" returns there.
const origins: Record<ImportJobType, { href: string; label: string }> = {
  csv: { href: ROUTES.IMPORT_ONE_CLICK, label: 'Importación en 1 Click' },
  bulk_images: { href: `${ROUTES.IMAGE_BANK}?tab=historial`, label: 'Banco de imágenes' },
  image_bank: { href: `${ROUTES.IMAGE_BANK}?tab=historial`, label: 'Banco de imágenes' },
};

export function ImportDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data } = useImportJob(id);
  const origin = data ? origins[data.data.type] : null;

  if (!id) {
    return null;
  }

  return (
    <PageContainer
      title="Detalle de la importación"
      description="Progreso y resultado del trabajo de importación."
      action={
        origin && (
          <Button variant="outline" size="sm" asChild>
            <Link to={origin.href}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {origin.label}
            </Link>
          </Button>
        )
      }
    >
      <div className="space-y-6">
        <ImportProgress jobId={id} />
        <ImportSummaryCard jobId={id} />
      </div>
    </PageContainer>
  );
}
