

import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ipcRenderer = window.electron && window.electron.ipcRenderer;

function AddStockAdjustmentModal({
  open,
  onClose,
  onSubmit,
  newAdjustment,
  setNewAdjustment,
  isEdit,
  asset // asset prop for autofill
}) {
  const [assets, setAssets] = useState([]);
  const [custodians, setCustodians] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetFound, setAssetFound] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setAssetFound(false);
      Promise.all([
        ipcRenderer.invoke('get-assets'),
        ipcRenderer.invoke('get-custodians'),
        ipcRenderer.invoke('get-categories')
      ])
        .then(([assetsList, custodiansList, categoriesList]) => {
          setAssets(assetsList);
          setCustodians(custodiansList);
          setCategories(categoriesList);
          // Autofill if asset prop is provided
          if (asset && asset.id) {
            const selectedAsset = assetsList.find(a => a.id == asset.id);
            if (selectedAsset) {
              setNewAdjustment(adj => ({
                ...adj,
                asset_id: selectedAsset.id,
                asset_name: selectedAsset.name || selectedAsset.asset_name || '',
                serial_number: selectedAsset.serial_number || '',
                category: selectedAsset.category || '',
                subcategory: selectedAsset.subcategory || '',
                adjustment_type: '',
                reason: ''
              }));
              setAssetFound(true);
            }
          }
        })
        .catch(err => {
          console.error('Error loading data:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, asset, setNewAdjustment]);

  const handleAssetSelect = (assetId) => {
    console.log('handleAssetSelect called with assetId:', assetId);
    console.log('Available assets:', assets);
    const selectedAsset = assets.find(asset => asset.id == assetId);
    console.log('Selected asset:', selectedAsset);
    
    if (selectedAsset) {
      console.log('Selected asset details:', {
        id: selectedAsset.id,
        name: selectedAsset.name,
        asset_name: selectedAsset.asset_name,
        serial_number: selectedAsset.serial_number,
        category: selectedAsset.category,
        subcategory: selectedAsset.subcategory,
        department: selectedAsset.department,
        location: selectedAsset.location,
        custodian_id: selectedAsset.custodian_id
      });
      
      // Find custodian name from custodian_id
      const custodian = selectedAsset.custodian_id ? 
        custodians.find(c => c.id == selectedAsset.custodian_id) : null;
      
      // Auto-populate all fields based on selected asset
      const updatedAdjustment = {
        ...newAdjustment,
        asset_id: selectedAsset.id,
        asset_name: selectedAsset.name || selectedAsset.asset_name || '',
        serial_number: selectedAsset.serial_number || '',
        category: selectedAsset.category || '',
        subcategory: selectedAsset.subcategory || '',
        department: selectedAsset.department || '',
        location: selectedAsset.location || '',
        custodian_name: custodian ? custodian.name : ''
      };
      
      console.log('Updated adjustment:', updatedAdjustment);
      setNewAdjustment(updatedAdjustment);
      setAssetFound(true);
    }
  };

  const handleAssetNameSelect = (assetName) => {
    console.log('handleAssetNameSelect called with assetName:', assetName);
    if (assetName) {
      const selectedAsset = assets.find(asset => asset.name === assetName || asset.asset_name === assetName);
      console.log('Found asset by name:', selectedAsset);
      
      if (selectedAsset) {
        // Find custodian name from custodian_id
        const custodian = selectedAsset.custodian_id ? 
          custodians.find(c => c.id == selectedAsset.custodian_id) : null;
          
        const updatedAdjustment = {
          ...newAdjustment,
          asset_id: selectedAsset.id,
          asset_name: selectedAsset.name || selectedAsset.asset_name || '',
          serial_number: selectedAsset.serial_number || '',
          category: selectedAsset.category || '',
          subcategory: selectedAsset.subcategory || '',
          department: selectedAsset.department || '',
          location: selectedAsset.location || '',
          custodian_name: custodian ? custodian.name : ''
        };
        
        console.log('Updated adjustment from name selection:', updatedAdjustment);
        setNewAdjustment(updatedAdjustment);
        setAssetFound(true);
      }
    } else {
      // Clear asset-related fields if no asset is selected
      setNewAdjustment({
        ...newAdjustment,
        asset_id: '',
        asset_name: '',
        serial_number: '',
        category: '',
        subcategory: '',
        department: '',
        location: '',
        custodian_name: ''
      });
      setAssetFound(false);
    }
  };

  const handleCategorySelect = (category) => {
    console.log('handleCategorySelect called with category:', category);
    console.log('Current asset_name:', newAdjustment?.asset_name);
    
    if (category && newAdjustment?.asset_name) {
      // Find the asset with the selected name and category
      const selectedAsset = assets.find(asset => 
        (asset.name === newAdjustment.asset_name || asset.asset_name === newAdjustment.asset_name) && 
        asset.category === category
      );
      
      console.log('Found asset by name and category:', selectedAsset);
      
      if (selectedAsset) {
        // Find custodian name from custodian_id
        const custodian = selectedAsset.custodian_id ? 
          custodians.find(c => c.id == selectedAsset.custodian_id) : null;
          
        // Auto-populate subcategory based on asset name and category
        const updatedAdjustment = {
          ...newAdjustment,
          asset_id: selectedAsset.id,
          serial_number: selectedAsset.serial_number || '',
          category: category,
          subcategory: selectedAsset.subcategory || '',
          department: selectedAsset.department || '',
          location: selectedAsset.location || '',
          custodian_name: custodian ? custodian.name : ''
        };
        
        console.log('Updated adjustment from category selection:', updatedAdjustment);
        setNewAdjustment(updatedAdjustment);
        setAssetFound(true);
      }
    } else {
      setNewAdjustment({
        ...newAdjustment,
        category: category,
        subcategory: ''
      });
    }
  };

  const handleSerialNumberInput = (serialNumber) => {
    console.log('handleSerialNumberInput called with serialNumber:', serialNumber);
    if (serialNumber) {
      // Find asset by serial number
      const selectedAsset = assets.find(asset => 
        asset.serial_number && asset.serial_number.toLowerCase().includes(serialNumber.toLowerCase())
      );
      
      console.log('Found asset by serial number:', selectedAsset);
      
      if (selectedAsset) {
        // Find custodian name from custodian_id
        const custodian = selectedAsset.custodian_id ? 
          custodians.find(c => c.id == selectedAsset.custodian_id) : null;
          
        // Auto-populate all fields based on found asset
        const updatedAdjustment = {
          ...newAdjustment,
          asset_id: selectedAsset.id,
          asset_name: selectedAsset.name || selectedAsset.asset_name || '',
          serial_number: selectedAsset.serial_number || '',
          category: selectedAsset.category || '',
          subcategory: selectedAsset.subcategory || '',
          department: selectedAsset.department || '',
          location: selectedAsset.location || '',
          custodian_name: custodian ? custodian.name : ''
        };
        
        console.log('Updated adjustment from serial number input:', updatedAdjustment);
        setNewAdjustment(updatedAdjustment);
        setAssetFound(true);
      } else {
        setAssetFound(false);
      }
    } else {
      // Clear asset-related fields if no serial number is entered
      setNewAdjustment({
        ...newAdjustment,
        asset_id: '',
        asset_name: '',
        serial_number: '',
        category: '',
        subcategory: '',
        department: '',
        location: '',
        custodian_name: ''
      });
      setAssetFound(false);
    }
  };

  const validateForm = () => {
    if (!newAdjustment.asset_id || !newAdjustment.asset_name) {
      alert('Please select a valid asset by entering a serial number or selecting from the dropdown.');
      return false;
    }
    if (!newAdjustment.adjustment_type) {
      alert('Please select an adjustment type.');
      return false;
    }
    if (!newAdjustment.reason) {
      alert('Please enter a reason for the adjustment.');
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(newAdjustment);
    }
  };

  const clearForm = () => {
    setNewAdjustment({
      asset_id: '',
      asset_name: '',
      serial_number: '',
      category: '',
      subcategory: '',
      department: '',
      location: '',
      custodian_name: '',
      adjustment_type: '',
      reason: '',
      remarks: '',
      created_by: '',
      adjustment_date: new Date().toISOString().split('T')[0],
    });
    setAssetFound(false);
  };

  if (!open) return null;
  return (
    <Dialog open={open} onClose={() => { clearForm(); onClose(); }} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Stock Adjustment' : 'Add Stock Adjustment'}</DialogTitle>
      <DialogContent dividers>
        <form
          className="assets-form assets-add-scroll-animate"
          onSubmit={handleFormSubmit}
          autoComplete="off"
        >
          {/* Asset ID */}
          <div className="assets-form-group">
            <label>Asset ID *</label>
            <select
              required
              value={newAdjustment?.asset_id || ''}
              onChange={e => handleAssetSelect(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? 'Loading assets...' : 'Select Asset ID...'}</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.id}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Name */}
          <div className="assets-form-group">
            <label>Asset Name *</label>
            <input
              type="text"
              value={newAdjustment?.asset_name || ''}
              readOnly
            />
          </div>

          {/* Serial Number */}
          <div className="assets-form-group">
            <label>Serial Number</label>
            <input
              type="text"
              value={newAdjustment?.serial_number || ''}
              readOnly
            />
          </div>

          {/* Category */}
          <div className="assets-form-group">
            <label>Category</label>
            <input
              type="text"
              value={newAdjustment?.category || ''}
              readOnly
            />
          </div>

          {/* Subcategory */}
          <div className="assets-form-group">
            <label>Subcategory</label>
            <input
              type="text"
              value={newAdjustment?.subcategory || ''}
              readOnly
            />
          </div>

          {/* Adjustment Type */}
          <div className="assets-form-group">
            <label>Adjustment Type *</label>
            <select
              required
              value={newAdjustment?.adjustment_type || ''}
              onChange={e => setNewAdjustment({ ...newAdjustment, adjustment_type: e.target.value })}
            >
              <option value="">Select adjustment type...</option>
              <option value="Addition">Addition</option>
              <option value="Transfer">Transfer</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
              <option value="Disposal">Disposal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Reason */}
          <div className="assets-form-group">
            <label>Reason *</label>
            <input
              type="text"
              required
              value={newAdjustment?.reason || ''}
              onChange={e => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
              placeholder="Enter reason for adjustment"
            />
          </div>
          <DialogActions>
            <Button onClick={() => { clearForm(); onClose(); }} color="secondary">Cancel</Button>
            <Button onClick={clearForm} color="inherit" style={{ marginRight: 8 }}>Clear Form</Button>
            <Button type="submit" color="primary" variant="contained">{isEdit ? 'Save' : 'Add'}</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddStockAdjustmentModal;
