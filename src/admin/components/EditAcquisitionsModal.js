import React, { useState, useEffect } from 'react';
import '../pages/pages_styles/assets.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';

function EditAcquisitionsModal({ open, onClose, onSubmit, initialAcquisition }) {
  const [form, setForm] = useState({
    asset_name: '',
    supplier: '',
    category: '',
    subcategory: '',
    quantity: '',
    acquisition_date: '',
    remarks: ''
  });

  useEffect(() => {
    if (initialAcquisition) {
      setForm({ ...initialAcquisition });
    }
  }, [initialAcquisition]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Asset Acquisition</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            margin="dense"
            label="Asset Name"
            name="asset_name"
            value={form.asset_name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Supplier"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Subcategory"
            name="subcategory"
            value={form.subcategory}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Acquisition Date"
            name="acquisition_date"
            type="date"
            value={
              form.acquisition_date
                ? (typeof form.acquisition_date === 'string'
                    ? form.acquisition_date.slice(0, 10)
                    : form.acquisition_date instanceof Date
                      ? form.acquisition_date.toISOString().slice(0, 10)
                      : '')
                : ''
            }
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            margin="dense"
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          <Button type="submit" color="primary" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditAcquisitionsModal;
