import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function AddCategoryModal({ open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    onSave({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <h2>Add Category</h2>
        <TextField
          label="Category Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={handleClose} style={{ marginRight: 8 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Add</Button>
        </Box>
      </Box>
    </Modal>
  );
}
