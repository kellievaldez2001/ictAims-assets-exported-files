import { formatDate } from '../../utils/dateUtils';

import React, { useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { generateAcknowledgmentReceipt } from '../../utils/generateAcknowledgmentReceipt';
import AssetQR from './AssetQR';

function AssetDetailsModal({
  open,
  asset,
  onClose,
  getCustodianName,
  getDetailsDepreciation,
  onEdit,
  onViewAsset
}) {
  const [error, setError] = useState(null);
  const [arPdfUrl, setArPdfUrl] = useState(null);
  const qrCanvasRef = useRef(null);

  if (!open) return null;
  if (!asset) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Asset Details</DialogTitle>
        <DialogContent>
          <div style={{marginBottom: 24, fontWeight: 700, fontSize: 24}}>No asset data provided.</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  // Get depreciation details if function provided
  const depreciation = getDetailsDepreciation ? getDetailsDepreciation(asset) : {};

  // Use asset fields directly (no JSON parsing)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Asset Details</DialogTitle>
      <DialogContent dividers>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:12,paddingBottom:12}}>
          {/* Defensive QR rendering: fallback if QRCode fails */}
          {(() => {
            try {
              // Only show Asset Name, Custodian, and Status in QR info
              const assetInfo = `asset://${asset.id}\nAsset: ${asset.name || asset.asset_name || 'N/A'}\nCustodian: ${asset.custodian || asset.custodian_name || 'N/A'}\nStatus: ${asset.status || 'N/A'}`;
              return <div ref={el => {
                if (el) {
                  const canvas = el.querySelector('canvas');
                  if (canvas) qrCanvasRef.current = canvas;
                }
              }}>
                <AssetQR value={assetInfo} size={180} />
              </div>;
            } catch (e) {
              return <div style={{color:'red',marginBottom:16}}>QR code failed to render.</div>;
            }
          })()}
          <div style={{marginTop:8, marginBottom:8}}>
            <strong>Public Link:</strong> <a href="#" onClick={(e) => { e.preventDefault(); if (window.electron && window.electron.ipcRenderer) { window.electron.ipcRenderer.invoke('open-asset-details', asset.id); } }} style={{color: '#4fc3f7', textDecoration: 'underline', cursor: 'pointer'}}>asset://{asset.id}</a>
          </div>
          <Button
            variant="outlined"
            size="small"
            style={{marginTop: 8, marginBottom: 16}}
            onClick={async () => {
              try {
                if (qrCanvasRef.current) {
                  const imageData = qrCanvasRef.current.toDataURL('image/png');
                  const filename = `asset-qr-${asset.id||asset.serial_number||'qr'}.png`;
                  // Send image data to main process to save in Downloads
                  if (window && window.electron && window.electron.ipcRenderer) {
                    window.electron.ipcRenderer.invoke('save-qr-to-downloads', { imageData, filename })
                      .then(() => setError(null))
                      .catch(() => setError('Failed to save QR code to Downloads folder.'));
                  } else if (window && window.ipcRenderer) {
                    window.ipcRenderer.invoke('save-qr-to-downloads', { imageData, filename })
                      .then(() => setError(null))
                      .catch(() => setError('Failed to save QR code to Downloads folder.'));
                  } else if (window && window.require) {
                    try {
                      const { ipcRenderer } = window.require('electron');
                      ipcRenderer.invoke('save-qr-to-downloads', { imageData, filename })
                        .then(() => setError(null))
                        .catch(() => setError('Failed to save QR code to Downloads folder.'));
                    } catch (err) {
                      setError('IPC not available. Cannot save QR code.');
                    }
                  } else {
                    setError('IPC not available. Cannot save QR code.');
                  }
                  return;
                }
                setError('QR code not found for download.');
              } catch (e) {
                setError('Failed to download QR code.');
              }
            }}
          >Download QR Code</Button>
        </div>
        <div className="asset-details-content">
          <div><span className="asset-details-label">Name:</span> <span className="asset-details-value">{asset.name || asset.asset_name || '-'}</span></div>
          <div><span className="asset-details-label">Category:</span> <span className="asset-details-value">{asset.category || '-'}</span></div>
          <div><span className="asset-details-label">Sub-Category:</span> <span className="asset-details-value">{asset.subcategory || '-'}</span></div>
          <div><span className="asset-details-label">Serial Number:</span> <span className="asset-details-value">{asset.serial_number || '-'}</span></div>
          <div><span className="asset-details-label">Department:</span> <span className="asset-details-value">{asset.department || '-'}</span></div>
          <div><span className="asset-details-label">Status:</span> <span className="asset-details-value">{asset.status || '-'}</span></div>
          <div><span className="asset-details-label">Acquisition Date:</span> <span className="asset-details-value">{
            asset.acquisition_date
              ? formatDisplayDate(asset.acquisition_date)
              : '-'
          }</span></div>
          <div><span className="asset-details-label">Location:</span> <span className="asset-details-value">{asset.location || '-'}</span></div>
          <div><span className="asset-details-label">Custodian:</span> <span className="asset-details-value">{asset.custodian || '-'}</span></div>
          <div><span className="asset-details-label">Purchase Cost (₱):</span> <span className="asset-details-value">{asset.purchase_cost || '-'}</span></div>
          <div><span className="asset-details-label">Useful Life (years):</span> <span className="asset-details-value">{asset.useful_life || '-'}</span></div>
          <div><span className="asset-details-label">Depreciation Method:</span> <span className="asset-details-value">{asset.depreciation_method || 'Straight-Line'}</span></div>
          <div><span className="asset-details-label">Annual Depreciation (₱):</span> <span className="asset-details-value">{asset.annual_depreciation || '-'}</span></div>
          <div><span className="asset-details-label">Accumulated Depreciation (₱):</span> <span className="asset-details-value">{asset.accumulated_depreciation || '-'}</span></div>
          <div><span className="asset-details-label">Book Value (₱):</span> <span className="asset-details-value">{asset.book_value || '-'}</span></div>
          <div><span className="asset-details-label">Supplier Name:</span> <span className="asset-details-value">{asset.supplier || '-'}</span></div>
          <div><span className="asset-details-label">Contact Person:</span> <span className="asset-details-value">{asset.supplier_contact_person || '-'}</span></div>
          <div><span className="asset-details-label">Contact Number:</span> <span className="asset-details-value">{asset.supplier_contact_number || '-'}</span></div>
          <div><span className="asset-details-label">Email Address:</span> <span className="asset-details-value">{asset.supplier_email || '-'}</span></div>
          <div><span className="asset-details-label">Address:</span> <span className="asset-details-value">{asset.supplier_address || '-'}</span></div>
          <div><span className="asset-details-label">Document/Receipt Number:</span> <span className="asset-details-value">{asset.document_number || '-'}</span></div>
          <div><span className="asset-details-label">Date Supplied:</span> <span className="asset-details-value">{
            asset.date_supplied
              ? formatDisplayDate(asset.date_supplied)
              : '-'
          }</span></div>
          <div><span className="asset-details-label">Warranty Details:</span> <span className="asset-details-value">{asset.warranty_details || '-'}</span></div>
          <div><span className="asset-details-label">Description:</span> <span className="asset-details-value">{asset.description || '-'}</span></div>
          <div><span className="asset-details-label">Remarks:</span> <span className="asset-details-value">{asset.remarks || '-'}</span></div>
          <div><span className="asset-details-label">Date Updated:</span> <span className="asset-details-value">{asset.updated_at ? formatDisplayDate(asset.updated_at) : '-'}</span></div>
        </div>
        {error && <div style={{color:'red',marginTop:12}}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
        <Button onClick={onEdit} color="primary">Edit</Button>
        <Button
          color="primary"
          onClick={() => {
            const url = generateAcknowledgmentReceipt({
              ...asset,
              custodian: getCustodianName ? getCustodianName(asset.custodian_id) : asset.custodian
            });
            setArPdfUrl(url);
          }}
        >📄 View Acknowledgment Receipt</Button>
        {arPdfUrl && (
          <a href={arPdfUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Button color="primary" variant="outlined">Open AR PDF</Button>
          </a>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AssetDetailsModal;

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

