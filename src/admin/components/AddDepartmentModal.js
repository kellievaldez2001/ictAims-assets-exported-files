
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';


const AddDepartmentModal = ({ open, onClose, onAdd }) => {
  const [deptName, setDeptName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) {
      setDeptName('');
      setDescription('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (deptName.trim() && description.trim()) {
      onAdd({ name: deptName.trim(), description: description.trim() });
      setDeptName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Department</DialogTitle>
      <DialogContent dividers>
        <form id="add-department-form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Department Name"
              name="department_name"
              value={deptName}
              onChange={e => setDeptName(e.target.value)}
              fullWidth
              required
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Description"
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              required
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button type="submit" form="add-department-form" color="primary" variant="contained" disabled={!deptName.trim() || !description.trim()}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDepartmentModal;
