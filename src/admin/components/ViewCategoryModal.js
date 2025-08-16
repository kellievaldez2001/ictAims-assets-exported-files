import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

function ViewCategoryModal({ open, category, onClose }) {
  if (!category) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>View Category</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Category Name</Typography>
          <Typography variant="body1" gutterBottom>{category.category_name || '-'}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Description</Typography>
          <Typography variant="body1" gutterBottom>{category.description || '-'}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Asset Count</Typography>
          <Typography variant="body1" gutterBottom>{category.asset_count != null ? category.asset_count : 0}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Subcategories</Typography>
          <Typography variant="body1" gutterBottom>{Array.isArray(category.subcategories) ? category.subcategories.join(', ') : (category.subcategories || 0)}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Date Created</Typography>
          <Typography variant="body1" gutterBottom>{category.date_created ? (typeof category.date_created === 'string' ? category.date_created.slice(0, 10) : new Date(category.date_created).toLocaleDateString()) : '-'}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewCategoryModal;
