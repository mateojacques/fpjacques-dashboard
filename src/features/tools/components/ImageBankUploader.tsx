import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileJson, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, getApiErrorCode } from '@/lib/utils';
import { useUploadImageBank } from '../api/imports.queries';

const MAX_SIZE = 20 * 1024 * 1024;

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_FILE_TYPE: 'Solo se permiten archivos JSON.',
  FILE_TOO_LARGE: 'El archivo no puede superar los 20 MB.',
  FILE_REQUIRED: 'Seleccione un archivo.',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

type ImageBankUploaderProps = {
  onUploadStarted?: (jobId: string) => void;
};

export function ImageBankUploader({ onUploadStarted }: ImageBankUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadImageBank = useUploadImageBank();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(ERROR_MESSAGES.FILE_TOO_LARGE);
      return;
    }
    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    disabled: uploadImageBank.isPending,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const result = await uploadImageBank.mutateAsync(selectedFile);
      toast.success('Banco de imágenes recibido. Las fotos se copian en segundo plano.');
      setSelectedFile(null);
      onUploadStarted?.(result.data.id);
    } catch (error) {
      const { code } = getApiErrorCode(error);
      toast.error((code && ERROR_MESSAGES[code]) || 'No se pudo subir el banco de imágenes.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir banco de imágenes
        </CardTitle>
        <CardDescription>
          Las fotos se asignan a los productos de Bariloche por código de proveedor. Al terminar,
          el catálogo se vuelve a evaluar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50',
              uploadImageBank.isPending && 'pointer-events-none opacity-50'
            )}
          >
            <input {...getInputProps()} />
            <FileJson className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Suelte el archivo aquí</p>
            ) : (
              <>
                <p className="font-medium">
                  Arrastre el archivo JSON aquí o haga clic para seleccionarlo
                </p>
                <p className="text-sm text-muted-foreground mt-1">Máximo 20 MB</p>
              </>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileJson className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
                disabled={uploadImageBank.isPending}
                aria-label="Quitar archivo"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {uploadImageBank.isPending && <Progress value={undefined} className="h-2" />}
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={uploadImageBank.isPending}>
                {uploadImageBank.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir banco de imágenes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 text-muted-foreground">
          <p>
            Cada elemento del archivo necesita <code>sku</code> (código de Bariloche),{' '}
            <code>title</code> e <code>image_urls</code>. Se usa la primera URL de imagen. Los
            elementos sin código o sin imagen se omiten.
          </p>
          <p>
            Volver a subir el archivo solo descarga las fotos que todavía no se copiaron o que
            cambiaron. Una foto subida a mano en un producto nunca se reemplaza.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
