
import React, { useState, useEffect, useContext } from 'react';
import { DateFilterContext } from '../components/Navbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddStockAdjustmentModal from '../components/AddStockAdjustmentModal';
import AssetDetailsModal from '../components/AssetDetailsModal';
import EditAssetModal from '../components/EditAssetModal';
// If you use handleGenerateAR, statusOptions, custodians, assets, filteredAssets, setCategoryFilter, setSubCategoryFilter, setStatusFilter, setSelectedIds, setSelectionMode, adjustmentModalState, setAdjustmentModalState, handleAdjustmentSubmit, openQRDialog, qrAsset, handleView, handleAdjust, handleDelete, editAsset, editDialogOpen, setEditAsset, setEditDialogOpen, loading, error, selectionMode, selectedIds, etc., make sure they are defined or imported as needed.


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

const ipcRenderer = window.electron && window.electron.ipcRenderer;

function Assets() {
  // Handle stock adjustment submission from AddStockAdjustmentModal
  const handleAdjustmentSubmit = async (adjustmentData) => {
    try {
      // Save adjustment to database (replace with your actual IPC call)
      await ipcRenderer.invoke('add-stock-adjustment', adjustmentData);
      setOpenAdjustmentModal(false);
      setAssetToAdjust(null);
      setAdjustmentModalState({
        asset_id: '',
        serial_number: '',
        adjustment_type: '',
        reason: '',
        remarks: ''
      });
      // Optionally reload assets
      const assetsData = await ipcRenderer.invoke('get-assets');
      setAssets(assetsData || []);
      setError(null);
    } catch (err) {
      setError('Failed to submit stock adjustment: ' + (err.message || 'Unknown error'));
    }
  };
  // --- Action handlers for DataGrid actions column ---
  // View asset details
  const handleView = (asset) => {
    setSelectedAsset(asset);
    setOpenDetailsModal(true);
  };

  // Open stock adjustment modal
  const handleAdjust = (asset) => {
    setAssetToAdjust(asset);
    setOpenAdjustmentModal(true);
  };

  // Delete asset from database and update state
  const handleDelete = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await ipcRenderer.invoke('delete-asset', assetId);
      setAssets(prev => prev.filter(a => a.id !== assetId));
      setFilteredAssets(prev => prev.filter(a => a.id !== assetId));
      setError(null);
    } catch (err) {
      setError('Failed to delete asset: ' + (err.message || 'Unknown error'));
    }
  };
  const { dateFilter } = useContext(DateFilterContext);

  // --- State definitions for assets management ---
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statusOptions, setStatusOptions] = useState(['Available', 'In Use']);
  const [custodians, setCustodians] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [adjustmentModalState, setAdjustmentModalState] = useState({
    asset_id: '',
    serial_number: '',
    adjustment_type: '',
    reason: '',
    remarks: ''
  });
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [qrAsset, setQRAsset] = useState(null);
  const [custodianFilter, setCustodianFilter] = useState('');

  // --- Example effect to load assets (replace with your actual data loading logic) ---
  useEffect(() => {
    setLoading(true);
    // Example: fetch assets and custodians from backend or IPC
    async function fetchData() {
      try {
        // Replace with your actual data fetching logic
        const assetsData = await ipcRenderer.invoke('get-assets');
        const custodiansData = await ipcRenderer.invoke('get-custodians');
        setAssets(assetsData || []);
        setCustodians(custodiansData || []);
        setError(null);
      } catch (err) {
        setError('Failed to load assets or custodians.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- Example effect to filter assets based on filters ---
  useEffect(() => {
    let filtered = assets;
    if (custodianFilter) filtered = filtered.filter(a => a.custodian === custodianFilter);
    if (categoryFilter) filtered = filtered.filter(a => a.category === categoryFilter);
    if (subCategoryFilter) filtered = filtered.filter(a => a.subcategory === subCategoryFilter);
    if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
    setFilteredAssets(filtered);
  }, [assets, custodianFilter, categoryFilter, subCategoryFilter, statusFilter]);
  
  // Check if ipcRenderer is available
  if (!ipcRenderer) {
    console.error('ipcRenderer not available in Assets component');
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: IPC not available. Cannot load assets.
      </div>
    );
  }
  // Modal state for action handling
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [assetToAdjust, setAssetToAdjust] = useState(null);
  const [openAdjustmentModal, setOpenAdjustmentModal] = useState(false);


  const handleMultiDelete = async () => {
    if (selectedIds.length === 0) {
      setError('No assets selected for deletion.');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedIds.length} selected asset(s)?`);
    if (!confirmed) return;
    try {
      // Use bulk delete for better performance
      await ipcRenderer.invoke('delete-assets-bulk', selectedIds);
      // Remove deleted assets from state
      setAssets(prev => prev.filter(a => !selectedIds.includes(a.id)));
      setFilteredAssets(prev => prev.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      setError(null);
    } catch (error) {
      console.error('Failed to delete selected assets:', error);
      setError('Failed to delete some assets: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEdit = (asset) => {
    if (!asset || !asset.id) {
      setError('Invalid asset selected for editing.');
      return;
    }
    setEditAsset(asset);
    setEditDialogOpen(true);
  };

  const handleSaveEditAsset = async (updatedAsset) => {
    if (!updatedAsset || !updatedAsset.id) {
      setError('Invalid asset data for saving.');
      return;
    }
    try {
      // Ensure acquisition_date and date_supplied are strings in YYYY-MM-DD format
      let assetForSave = { ...updatedAsset };
      // acquisition_date
      if (assetForSave.acquisition_date instanceof Date) {
        assetForSave.acquisition_date = assetForSave.acquisition_date.toISOString().slice(0, 10);
      } else if (typeof assetForSave.acquisition_date === 'number') {
        assetForSave.acquisition_date = new Date(assetForSave.acquisition_date).toISOString().slice(0, 10);
      } else if (assetForSave.acquisition_date && typeof assetForSave.acquisition_date === 'object' && assetForSave.acquisition_date.toISOString) {
        assetForSave.acquisition_date = assetForSave.acquisition_date.toISOString().slice(0, 10);
      } else if (typeof assetForSave.acquisition_date !== 'string') {
        assetForSave.acquisition_date = '';
      }
      // date_supplied
      if (assetForSave.date_supplied instanceof Date) {
        assetForSave.date_supplied = assetForSave.date_supplied.toISOString().slice(0, 10);
      } else if (typeof assetForSave.date_supplied === 'number') {
        assetForSave.date_supplied = new Date(assetForSave.date_supplied).toISOString().slice(0, 10);
      } else if (assetForSave.date_supplied && typeof assetForSave.date_supplied === 'object' && assetForSave.date_supplied.toISOString) {
        assetForSave.date_supplied = assetForSave.date_supplied.toISOString().slice(0, 10);
      } else if (assetForSave.date_supplied && typeof assetForSave.date_supplied !== 'string') {
        assetForSave.date_supplied = '';
      }
      // Save the updated asset to the database
      await ipcRenderer.invoke('update-asset', assetForSave);
      // Refresh the asset list
      let assetsData = await ipcRenderer.invoke('get-assets');
      // Ensure both 'name' and 'asset_name' are set for each asset
      assetsData = (assetsData || []).map(asset => ({
        ...asset,
        name: asset.name || asset.asset_name || '',
        asset_name: asset.asset_name || asset.name || ''
      }));
      setAssets(assetsData);
      setEditDialogOpen(false);
      setEditAsset(null);
      setError(null);
    } catch (error) {
      console.error('Failed to save asset:', error);
      setError('Failed to save asset: ' + (error.message || 'Unknown error'));
    }
  };

// Returns the custodian name for a given asset, or 'Not Assigned' if truly missing
const getCustodianName = (custodianId) => {
  if (!assets || !Array.isArray(assets)) return 'Not Assigned';
  // Find asset with matching custodian_id
  const asset = assets.find(a => a.custodian_id === custodianId);
  // If asset has a non-empty custodian, return it
  if (asset && asset.custodian && asset.custodian.trim() !== '') return asset.custodian;
    // If asset has a custodian_id, try to find the name from custodians list
    if (custodianId) {
      const custodian = custodians.find(c => c.id === custodianId);
      if (custodian && custodian.name && custodian.name.trim() !== '') return custodian.name;
    }
    return 'Not Assigned';
  };

  // --- Main render ---
  return (
    <div className="asset-acquisitions-root">
      <div className="asset-acquisitions-header">
        <span>Assets Management</span>
      </div>
      <div className="asset-acquisitions-table-wrapper">
        {loading ? (
          <div className="assets-loading"><span className="spinner" /></div>
        ) : (
          <Box sx={{ height: 600, width: '100%' }}>
            {/* ...existing DataGrid logic... */}
            <DataGrid
              rows={filteredAssets.map((asset, idx) => ({ ...asset, idx }))}
              columns={[
                { field: 'idx', headerName: '#', width: 60, valueGetter: (params) => params.row.idx + 1 },
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'name', headerName: 'Asset Name', width: 160, renderCell: (params) => params.row.name || params.row.asset_name || '' },
                { field: 'category', headerName: 'Category', width: 120 },
                { field: 'subcategory', headerName: 'Sub-Category', width: 140 },
                { field: 'department', headerName: 'Department', width: 140, renderCell: (params) => params.value || '-' },
                { field: 'location', headerName: 'Location', width: 120, renderCell: (params) => params.value || '-' },
                { field: 'status', headerName: 'Status', width: 110, renderCell: (params) => (
                  <span className={`status-chip status-${(params.value || '').toLowerCase().replace(/ /g, '-')}`}>{params.value}</span>
                ) },
                { field: 'custodian', headerName: 'Custodian', width: 140, renderCell: (params) => (params.value && params.value.trim() !== '' ? params.value : 'Not Assigned') },
                { field: 'updated_at', headerName: 'Date Updated', width: 130, renderCell: (params) => params.value ? formatDisplayDate(params.value) : '-' },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 140,
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <span>
                          <IconButton size="small" color="primary" onClick={() => handleView(params.row)}>
                            <VisibilityIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Adjust Stock">
                        <span>
                          <IconButton size="small" color="secondary" onClick={() => handleAdjust(params.row)}>
                            <AddIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <span>
                          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  )
                }
              ]}
              getRowId={row => row.id}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(ids) => {
                setSelectedIds(ids);
              }}
              selectionModel={selectedIds}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{
                '& .MuiDataGrid-root': { border: 'none' },
                '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' },
                '& .MuiDataGrid-virtualScroller': { backgroundColor: '#ffffff' },
                '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' },
              }}
            />
          </Box>
        )}
      </div>
      {/* ...existing modals and dialogs, unchanged... */}
      
      {/* ...existing modals and dialogs, unchanged... */}
      {selectionMode && (
        <div className="assets-multiselect-row">
          <button className="assets-multiselect-btn" onClick={() => setSelectedIds(filteredAssets.map(a => a.id))}>
            Select All Filtered ({filteredAssets.length})
          </button>
          <button className="assets-generate-ar-btn" onClick={handleGenerateAR}>
            Generate AR for Selected ({selectedIds.length})
          </button>
          <button className="assets-clear-btn" onClick={() => { setSelectedIds([]); setSelectionMode(false); }}>
            Cancel
          </button>
          <button className="multidelete-btn" onClick={handleMultiDelete}>
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}
      {/* ...existing modals and dialogs, unchanged... */}
      {assetToAdjust && assetToAdjust.serial_number && openAdjustmentModal && (
        <AddStockAdjustmentModal
          open={openAdjustmentModal}
          asset={assetToAdjust}
          onClose={() => {
            setOpenAdjustmentModal(false);
            setAssetToAdjust(null);
            setAdjustmentModalState({
              asset_id: '',
              serial_number: '',
              adjustment_type: '',
              reason: '',
              remarks: ''
            });
          }}
          newAdjustment={adjustmentModalState}
          setNewAdjustment={setAdjustmentModalState}
          isEdit={false}
          onSubmit={handleAdjustmentSubmit}
        />
      )}
      {selectedAsset && openDetailsModal && (
        <AssetDetailsModal
          open={openDetailsModal}
          asset={selectedAsset}
          onClose={() => setOpenDetailsModal(false)}
          onEdit={() => {
            setOpenDetailsModal(false);
            handleEdit(selectedAsset);
          }}
          onViewAsset={handleView}
          getCustodianName={getCustodianName}
        />
      )}
      {editAsset && editDialogOpen && (
        <EditAssetModal
          open={editDialogOpen}
          asset={editAsset}
          onClose={() => {
            setEditDialogOpen(false);
            setEditAsset(null);
          }}
          onSave={handleSaveEditAsset}
          statusOptions={statusOptions}
          custodians={custodians}
          assets={assets}
        />
      )}
      {openQRDialog && qrAsset && (
        <div className="assets-modal-overlay">
          <div className="assets-modal qr-modal">
            <div className="assets-modal-header">
              <span className="assets-modal-title">QR Code</span>
              <button className="assets-modal-close" onClick={() => setOpenQRDialog(false)}>&times;</button>
            </div>
            <div className="assets-modal-content qr-content">
              <img src={qrAsset.qr_image} alt="QR Code" className="qr-image" />
              <div className="qr-info">
                <div className="qr-row"><strong>Asset:</strong> {qrAsset.name}</div>
                <div className="qr-row"><strong>Serial:</strong> {qrAsset.serial_number}</div>
                <div className="qr-row"><strong>Sub-Category:</strong> {qrAsset.category}</div>
                <div className="qr-row"><strong>Status:</strong> {qrAsset.status}</div>
                <div className="qr-row"><strong>Location:</strong> {qrAsset.location}</div>
                <div className="qr-row"><strong>Custodian:</strong> {getCustodianName(qrAsset.custodian_id)}</div>
                <div className="qr-row"><strong>Acquired:</strong> {qrAsset.acquisition_date}</div>
                <div className="qr-row">
                  <strong>Public Link:</strong>
                  <a
                    href={`#/asset/${qrAsset.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4fc3f7', textDecoration: 'underline', cursor: 'pointer', marginRight: 8 }}
                  >
                    {window.location.origin + '/#/asset/' + qrAsset.id}
                  </a>
                  <button
                    style={{ padding: '2px 8px', fontSize: 12, cursor: 'pointer', marginLeft: 4 }}
                    onClick={() => {
                      const url = window.location.origin + '/#/asset/' + qrAsset.id;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(url);
                        alert('Link copied!');
                      } else {
                        // fallback
                        const input = document.createElement('input');
                        input.value = url;
                        document.body.appendChild(input);
                        input.select();
                        document.execCommand('copy');
                        document.body.removeChild(input);
                        alert('Link copied!');
                      }
                    }}
                  >Copy Link</button>
                </div>
              </div>
            </div>
            <div className="assets-modal-actions">
              <button className="assets-btn-primary" onClick={() => setOpenQRDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="assets-snackbar error">
          {error}
        </div>
      )}
    </div>
  );
}

export default Assets;