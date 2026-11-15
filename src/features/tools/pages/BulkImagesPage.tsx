import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageBankUploader } from '../components/ImageBankUploader';
import { ImportJobsTable } from '../components/ImportJobsTable';
import { useImportJobs, useCancelImportJob } from '../api/imports.queries';

export function BulkImagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'actualizar';

  const { data, isLoading } = useImportJobs({ limit: 20 });
  const cancelJob = useCancelImportJob();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleUploadStarted = (jobId: string) => {
    // Navigate to the job detail page
    navigate(`/herramientas/importaciones/${jobId}`);
  };

  const handleCancelJob = async (id: string) => {
    try {
      await cancelJob.mutateAsync(id);
      toast.success('Importación cancelada');
    } catch {
      toast.error('No se pudo cancelar la importación');
    }
  };

  return (
    <PageContainer
      title="Banco de imágenes"
      description="Archivo JSON exportado del banco de imágenes de Bariloche. Las fotos se copian al sitio y se asignan por código de proveedor."
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="actualizar">Subir archivo</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="actualizar" className="mt-6">
          <ImageBankUploader onUploadStarted={handleUploadStarted} />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <ImportJobsTable
            jobs={data?.data.items ?? []}
            isLoading={isLoading}
            onCancelJob={handleCancelJob}
            isCancelling={cancelJob.isPending}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
