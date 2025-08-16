
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Box, Avatar } from '@mui/material';

const EditCustodianModal = ({ open, onClose, custodian, onSave, setCustodian }) => {
  if (!open || !custodian) return null;

  const handleChange = (field, value) => {
    setCustodian({ ...custodian, [field]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Custodian</DialogTitle>
      <DialogContent dividers>
        <Box component="form" autoComplete="off" onSubmit={e => { e.preventDefault(); onSave(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="ID No." value={custodian.id_no || custodian.id || ''} InputProps={{ readOnly: true }} fullWidth margin="dense" />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={custodian.image} alt="profile" sx={{ width: 40, height: 40 }} />
            <TextField label="Image URL" value={custodian.image || ''} onChange={e => handleChange('image', e.target.value)} fullWidth margin="dense" />
          </Box>
          <TextField label="Name" required value={custodian.name} onChange={e => handleChange('name', e.target.value)} fullWidth margin="dense" />
          <FormControl fullWidth margin="dense">
            <InputLabel>Position/Designation</InputLabel>
            <Select
              label="Position/Designation"
              value={custodian.position_designation || ''}
              onChange={e => handleChange('position_designation', e.target.value)}
            >
              <MenuItem value="Registrar">Registrar</MenuItem>
              <MenuItem value="Professor">Professor</MenuItem>
              <MenuItem value="Instructor">Instructor</MenuItem>
              <MenuItem value="Clerk">Clerk</MenuItem>
              <MenuItem value="Guidance Counselor">Guidance Counselor</MenuItem>
              <MenuItem value="Administrative Assistant">Administrative Assistant</MenuItem>
              <MenuItem value="Property Custodian">Property Custodian</MenuItem>
              <MenuItem value="IT Support Staff">IT Support Staff</MenuItem>
              <MenuItem value="Human Resources Officer">Human Resources Officer</MenuItem>
              <MenuItem value="Supply Officer">Supply Officer</MenuItem>
              <MenuItem value="Librarian">Librarian</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Account Type</InputLabel>
            <Select label="Account Type" value={custodian.account_type || ''} onChange={e => handleChange('account_type', e.target.value)}>
              <MenuItem value="Viewer">Viewer</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Email" type="email" required value={custodian.email} onChange={e => handleChange('email', e.target.value)} fullWidth margin="dense" />
          <TextField label="Phone #" value={custodian.phone_number || ''} onChange={e => handleChange('phone_number', e.target.value)} fullWidth margin="dense" />
          <FormControl fullWidth margin="dense">
            <InputLabel>User Group</InputLabel>
            <Select label="User Group" value={custodian.user_group || ''} onChange={e => handleChange('user_group', e.target.value)}>
              <MenuItem value="Administrative Staff">Administrative Staff</MenuItem>
              <MenuItem value="Non-Teaching Staff">Non-Teaching Staff</MenuItem>
              <MenuItem value="Teaching Staff">Teaching Staff</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Department" value={custodian.department || ''} onChange={e => handleChange('department', e.target.value)} fullWidth margin="dense" />
          <FormControl fullWidth margin="dense">
            <InputLabel>Employment Status</InputLabel>
            <Select label="Employment Status" value={custodian.employment_status || ''} onChange={e => handleChange('employment_status', e.target.value)}>
              <MenuItem value="In-service">In-service</MenuItem>
              <MenuItem value="Retired">Retired</MenuItem>
              <MenuItem value="Resigned">Resigned</MenuItem>
              <MenuItem value="Deceased">Deceased</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>System Status</InputLabel>
            <Select label="System Status" value={custodian.system_status || 'Active'} onChange={e => handleChange('system_status', e.target.value)}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="In-use">Inac</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Deactivated">Deactivated</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Date Registered" value={(custodian.date_registered || custodian.created_at) ? (() => {
            try {
              const date = new Date(custodian.date_registered || custodian.created_at);
              return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
            } catch (e) {
              return '';
            }
          })() : ''} InputProps={{ readOnly: true }} fullWidth margin="dense" />
          <TextField label="Description" value={custodian.description || ''} onChange={e => handleChange('description', e.target.value)} fullWidth margin="dense" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={onSave} color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCustodianModal;
