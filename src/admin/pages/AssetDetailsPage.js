import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ipcRenderer = window.electron && window.electron.ipcRenderer;

function AssetDetailsPage() {
  const { assetId } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        setLoading(true);
        const result = await ipcRenderer.invoke('get-asset-by-id', assetId);
        setAsset(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch asset details.');
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [assetId]);

  function handleExportAsHTML() {
    if (!asset) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Asset Details - ${asset.name || asset.asset_name || asset.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { color: #333; }
          .asset-details-list div { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <h2>Asset Details</h2>
        <div class="asset-details-list">
          <div><strong>ID:</strong> ${asset.id || '-'}</div>
          <div><strong>Name:</strong> ${asset.name || asset.asset_name || '-'}</div>
          <div><strong>Category:</strong> ${asset.category || '-'}</div>
          <div><strong>Serial Number:</strong> ${asset.serial_number || '-'}</div>
          <div><strong>Department:</strong> ${asset.department || '-'}</div>
          <div><strong>Location:</strong> ${asset.location || '-'}</div>
          <div><strong>Custodian:</strong> ${asset.custodian_name || asset.custodian || asset.custodian_id || '-'}</div>
          <div><strong>Status:</strong> ${asset.status || '-'}</div>
          <div><strong>Acquisition Date:</strong> ${formatDisplayDate(asset.acquisition_date)}</div>
          <div><strong>Purchase Cost:</strong> ${asset.purchase_cost || '-'}</div>
          <div><strong>Useful Life:</strong> ${asset.useful_life || '-'}</div>
          <div><strong>Depreciation Method:</strong> ${asset.depreciation_method || asset.depreciation || 'Straight-Line'}</div>
          <div><strong>Supplier:</strong> ${asset.supplier || '-'}</div>
          <div><strong>Contact Person:</strong> ${asset.supplier_contact_person || '-'}</div>
          <div><strong>Contact Number:</strong> ${asset.supplier_contact_number || '-'}</div>
          <div><strong>Email:</strong> ${asset.supplier_email || '-'}</div>
          <div><strong>Address:</strong> ${asset.supplier_address || '-'}</div>
          <div><strong>Document/Receipt Number:</strong> ${asset.document_number || '-'}</div>
          <div><strong>Date Supplied:</strong> ${formatDisplayDate(asset.date_supplied)}</div>
          <div><strong>Warranty Details:</strong> ${asset.warranty_details || '-'}</div>
          <div><strong>Description:</strong> ${asset.description || '-'}</div>
          ${asset.created_at ? `<div><strong>Created At:</strong> ${formatDisplayDate(asset.created_at)}</div>` : ''}
          ${asset.updated_at ? `<div><strong>Updated At:</strong> ${formatDisplayDate(asset.updated_at)}</div>` : ''}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-${asset.id || 'details'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) return <div>Loading asset details...</div>;
  if (error) return <div style={{ color: 'red', padding: 16 }}>{error}</div>;
  if (!asset) return <div style={{ padding: 16 }}>No asset found.</div>;

  // Debug log for acquisition_date and date_supplied
  console.log('[AssetDetailsPage] acquisition_date:', asset.acquisition_date, 'date_supplied:', asset.date_supplied);

  return (
    <div className="asset-details-mobile" style={{ padding: 16 }}>
      <h2>Asset Details</h2>
      <button onClick={handleExportAsHTML} style={{ marginBottom: 16 }}>
        Export as HTML
      </button>
      <div className="asset-details-list">
        <div><strong>ID:</strong> {asset.id || '-'}</div>
        <div><strong>Name:</strong> {asset.name || asset.asset_name || '-'}</div>
        <div><strong>Category:</strong> {asset.category || '-'}</div>
        <div><strong>Serial Number:</strong> {asset.serial_number || '-'}</div>
        <div><strong>Department:</strong> {asset.department || '-'}</div>
        <div><strong>Location:</strong> {asset.location || '-'}</div>
        <div><strong>Custodian:</strong> {asset.custodian_name || asset.custodian || asset.custodian_id || '-'}</div>
        <div><strong>Status:</strong> {asset.status || '-'}</div>
        <div><strong>Acquisition Date:</strong> {formatDisplayDate(asset.acquisition_date)}</div>
        <div><strong>Purchase Cost:</strong> {asset.purchase_cost || '-'}</div>
        <div><strong>Useful Life:</strong> {asset.useful_life || '-'}</div>
        <div><strong>Depreciation Method:</strong> {asset.depreciation_method || asset.depreciation || 'Straight-Line'}</div>
        <div><strong>Supplier:</strong> {asset.supplier || '-'}</div>
        <div><strong>Contact Person:</strong> {asset.supplier_contact_person || '-'}</div>
        <div><strong>Contact Number:</strong> {asset.supplier_contact_number || '-'}</div>
        <div><strong>Email:</strong> {asset.supplier_email || '-'}</div>
        <div><strong>Address:</strong> {asset.supplier_address || '-'}</div>
        <div><strong>Document/Receipt Number:</strong> {asset.document_number || '-'}</div>
        <div><strong>Date Supplied:</strong> {formatDisplayDate(asset.date_supplied)}</div>
        <div><strong>Warranty Details:</strong> {asset.warranty_details || '-'}</div>
        <div><strong>Description:</strong> {asset.description || '-'}</div>
        {asset.created_at && (
          <div><strong>Created At:</strong> {formatDisplayDate(asset.created_at)}</div>
        )}
        {asset.updated_at && (
          <div><strong>Updated At:</strong> {formatDisplayDate(asset.updated_at)}</div>
        )}
      </div>
    </div>
  );
}

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

export default AssetDetailsPage;
