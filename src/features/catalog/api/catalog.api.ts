import { api } from '@/lib/axios';
import type { Product } from '@/features/products/types';
import type { CatalogSummary, EvaluationSummary, PublicationIssue, PublicationStatus } from '../types';

export type CatalogProductsParams = {
  page?: number;
  limit?: number;
  publicationStatus?: PublicationStatus;
  issue?: PublicationIssue;
  sortBy?: 'name' | 'createdAt' | 'random';
  sortOrder?: 'asc' | 'desc';
};

// GET /api/products returns { data, meta }
export type CatalogProductsResponse = {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export const catalogApi = {
  getSummary: async (): Promise<{ data: CatalogSummary }> => {
    const { data } = await api.get('/api/catalog/summary');
    return data;
  },

  evaluate: async (): Promise<{ data: EvaluationSummary }> => {
    const { data } = await api.post('/api/catalog/evaluate');
    return data;
  },

  getProducts: async (params: CatalogProductsParams): Promise<CatalogProductsResponse> => {
    const { data } = await api.get('/api/products', { params });
    return data;
  },
};
