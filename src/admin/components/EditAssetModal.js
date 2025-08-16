
import React, { useState, useEffect } from 'react';
import ComboBox from './ComboBox';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { formatDate } from '../../utils/dateUtils';
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };


function EditAssetModal({ open, asset, onClose, onSave, statusOptions, custodians, assets = [] }) {
  // Debug: Log asset object to check date values
  console.log('[EditAssetModal] asset:', asset);

  // Helper to get custodian name from id
  function getCustodianNameById(id) {
    if (!id) return '';
    const found = (custodians || []).find(c => c.id === id);
    return found && found.name ? found.name : '';
  }

  // When opening, set form.custodian to the best available name
  const getInitialForm = () => {
    if (!asset) return {};
    let custodianName = asset.custodian_name || asset.custodian;
    if (!custodianName && asset.custodian_id) {
      custodianName = getCustodianNameById(asset.custodian_id);
    }
    return {
      id: asset.id,
      name: asset.name || asset.asset_name || '',
      asset_name: asset.asset_name || asset.name || '',
      category: asset.category || '',
      subcategory: asset.subcategory || '',
      serial_number: asset.serial_number || '',
      department: asset.department || '',
      status: asset.status || '',
      acquisition_date: asset.acquisition_date || '',
      location: asset.location || '',
      custodian: custodianName || '',
      updated_at: asset.updated_at || '',
      purchase_cost: asset.purchase_cost || '',
      useful_life: asset.useful_life || '',
      depreciation_method: asset.depreciation_method || '',
      annual_depreciation: asset.annual_depreciation || '',
      accumulated_depreciation: asset.accumulated_depreciation || '',
      book_value: asset.book_value || '',
      supplier: asset.supplier || '',
      supplier_contact_person: asset.supplier_contact_person || '',
      supplier_contact_number: asset.supplier_contact_number || '',
      supplier_email: asset.supplier_email || '',
      supplier_address: asset.supplier_address || '',
      document_number: asset.document_number || '',
      date_supplied: asset.date_supplied || '',
      warranty_details: asset.warranty_details || '',
      description: asset.description || '',
      remarks: asset.remarks || ''
    };
  };

  // useState for form must be declared before any code that uses 'form'
  const [form, setForm] = useState(getInitialForm());

  // Helper to ensure date is in YYYY-MM-DD for input type=date, robust for MM-DD-YYYY and DD-MM-YYYY
  function toInputDate(val) {
    if (!val) return '';
    // If already in YYYY-MM-DD, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // If in MM-DD-YYYY or DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      const [a, b, y] = val.split('-');
      // If both a and b <= 12, prefer MM-DD-YYYY (US style)
      if (parseInt(a, 10) <= 12 && parseInt(b, 10) <= 12) {
        // Ambiguous, but default to MM-DD-YYYY
        return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
      } else if (parseInt(a, 10) <= 12) {
        // MM-DD-YYYY
        return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
      } else {
        // DD-MM-YYYY
        return `${y}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
      }
    }
    // If in MM/DD/YYYY or DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      const [a, b, y] = val.split('/');
      // If both a and b <= 12, prefer MM/DD/YYYY
      if (parseInt(a, 10) <= 12 && parseInt(b, 10) <= 12) {
        return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
      } else if (parseInt(a, 10) <= 12) {
        return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
      } else {
        return `${y}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
      }
    }
    // If in ISO string or Date object, extract date part only (no timezone shift)
    if (typeof val === 'string' && val.includes('T')) {
      return val.split('T')[0];
    }
    // Fallback: try to parse as Date, but avoid timezone shift by using the parts directly
    // Only use Date parsing if val is not ambiguous
    // If val is a Date object
    if (val instanceof Date) {
      const yyyy = val.getFullYear();
      const mm = String(val.getMonth() + 1).padStart(2, '0');
      const dd = String(val.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    // If val is a string like '2025-08-11', return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // Otherwise, return empty string to avoid wrong date
    return '';
  }

  // Always convert for input fields before rendering, after form is initialized
  let acquisitionDateInput = '';
  let dateSuppliedInput = '';
  // Only run this logic after form is initialized (inside the component, after useState)
  // Place this logic after the useState hook and before the return statement
  React.useEffect(() => {}, []); // dummy to ensure hooks order
  if (typeof form !== 'undefined' && form && typeof form === 'object') {
    acquisitionDateInput = toInputDate(form.acquisition_date);
    dateSuppliedInput = toInputDate(form.date_supplied);
  }
  useEffect(() => {
    setForm(getInitialForm());
    // eslint-disable-next-line
  }, [asset, custodians]);

  // Get unique main categories and subcategories from assets
  // Use fixed categories as requested
  const mainCategories = [
    'Real Estate',
    'ICT',
    'Furniture and Fixture',
    'Physical Plant and Facilities'
  ];
  const subCategories = Array.from(new Set((assets || []).map(a => a.subcategory || a.category).filter(Boolean)));
  // Depreciation logic
  useEffect(() => {
    const cost = parseFloat(form.purchase_cost) || 0;
    const life = parseFloat(form.useful_life) || 0;
    let annual = 0, accumulated = 0, book = 0;
    if (cost && life) {
      annual = +(cost / life).toFixed(2);
      let years = 0;
      if (form.acquisition_date) {
        const acq = new Date(form.acquisition_date);
        const now = new Date();
        years = now.getFullYear() - acq.getFullYear();
        if (now.getMonth() < acq.getMonth() || (now.getMonth() === acq.getMonth() && now.getDate() < acq.getDate())) years--;
        years = Math.max(0, Math.min(years, life));
      }
      accumulated = +(annual * years).toFixed(2);
      book = +(cost - accumulated).toFixed(2);
    }
    setForm(f => ({ ...f, annual_depreciation: annual, accumulated_depreciation: accumulated, book_value: book < 0 ? 0 : book }));
    // eslint-disable-next-line
  }, [form.purchase_cost, form.useful_life, form.acquisition_date]);

  // Helper to add department if new (mirrors AddAssetModal)
  const departments = Array.from(new Set((assets || []).map(a => a.department).filter(Boolean)));
  const handleChange = async e => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }
    // If department field, check and add new department if needed
    if (name === 'department') {
      setForm(f => ({ ...f, [name]: newValue }));
      if (newValue && !departments.includes(newValue) && newValue !== '__custom__') {
        try {
          if (window.electron && window.electron.ipcRenderer) {
            await window.electron.ipcRenderer.invoke('add-department', newValue);
          } else if (ipcRenderer) {
            await ipcRenderer.invoke('add-department', newValue);
          }
        } catch (err) { /* ignore duplicate or error */ }
      }
      return;
    }
    setForm(f => ({ ...f, [name]: newValue }));
  };

  const handleSave = async () => {
    if (!form.name || !form.serial_number || !form.purchase_cost) {
      alert('Name, Serial Number, and Purchase Cost are required.');
      return;
    }
    let custodian_id = null;
    if (form.custodian && form.custodian.trim() !== '') {
      // Try to find existing custodian by name
      const match = (custodians || []).find(c => (typeof c === 'object' ? c.name : c) === form.custodian);
      if (match && match.id) {
        custodian_id = match.id;
      } else if (ipcRenderer) {
        // Create new custodian and get its id
        try {
          custodian_id = await ipcRenderer.invoke('add-custodian', { name: form.custodian });
        } catch (e) {
          alert('Failed to add new custodian.');
          return;
        }
      }
    }
    // Always use the value from the 'Asset Name' input for asset_name
    const assetToSave = {
      ...form,
      asset_name: form.name || '', // force asset_name to match the input
      custodian_id,
      id: form.id
    };
    onSave(assetToSave);
  };

  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Asset</DialogTitle>
      <DialogContent dividers>
        <form className="assets-form assets-add-scroll-animate" onSubmit={async e => { e.preventDefault(); await handleSave(); }} autoComplete="off">
          <h3>Asset Identification</h3>
          <div className="assets-form-group"><label>Asset Name</label><input name="name" value={form.name||''} onChange={handleChange} required /></div>
          <div className="assets-form-group"><label>Serial Number</label><input name="serial_number" value={form.serial_number||''} onChange={handleChange} required /></div>
          <div className="assets-form-group"><label>Status</label>
            <select name="status" value={form.status||''} onChange={handleChange} className="assets-filter-select">
              <option value="">Select status</option>
              {(statusOptions||[]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="assets-form-group" style={{position:'relative'}}>
            <label>Category</label>
            <select
              name="category"
              value={form.category || ''}
              onChange={handleChange}
              className="assets-filter-select"
            >
              <option value="">Select category</option>
              {mainCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="assets-form-group" style={{position:'relative'}}>
            <label>Sub-Category</label>
            <select
              name="subcategory"
              value={form.subcategory || ''}
              onChange={handleChange}
              className="assets-filter-select"
            >
              <option value="">Select sub-category</option>
              {subCategories.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
          <div className="assets-form-group"><label>Description</label><input name="description" value={form.description||''} onChange={handleChange} /></div>
          <h3>Acquisition & Documentation</h3>
          <div className="assets-form-group"><label>Acquisition Date</label><input name="acquisition_date" type="date" value={acquisitionDateInput} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Document/Receipt Number</label><input name="document_number" value={form.document_number||''} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Date Supplied</label><input name="date_supplied" type="date" value={dateSuppliedInput} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Warranty Details</label><input name="warranty_details" value={form.warranty_details||''} onChange={handleChange} /></div>
          <h3>Assignment & Location</h3>
          <div className="assets-form-group"><label>Department</label><input name="department" value={form.department||''} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Location</label><input name="location" value={form.location||''} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Custodian/In-charge</label>
            <ComboBox
              name="custodian"
              value={form.custodian || ''}
              onChange={handleChange}
              options={(custodians||[])}
              getOptionLabel={c => c && typeof c === 'object' ? `${c.name}${c.email ? ' ('+c.email+')' : ''}` : c}
              getOptionValue={c => c && typeof c === 'object' ? c.name : c}
              placeholder="Select or type custodian"
            />
          </div>
          <h3>Financial Information</h3>
          <div className="assets-form-group"><label>Purchase Cost</label><input name="purchase_cost" type="number" step="0.01" value={form.purchase_cost||''} onChange={handleChange} required /></div>
          <div className="assets-form-group"><label>Useful Life (years)</label><input name="useful_life" type="number" step="1" value={form.useful_life||''} onChange={handleChange} /></div>
          <div style={{fontWeight:700,margin:'16px 0 8px'}}>Depreciation Details</div>
          <div className="assets-form-group"><label>Annual Depreciation</label><input value={form.annual_depreciation||''} readOnly tabIndex={-1} /></div>
          <div className="assets-form-group"><label>Accumulated Depreciation</label><input value={form.accumulated_depreciation||''} readOnly tabIndex={-1} /></div>
          <div className="assets-form-group"><label>Book Value</label><input value={form.book_value||''} readOnly tabIndex={-1} /></div>
          <h3>Supplier Information</h3>
          <div style={{fontWeight:700,margin:'16px 0 8px'}}>Supplier Details</div>
          <div className="assets-form-group"><label>Supplier Name</label><input name="supplier" value={form.supplier||''} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Contact Person</label><input name="supplier_contact_person" value={form.supplier_contact_person||''} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Contact Number</label><input name="supplier_contact_number" value={form.supplier_contact_number||''} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Email Address</label><input name="supplier_email" value={form.supplier_email||''} onChange={handleChange} /></div>
          <div className="assets-form-group"><label>Address</label><input name="supplier_address" value={form.supplier_address||''} onChange={handleChange} /></div>
          <DialogActions>
            <Button onClick={onClose} color="secondary">Cancel</Button>
            <Button type="submit" color="primary" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAssetModal;

// Helper to format date as MM-DD-YYYY
function formatDisplayDate(dateValue) {
  if (!dateValue) return '-';
  let dateObj = null;
  if (dateValue instanceof Date) {
    dateObj = dateValue;
  } else if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    } else {
      return dateValue;
    }
  } else {
    return '-';
  }
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}
