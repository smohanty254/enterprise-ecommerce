import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FixedSizeList as List } from 'react-window';
import AutoSizer, { type Size } from 'react-virtualized-auto-sizer';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { fetchProductsPage } from '../utilities/products';
import type { RowData } from '../types/products';
import ProductRow from '../components/ProductRow';

const Dashboard = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['infinite-products'],
    queryFn: fetchProductsPage,
    getNextPageParam: (lastPage) => lastPage.meta.nextPage ?? undefined,
    initialPageParam: 1,
  });

  const allProducts = data?.pages.flatMap((page) => page.data) || [];

  // Pass component dependencies safely via itemKey callback to maximize virtualization speed
  const getItemKey = useCallback((index: number, data: RowData) => {
    const product = data.products[index];
    return product ? product.id : index;
  }, []);

  if (status === 'pending') {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress aria-label="Loading workspace configurations" />
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        Failed to load production catalog.
      </Alert>
    );
  }

  // Pack variables matching the ItemData criteria safely
  const itemData: RowData = {
    products: allProducts,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };

  return (
    <Box sx={{ py: 4, height: '82vh', display: 'flex', flexDirection: 'column' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: '800', letterSpacing: '-0.5px' }}
      >
        Store Products
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          mt: 2,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <AutoSizer>
          {({ height, width }: Size) => (
            <List
              height={height}
              width={width}
              itemCount={allProducts.length}
              itemSize={112}
              itemData={itemData}
              itemKey={getItemKey}
            >
              {ProductRow}
            </List>
          )}
        </AutoSizer>
      </Box>

      {isFetchingNextPage && (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}
          role="alert"
          aria-busy="true"
        >
          <CircularProgress size={20} sx={{ mr: 1.5 }} />
          <Typography variant="body2" color="text.secondary">
            Fetching more items...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
