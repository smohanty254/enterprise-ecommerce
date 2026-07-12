import { api } from '../api/axios';
import type { PaginatedBackendResponse } from '../types/products';

// Fetch Utility
export const fetchProductsPage = async ({ pageParam = 1 }): Promise<PaginatedBackendResponse> => {
  const { data } = await api.get(`/products?page=${pageParam}&limit=15`);
  return data;
};

// Deterministic Image Hash Utility
export const getDeterministicSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 1000);
};
