

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';



function AddAssetAcquisitionModal({ open, onClose, onSubmit, isEdit, initialAcquisition }) {
  // Subcategories for each category
  const subCategoryOptions = {
    "REAL ESTATE": [
      "School Building", "Land", "Multi-purpose Hall", "Covered Court", "Library Building", "Laboratory Building", "Administration Building", "Canteen / Food Court", "Dormitory", "Faculty Room", "Lecture Hall", "Guard House", "Parking Area", "Open Field", "Gymnasium", "Pathways / Pavement"
    ],
    "ICT": [
      "Desktop Computer", "Laptop", "Tablet", "Printer", "Scanner", "Projector", "Interactive Whiteboard", "Server", "Switch", "Router", "Network Hub", "Access Point", "Firewall Device", "UPS (Uninterruptible Power Supply)", "External Hard Drive", "Keyboard", "Mouse", "Monitor", "Speaker System", "Headset", "Microphone", "Web Camera", "Network Cable", "HDMI/VGA Cable", "Software License"
    ],
    "FURNITURE AND FIXTURE": [
      "Office Table", "Office Chair", "Filing Cabinet", "Book Shelf", "Student Desk", "Student Chair", "Arm Chair", "Laboratory Table", "Laboratory Stool", "Computer Table", "Teacher's Table", "Sofa Set", "Waiting Bench", "Conference Table", "Bulletin Board", "Whiteboard", "Corkboard", "Window Blinds", "Wall Clock", "Display Rack"
    ],
    "PHYSICAL PLANT AND FACILITIES": [
      "Electrical Panel", "Water Tank", "Generator", "Air Conditioning Unit", "Ceiling Fan", "Wall Fan", "Lighting Fixture", "Fire Extinguisher", "Emergency Exit Sign", "Plumbing System", "Drainage System", "Water Dispenser", "Power Tools", "Workshop Equipment", "Storage Room", "Maintenance Tools", "CCTV Camera", "PA System", "Public Address Microphone", "Flag Pole", "Steel Gate", "Steel Grills / Railings", "Septic Tank"
    ]
  };
  const defaultAcquisition = {
    asset_name: '',
    category: '',
    subcategory: '',
    quantity: '',
    supplier: '',
    acquisition_date: '',
    unit_cost: '',
    total_cost: '',
    document_number: '',
 
    remarks: '',
  };
  const sanitizeAcquisition = (a) => ({
    ...defaultAcquisition,
    ...a,
    asset_name: a?.asset_name ?? '',
    category: a?.category ?? '',
    subcategory: a?.subcategory ?? '',
    quantity: a?.quantity === undefined || a?.quantity === null ? '' : a.quantity,
    supplier: a?.supplier ?? '',
    acquisition_date: a?.acquisition_date ?? '',
    unit_cost: a?.unit_cost === undefined || a?.unit_cost === null ? '' : a.unit_cost,
    total_cost: a?.total_cost === undefined || a?.total_cost === null ? '' : a.total_cost,
    document_number: a?.document_number ?? '',
    
    remarks: a?.remarks ?? '',
  });
  const [acquisition, setAcquisition] = useState(sanitizeAcquisition(initialAcquisition));
  // For auto PO number
  useEffect(() => {
    if (open && !isEdit) {
      // Fetch all asset acquisitions to get the max acquisition_number
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.invoke('get-asset-acquisitions').then((acquisitions) => {
        let maxNum = 0;
        acquisitions.forEach(a => {
          // Only consider numeric acquisition_numbers
          const num = parseInt(a.acquisition_number, 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        });
        setAcquisition(prev => ({ ...sanitizeAcquisition(initialAcquisition), acquisition_number: String(maxNum + 1) }));
        });
      }
    } else if (open) {
      // Edit mode or modal re-opened
      let patched = sanitizeAcquisition(initialAcquisition);
      setAcquisition(patched);
    }
  }, [initialAcquisition, open, isEdit]);

  if (!open) return null;

  const handleChange = (field, value) => {
    let updated = { ...acquisition, [field]: value };
    // Auto-calculate total_cost if quantity or unit_cost changes
    if (field === 'quantity' || field === 'unit_cost') {
      const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
      const cost = parseFloat(field === 'unit_cost' ? value : updated.unit_cost) || 0;
      updated.total_cost = qty * cost;
    }
    updated = sanitizeAcquisition(updated);
    setAcquisition(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...acquisition,
      quantity: parseInt(acquisition.quantity) || 0,
      unit_cost: parseFloat(acquisition.unit_cost) || 0,
      total_cost: parseFloat(acquisition.total_cost) || 0,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Asset Acquisition' : 'Add Asset Acquisition'}</DialogTitle>
      <DialogContent dividers>
        <form className="asset-acquisitions-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="asset-acquisitions-form-group">
            <label>Asset Name</label>
            <input type="text" required value={acquisition.asset_name} onChange={e => handleChange('asset_name', e.target.value)} placeholder="e.g. HP Laptop 14s" />
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Category</label>
            <select required value={acquisition.category} onChange={e => handleChange('category', e.target.value)}>
              <option value="">Select Category</option>
              <option value="REAL ESTATE">REAL ESTATE</option>
              <option value="ICT">ICT</option>
              <option value="FURNITURE AND FIXTURE">FURNITURE AND FIXTURE</option>
              <option value="PHYSICAL PLANT AND FACILITIES">PHYSICAL PLANT AND FACILITIES</option>
            </select>
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Sub-Category</label>
            <select required value={acquisition.subcategory} onChange={e => handleChange('subcategory', e.target.value)}>
              <option value="">Select Sub-Category</option>
              {(subCategoryOptions[acquisition.category] || []).map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Quantity</label>
            <input type="number" min="1" required value={acquisition.quantity} onChange={e => handleChange('quantity', e.target.value)} />
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Supplier / Source</label>
            <input type="text" required value={acquisition.supplier} onChange={e => handleChange('supplier', e.target.value)} placeholder="e.g. Lenovo PH" />
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Acquisition Date</label>
            <input type="date" required value={acquisition.acquisition_date} onChange={e => handleChange('acquisition_date', e.target.value)} />
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Unit Cost (₱)</label>
            <input type="number" min="0" step="0.01" value={acquisition.unit_cost} onChange={e => handleChange('unit_cost', e.target.value)} />
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Total Cost (₱)</label>
            <input type="number" min="0" step="0.01" value={acquisition.total_cost} onChange={e => handleChange('total_cost', e.target.value)} readOnly />
          </div>
          <div className="asset-acquisitions-form-group">
            <label>Document/Receipt Number</label>
            <input type="text" value={acquisition.document_number} onChange={e => handleChange('document_number', e.target.value)} />
          </div>
         
          <div className="asset-acquisitions-form-group">
            <label>Remarks / Notes</label>
            <textarea value={acquisition.remarks} onChange={e => handleChange('remarks', e.target.value)} rows={2} />
          </div>
          <DialogActions>
            <Button onClick={onClose} color="secondary">Cancel</Button>
            <Button type="submit" color="primary" variant="contained">{isEdit ? 'Save' : 'Add'}</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddAssetAcquisitionModal;
