import React, { useState, useEffect } from 'react';
import { calculateDepreciation } from '../../utils/assetUtils';
const { ipcRenderer } = window.require ? window.require('electron') : { invoke: async () => [] };


function MultiAssetEntryModal({ open, onClose, onSubmit, assetTemplate, quantity }) {
  const [assets, setAssets] = useState(() =>
    Array.from({ length: quantity }, () => ({ ...assetTemplate, name: '' }))
  );
  const [allAssets, setAllAssets] = useState([]);
  const [custodians, setCustodians] = useState([]);

  // Fetch all assets and custodians for suggestions
  useEffect(() => {
    if (open) {
      ipcRenderer.invoke('get-assets').then(setAllAssets);
      ipcRenderer.invoke('get-custodians').then(setCustodians);
    }
  }, [open]);

  useEffect(() => {
    setAssets(Array.from({ length: quantity }, () => ({ ...assetTemplate, name: '' })));
  }, [quantity, assetTemplate, open]);

  // Auto-calculate depreciation fields
  useEffect(() => {
    setAssets(prevAssets => prevAssets.map(asset => {
      const dep = calculateDepreciation(asset);
      return { ...asset, ...dep };
    }));
  }, [assets.map(a => a.purchase_cost).join(), assets.map(a => a.useful_life).join(), assets.map(a => a.acquisition_date).join()]);

  const handleChange = (idx, field, value) => {
    setAssets(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  // Helper: get unique values for suggestions
  const getUnique = (field) => {
    return [...new Set(allAssets.map(a => a[field]).filter(Boolean))];
  };

  // Helper: get unique custodian names
  const getCustodianNames = () => {
    const names = custodians.map(c => c.name).filter(Boolean);
    // Also add from assets if not in custodians
    getUnique('custodian').forEach(name => {
      if (name && !names.includes(name)) names.push(name);
    });
    return names;
  };

  // Email suggestions
  const emailDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com'];
  const getEmailSuggestions = (val) => {
    if (!val || val.includes('@')) return [];
    return emailDomains.map(domain => val + domain);
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Ensure department is not blanked out or overwritten
    onSubmit(assets.map(asset => ({ ...asset, department: asset.department || '' })));
  };

  if (!open) return null;
  return (
    <div className="assets-modal-overlay">
      <div className="assets-modal" style={{ maxWidth: 900, width: '95%' }}>
        <div className="assets-modal-header">
          <span className="assets-modal-title">Add Received Assets</span>
          <button className="assets-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form className="assets-form assets-add-scroll-animate" onSubmit={handleSubmit} autoComplete="off">
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {assets.map((asset, idx) => (
              <div key={idx} style={{ border: '1px solid #ccc', margin: 8, padding: 8, borderRadius: 6 }}>
                <div><b>Asset #{idx + 1}</b></div>
                <div className="assets-form-group">
                  <label>Asset Name</label>
                  <input
                    type="text"
                    required
                    value={asset.name || ''}
                    onChange={e => handleChange(idx, 'name', e.target.value)}
                  />
                </div>
                <div className="assets-form-group">
                  <label>Serial Number</label>
                  <input type="text" required value={asset.serial_number || ''} onChange={e => handleChange(idx, 'serial_number', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Category</label>
                  <input type="text" value={asset.category || ''} onChange={e => handleChange(idx, 'category', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Acquisition Date</label>
                  <input type="date" value={asset.acquisition_date || ''} onChange={e => handleChange(idx, 'acquisition_date', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Status</label>
                  <input
                    type="text"
                    list={`status-options-${idx}`}
                    value={asset.status || ''}
                    onChange={e => handleChange(idx, 'status', e.target.value)}
                  />
                  <datalist id={`status-options-${idx}`}>
                    {['Available', 'In Use', 'Maintenance', 'Retired'].map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div className="assets-form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    list={`department-options-${idx}`}
                    value={asset.department || ''}
                    onChange={e => handleChange(idx, 'department', e.target.value)}
                  />
                  <datalist id={`department-options-${idx}`}>
                    {getUnique('department').map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div className="assets-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    list={`location-options-${idx}`}
                    value={asset.location || ''}
                    onChange={e => handleChange(idx, 'location', e.target.value)}
                  />
                  <datalist id={`location-options-${idx}`}>
                    {getUnique('location').map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div className="assets-form-group">
                  <label>Custodian</label>
                  <input
                    type="text"
                    list={`custodian-options-${idx}`}
                    value={asset.custodian || ''}
                    onChange={e => handleChange(idx, 'custodian', e.target.value)}
                  />
                  <datalist id={`custodian-options-${idx}`}>
                    {getCustodianNames().map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div className="assets-form-group">
                  <label>Purchase Cost (₱)</label>
                  <input type="number" value={asset.purchase_cost || ''} onChange={e => handleChange(idx, 'purchase_cost', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Useful Life (years)</label>
                  <input type="number" value={asset.useful_life || ''} onChange={e => handleChange(idx, 'useful_life', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Depreciation Method</label>
                  <input type="text" value={asset.depreciation_method || 'Straight-Line'} onChange={e => handleChange(idx, 'depreciation_method', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Annual Depreciation</label>
                  <input type="number" value={asset.annual_depreciation || ''} readOnly />
                </div>
                <div className="assets-form-group">
                  <label>Accumulated Depreciation</label>
                  <input type="number" value={asset.accumulated_depreciation || ''} readOnly />
                </div>
                <div className="assets-form-group">
                  <label>Book Value</label>
                  <input type="number" value={asset.book_value || ''} readOnly />
                </div>
                <div className="assets-form-group">
                  <label>Supplier Name</label>
                  <input type="text" value={asset.supplier || ''} onChange={e => handleChange(idx, 'supplier', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Contact Person</label>
                  <input type="text" value={asset.supplier_contact_person || ''} onChange={e => handleChange(idx, 'supplier_contact_person', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Contact Number</label>
                  <input type="text" value={asset.supplier_contact_number || ''} onChange={e => handleChange(idx, 'supplier_contact_number', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={asset.supplier_email || ''}
                    onChange={e => handleChange(idx, 'supplier_email', e.target.value)}
                    list={`email-suggestions-${idx}`}
                  />
                  <datalist id={`email-suggestions-${idx}`}>
                    {getEmailSuggestions(asset.supplier_email).map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div className="assets-form-group">
                  <label>Address</label>
                  <input type="text" value={asset.supplier_address || ''} onChange={e => handleChange(idx, 'supplier_address', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Purchase Order No.</label>
                  <input type="text" value={asset.document_number || ''} onChange={e => handleChange(idx, 'document_number', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Invoice Number</label>
                  <input type="text" value={asset.invoice_number || ''} onChange={e => handleChange(idx, 'invoice_number', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Date Supplied</label>
                  <input type="date" value={asset.date_supplied || ''} onChange={e => handleChange(idx, 'date_supplied', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Warranty Details</label>
                  <input type="text" value={asset.warranty_details || ''} onChange={e => handleChange(idx, 'warranty_details', e.target.value)} />
                </div>
                <div className="assets-form-group">
                  <label>Description</label>
                  <input type="text" value={asset.description || ''} onChange={e => handleChange(idx, 'description', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <div className="assets-modal-actions">
            <button type="button" className="assets-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="assets-btn-primary">Add All</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MultiAssetEntryModal;
