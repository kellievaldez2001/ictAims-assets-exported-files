import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';


const EditDepartmentModal = ({ open, onClose, department, onSave }) => {

  // Department Code = code, Department Name = description
  const [deptCode, setDeptCode] = useState((department && (department.code || department.department_code || department.name)) || '');
  const [deptName, setDeptName] = useState((department && (department.description || department.department_name || department.name)) || '');

  useEffect(() => {
    setDeptCode((department && (department.code || department.department_code || department.name)) || '');
    setDeptName((department && (department.description || department.department_name || department.name)) || '');
  }, [department]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const safeDeptCode = deptCode || '';
    const safeDeptName = deptName || '';
    if (safeDeptCode.trim() && safeDeptName.trim()) {
      onSave({ ...department, code: safeDeptCode.trim(), description: safeDeptName.trim() });
    }
  };

  if (!department) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Department</DialogTitle>
      <DialogContent dividers>
        <form id="edit-department-form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Department Code"
              name="department_code"
              value={deptCode}
              onChange={e => setDeptCode(e.target.value)}
              fullWidth
              required
            />
          </Box>
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
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button type="submit" form="edit-department-form" color="primary" variant="contained" disabled={!deptCode.trim() || !deptName.trim()}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDepartmentModal;
