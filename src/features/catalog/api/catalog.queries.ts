import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/features/products/api/products.queries';
import { catalogApi, type CatalogProductsParams } from './catalog.api';

export const catalogKeys = {
  all: ['catalog'] as const,
  summary: () => [...catalogKeys.all, 'summary'] as const,
  products: (params: CatalogProductsParams) => [...catalogKeys.all, 'products', params] as const,
  sample: (draw: number) => [...catalogKeys.all, 'sample', draw] as const,
};

export function useCatalogSummary() {
  return useQuery({
    queryKey: catalogKeys.summary(),
    queryFn: () => catalogApi.getSummary(),
  });
}

export function useCatalogProducts(params: CatalogProductsParams) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.getProducts(params),
    placeholderData: keepPreviousData,
  });
}

// 100 random published products for the owner's manual review. Each draw is a new key.
export function useCatalogSample(draw: number) {
  return useQuery({
    queryKey: catalogKeys.sample(draw),
    queryFn: () =>
      catalogApi.getProducts({ publicationStatus: 'published', sortBy: 'random', limit: 100 }),
    enabled: draw > 0,
    staleTime: Infinity,
  });
}

export function useEvaluateCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => catalogApi.evaluate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
