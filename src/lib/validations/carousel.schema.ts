import { z } from 'zod';

export const carouselSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  slug: z
    .string()
    .max(100, 'El slug no puede tener más de 100 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido (solo letras minúsculas, números y guiones)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .nullable()
    .optional(),
  type: z.enum(['manual', 'category']).default('manual'),
  categoryId: z
    .string()
    .uuid('Categoría inválida')
    .nullable()
    .optional()
    .or(z.literal('')),
  maxProducts: z
    .number()
    .min(1, 'Mínimo 1 producto')
    .max(50, 'Máximo 50 productos')
    .default(10),
  isActive: z.boolean().default(true),
});

export type CarouselFormData = z.infer<typeof carouselSchema>;

// Transform form data for API submission. An empty description is left out
// on create (the API rejects null there) and sent as null on update to clear it.
export function transformCarouselFormData(
  data: CarouselFormData,
  { isUpdate = false }: { isUpdate?: boolean } = {}
) {
  const description = data.description?.trim();
  return {
    ...data,
    slug: data.slug || undefined,
    description: description || (isUpdate ? null : undefined),
    categoryId: data.type === 'category' ? data.categoryId || null : null,
  };
}
