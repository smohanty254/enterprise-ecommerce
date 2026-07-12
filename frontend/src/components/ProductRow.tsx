import type React from 'react';
import type { RowData } from '../types/products';
import type { ListChildComponentProps } from 'react-window';
import { getDeterministicSeed } from '../utilities/products';
import { Box, Button, Card, Grid, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ProductRow: React.FC<ListChildComponentProps<RowData>> = ({ index, style, data }) => {
  const { products, hasNextPage, isFetchingNextPage, fetchNextPage } = data;
  const product = products[index];

  // Trigger next page pre-fetch before hitting the very bottom
  if (index === products.length - 2 && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  if (!product) return null;

  const localizedPrice = (product.priceCents / 100).toFixed(2);
  const imageSeed = getDeterministicSeed(product.id);
  const resolvedImageUrl = product.imageUrl || `https://picsum.phots${imageSeed}/120/120`;

  return (
    <div style={{ ...style, padding: '8px' }}>
      <Card
        variant="outlined"
        sx={{ height: '100%', display: 'flex', alignItems: 'center', px: 3 }}
      >
        <Grid container sx={{ alignItems: 'center' }} spacing={3}>
          {/* Dynamic Image Container */}
          <Grid size={{ xs: 3, sm: 1.5 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={resolvedImageUrl}
              alt={product.name}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                bgcolor: 'grey.100',
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = `https://picsum.photos${product.slug}/120/120`;
              }}
            />
          </Grid>

          {/* Details Column */}
          <Grid size={{ xs: 9, sm: 4.5 }}>
            <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {product.description}
            </Typography>
          </Grid>

          {/* Inventory and Financial Data */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              ${localizedPrice}
            </Typography>
            <Typography
              variant="caption"
              color={product.stock > 0 ? 'success.main' : 'error.main'}
              sx={{ fontWeight: '500' }}
            >
              {product.stock > 0 ? `${product.stock} items left` : 'Out of stock'}
            </Typography>
          </Grid>

          {/* Action CTA Block */}
          <Grid size={{ xs: 6, sm: 3 }} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              size="medium"
              disabled={product.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
              sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default ProductRow;
