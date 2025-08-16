import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';

function EditCategoryModal({ open, category, onClose, onSave }) {
  const [form, setForm] = useState(category || {});

  React.useEffect(() => {
    setForm(category || {});
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!category) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Category</DialogTitle>
      <DialogContent dividers>
        <form id="edit-category-form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Category Name"
              name="category_name"
              value={form.category_name || ''}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Description"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button type="submit" form="edit-category-form" color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditCategoryModal;
