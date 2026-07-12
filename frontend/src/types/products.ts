// Interface tailored directly to TypeORM definition
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  active: boolean;
}

export interface PaginatedBackendResponse {
  data: Product[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    nextPage: number | null; // Pointer value used to calculate next offsets
  };
}

export interface RowData {
  products: Product[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}
