

import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { calculateDepreciation } from '../../utils/assetUtils';
import './comp_styles/inputDropdown.css';

function AddAssetModal({
  open,
  onClose,
  onSubmit,
  newAsset,
  setNewAsset,
  progressLabel = '',
  isEdit,
  assets = [],
  custodians = []
}) {
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Set default status to 'AVAILABLE' if not editing and not set
  useEffect(() => {
    if (!isEdit && !newAsset.status) {
      setNewAsset(asset => ({ ...asset, status: 'AVAILABLE' }));
    }
  }, [isEdit, newAsset.status, setNewAsset]);

  // Reset step and errors when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setValidationErrors({});
      setSuccessMsg('');
    }
  }, [open]);

  // Auto-calculate depreciation fields when relevant fields change
  useEffect(() => {
    const { purchase_cost, useful_life, acquisition_date } = newAsset;
    const dep = calculateDepreciation({ purchase_cost, useful_life, acquisition_date });
    setNewAsset(asset => ({
      ...asset,
      annual_depreciation: dep.annual_depreciation,
      accumulated_depreciation: dep.accumulated_depreciation,
      book_value: dep.book_value
    }));
    // eslint-disable-next-line
  }, [newAsset.purchase_cost, newAsset.useful_life, newAsset.acquisition_date]);

  if (!open) return null;

  // Helper to add department if new
  const departments = Array.from(new Set((assets || []).map(a => a.department).filter(Boolean)));
  const handleDepartmentChange = async (e) => {
    const value = e.target.value;
    setNewAsset({ ...newAsset, department: value });
    if (value && !departments.includes(value) && value !== '__custom__') {
      try {
        if (window.electron && window.electron.ipcRenderer) {
          await window.electron.ipcRenderer.invoke('add-department', value);
        }
      } catch (err) { /* ignore duplicate or error */ }
    }
  };
  const handleCustodianChange = (e) => {
    const value = e.target.value;
    if (newAsset.status === 'Available') {
      setNewAsset({ ...newAsset, custodian: '' });
      return;
    }
    setNewAsset({ ...newAsset, custodian: value });
  };

  // Validation for each step
  const validateStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!newAsset.name?.trim()) errors.name = 'Asset name is required';
      if (!newAsset.serial_number?.trim()) errors.serial_number = 'Serial number is required';
      if (!newAsset.status) errors.status = 'Status is required';
      if (!newAsset.category) errors.category = 'Category is required';
  if (!newAsset.subcategory) errors.subcategory = 'Sub-category is required';
    }
    if (currentStep === 2) {
      if (!newAsset.acquisition_date) errors.acquisition_date = 'Acquisition date is required';
    }
    if (currentStep === 3) {
      if (!newAsset.location?.trim()) errors.location = 'Location is required';
      if (newAsset.status === 'In Use') {
        if (!newAsset.department?.trim()) errors.department = 'Department is required when status is In Use';
        if (!newAsset.custodian?.trim()) errors.custodian = 'Custodian is required when status is In Use';
      }
    }
    if (currentStep === 4) {
      if (!newAsset.purchase_cost) errors.purchase_cost = 'Purchase cost is required';
      if (!newAsset.useful_life) errors.useful_life = 'Useful life is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation
  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setValidationErrors({});
    }
  };
  const handlePrev = (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  };

  // Handler for Add button (step 5 only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep() && currentStep === 5 && onSubmit) {
      await onSubmit(newAsset);
      setSuccessMsg('Asset successfully recorded!');
      setTimeout(() => setSuccessMsg(''), 1000);
      // Reset to step 1 for next asset entry
      setCurrentStep(1);
      setValidationErrors({});
    }
  };

  // Stepper UI
  const steps = [
    'Asset Identification',
    'Acquisition & Documentation',
    'Assignment & Location',
    'Financial Information',
    'Supplier Information'
  ];

  const mainCategories = [
    'Real Estate',
    'ICT',
    'Furniture and Fixture',
    'Physical Plant and Facilities',
  ];
  const subCategories = Array.from(new Set((assets || []).map(a => a.subcategory).filter(Boolean)));

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3>Asset Identification</h3>
            <div className="assets-form-group">
              <label>Asset Name *</label>
              <input type="text" required value={newAsset.name || ''} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} className={validationErrors.name ? 'error' : ''} />
              {validationErrors.name && <span className="error-message">{validationErrors.name}</span>}
            </div>
            <div className="assets-form-group">
              <label>Serial Number *</label>
              <input type="text" required value={newAsset.serial_number || ''} onChange={e => setNewAsset({ ...newAsset, serial_number: e.target.value })} className={validationErrors.serial_number ? 'error' : ''} />
              {validationErrors.serial_number && <span className="error-message">{validationErrors.serial_number}</span>}
            </div>
            <div className="assets-form-group">
              <label>Status *</label>
              <select value={newAsset.status || ''} onChange={e => setNewAsset({ ...newAsset, status: e.target.value })} required className={validationErrors.status ? 'assets-filter-select error' : 'assets-filter-select'}>
                <option value="" disabled>Select status</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
              </select>
              {validationErrors.status && <span className="error-message">{validationErrors.status}</span>}
            </div>
            <div className="assets-form-group">
              <label>Category *</label>
              <select value={newAsset.category || ''} onChange={e => setNewAsset({ ...newAsset, category: e.target.value })} required className={validationErrors.category ? 'assets-filter-select error' : 'assets-filter-select'}>
                <option value="" disabled>Select category</option>
                {mainCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {validationErrors.category && <span className="error-message">{validationErrors.category}</span>}
            </div>
            <div className="assets-form-group">
              <label>Sub-Category *</label>
              <select value={newAsset.subcategory || ''} onChange={e => setNewAsset({ ...newAsset, subcategory: e.target.value })} required className={validationErrors.subcategory ? 'assets-filter-select error' : 'assets-filter-select'}>
                <option value="" disabled>Select sub-category</option>
                {(!subCategories.includes(newAsset.subcategory) && newAsset.subcategory) && (
                  <option key={newAsset.subcategory} value={newAsset.subcategory}>{newAsset.subcategory}</option>
                )}
                {subCategories.map(subcat => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
              {validationErrors.subcategory && <span className="error-message">{validationErrors.subcategory}</span>}
            </div>
            <div className="assets-form-group">
              <label>Description</label>
              <input type="text" value={newAsset.description || ''} onChange={e => setNewAsset({ ...newAsset, description: e.target.value })} />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3>Acquisition & Documentation</h3>
            <div className="assets-form-group">
              <label>Acquisition Date *</label>
              <input type="date" value={newAsset.acquisition_date || ''} onChange={e => setNewAsset({ ...newAsset, acquisition_date: e.target.value })} className={validationErrors.acquisition_date ? 'error' : ''} />
              {validationErrors.acquisition_date && <span className="error-message">{validationErrors.acquisition_date}</span>}
            </div>
            <div className="assets-form-group">
              <label>Document/Receipt Number</label>
              <input type="text" value={newAsset.document_number || ''} onChange={e => setNewAsset({ ...newAsset, document_number: e.target.value })} />
            </div>
            <div className="assets-form-group">
              <label>Date Supplied</label>
              <input type="date" value={newAsset.date_supplied || ''} onChange={e => setNewAsset({ ...newAsset, date_supplied: e.target.value })} />
            </div>
            <div className="assets-form-group">
              <label>Warranty Details</label>
              <input type="text" value={newAsset.warranty_details || ''} onChange={e => setNewAsset({ ...newAsset, warranty_details: e.target.value })} />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3>Assignment & Location</h3>
            <div className="assets-form-group">
              <label>Department {newAsset.status === 'In Use' ? '*' : ''}</label>
              <input
                type="text"
                value={newAsset.department || ''}
                onChange={handleDepartmentChange}
                className={validationErrors.department ? 'assets-filter-select error' : 'assets-filter-select'}
                placeholder="Enter department"
                required={newAsset.status === 'In Use'}
                // disabled={newAsset.status === 'Available'}
              />
              {validationErrors.department && <span className="error-message">{validationErrors.department}</span>}
            </div>
            <div className="assets-form-group">
              <label>Location *</label>
              <input type="text" value={newAsset.location || ''} onChange={e => setNewAsset({ ...newAsset, location: e.target.value })} className={validationErrors.location ? 'assets-filter-select error' : 'assets-filter-select'} placeholder="Enter location" required />
              {validationErrors.location && <span className="error-message">{validationErrors.location}</span>}
            </div>
            <div className="assets-form-group">
              <label>Custodian/In-charge {newAsset.status === 'In Use' ? '*' : ''}</label>
              <input
                type="text"
                value={newAsset.status === 'Available' ? '' : (newAsset.custodian || '')}
                onChange={handleCustodianChange}
                className={validationErrors.custodian ? 'assets-filter-select error' : 'assets-filter-select'}
                placeholder="Enter custodian or in-charge"
                required={newAsset.status === 'In Use'}
                disabled={newAsset.status === 'Available'}
              />
              {validationErrors.custodian && <span className="error-message">{validationErrors.custodian}</span>}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3>Financial Information</h3>
            <div className="assets-form-group">
              <label>Purchase Cost (₱) *</label>
              <input type="number" value={newAsset.purchase_cost || ''} onChange={e => setNewAsset({ ...newAsset, purchase_cost: e.target.value })} className={validationErrors.purchase_cost ? 'error' : ''} />
              {validationErrors.purchase_cost && <span className="error-message">{validationErrors.purchase_cost}</span>}
            </div>
            <div className="assets-form-group">
              <label>Useful Life (years) *</label>
              <input type="number" value={newAsset.useful_life || ''} onChange={e => setNewAsset({ ...newAsset, useful_life: e.target.value })} className={validationErrors.useful_life ? 'error' : ''} />
              {validationErrors.useful_life && <span className="error-message">{validationErrors.useful_life}</span>}
            </div>
            <div className="assets-form-group">
              <label>Depreciation Method</label>
              <input type="text" value={newAsset.depreciation_method || 'Straight-Line'} onChange={e => setNewAsset({ ...newAsset, depreciation_method: e.target.value })} />
            </div>
            <div className="assets-form-group">
              <label>Annual Depreciation</label>
              <input type="number" value={newAsset.annual_depreciation || ''} readOnly />
            </div>
            <div className="assets-form-group">
              <label>Accumulated Depreciation</label>
              <input type="number" value={newAsset.accumulated_depreciation || ''} readOnly />
            </div>
            <div className="assets-form-group">
              <label>Book Value</label>
              <input type="number" value={newAsset.book_value || ''} readOnly />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h3>Supplier Information</h3>
            <div className="assets-form-group">
              <label>Supplier Name</label>
              <input type="text" value={newAsset.supplier || ''} onChange={e => setNewAsset({ ...newAsset, supplier: e.target.value })} />
            </div>
            <div className="assets-form-group">
              <label>Contact Person</label>
              <input type="text" value={newAsset.supplier_contact_person || ''} onChange={e => setNewAsset({ ...newAsset, supplier_contact_person: e.target.value })} />
            </div>
            <div className="assets-form-group">
              <label>Contact Number</label>
              <input type="text" value={newAsset.supplier_contact_number || ''} onChange={e => setNewAsset({ ...newAsset, supplier_contact_number: e.target.value })} />
            </div>
            <div className="assets-form-group">
              <label>Email Address</label>
              <input type="email" value={newAsset.supplier_email || ''} onChange={e => setNewAsset({ ...newAsset, supplier_email: e.target.value })} />
            </div>
            <div className="assets-form-group">
              <label>Address</label>
              <input type="text" value={newAsset.supplier_address || ''} onChange={e => setNewAsset({ ...newAsset, supplier_address: e.target.value })} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Asset' : 'Add New Asset'}
        {progressLabel && <span style={{ marginLeft: 8, fontSize: 14, color: '#888' }}>({progressLabel})</span>}
      </DialogTitle>
      <DialogContent dividers>
        {/* Stepper UI */}
        <div className="step-indicator">
          {steps.map((step, idx) => (
            <div key={idx} className={`step ${idx + 1 === currentStep ? 'active' : idx + 1 < currentStep ? 'completed' : ''}`}>
              <div className="step-number">{idx + 1}</div>
              <div className="step-label">{step}</div>
            </div>
          ))}
        </div>
        {successMsg && (
          <div style={{ background: '#e0ffe0', color: '#2d7a2d', padding: '10px', borderRadius: '5px', marginBottom: '10px', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}
        <form className="assets-form assets-add-scroll-animate" autoComplete="off" onSubmit={handleSubmit}>
          {renderStep()}
          <DialogActions>
            <Button onClick={onClose} color="secondary">Cancel</Button>
            {currentStep > 1 && (
              <Button onClick={handlePrev} color="inherit">Previous</Button>
            )}
            {currentStep < 5 ? (
              <Button onClick={handleNext} color="primary">Next</Button>
            ) : (
              <Button type="submit" color="primary" variant="contained">{isEdit ? 'Save' : 'Add'}</Button>
            )}
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddAssetModal;
      
