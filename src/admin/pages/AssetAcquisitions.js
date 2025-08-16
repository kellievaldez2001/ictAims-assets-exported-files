import React, { useState, useEffect, useContext } from 'react';
import { SearchContext, DateFilterContext } from '../components/Navbar';
import './pages_styles/AssetAcquisitions.css';
import AddAssetAcquisitionModal from '../components/AddAssetAcquisitionModal';
import EditAcquisitionsModal from '../components/EditAcquisitionsModal';
import AddAssetModal from '../components/AddAssetModal';
import { getOrCreateCustodianId } from './custodianUtils';
import MultiAssetEntryModal from '../components/MultiAssetEntryModal';
import QuantityReceivedModal from '../components/QuantityReceivedModal';
import generateQRCode from '../../qr';
import { calculateDepreciation, buildAssetForSave } from '../../utils/assetUtils';
import { 
  DataGrid, 
  GridToolbar, 
  GridActionsCellItem,
  GridRowSelectionModel,
  GridRowId
} from '@mui/x-data-grid';
import { 
  Button, 
  IconButton, 
  Tooltip, 
  Chip,
  Box,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

//const { ipcRenderer } = window.require('electron');
const ipcRenderer = window.electron && window.electron.ipcRenderer;

// Helper to filter PO receipt history
function filterPOReceiptHistory(records, poNumber) {
  return records.filter(r =>
    r.item === 'purchase_order' &&
    (r.action === 'update' || r.action === 'add') &&
    r.details &&
    r.details.includes(poNumber) &&
    /Received|Partially Received/i.test(r.details)
  );
}

const defaultAsset = {
  name: '',
  serial_number: '',
  status: '',
  category: '',
  category: '',
  description: '',
  acquisition_date: '',
  document_number: '',
  date_supplied: '',
  warranty_details: '',
  specs: '',
  department: '',
  location: '',
  custodian: '',
  purchase_cost: '',
  useful_life: '',
  depreciation_method: 'Straight-Line',
  annual_depreciation: '',
  accumulated_depreciation: '',
  book_value: '',
        supplier: '',
  supplier_contact_person: '',
  supplier_contact_number: '',
  supplier_email: '',
  supplier_address: ''
};

// Datatable columns configuration will be defined inside the component

function AssetAcquisitions() {
  const { dateFilter } = useContext(DateFilterContext);
  // Records state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { search } = useContext(SearchContext);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAcquisition, setSelectedAcquisition] = useState(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ ...defaultAsset });
  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  // Orders state (added)
  const [orders, setOrders] = useState([]);
  const [showMultiAssetModal, setShowMultiAssetModal] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [multiAssetQty, setMultiAssetQty] = useState(1);
  const [multiAssetTemplate, setMultiAssetTemplate] = useState({});
  const [pendingAssetDetails, setPendingAssetDetails] = useState([]);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Datatable state
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Define columns inside the component to access handler functions
  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      type: 'number',
      sortable: true,
      filterable: true
    },
    { 
      field: 'asset_name', 
      headerName: 'Asset Name', 
      width: 200,
      sortable: true,
      filterable: true,
      renderCell: (params) => (
        <Tooltip title={params.value || 'N/A'}>
          <Typography variant="body2" noWrap>
            {params.value || 'N/A'}
          </Typography>
        </Tooltip>
      )
    },
    { 
      field: 'supplier', 
      headerName: 'Supplier', 
      width: 150,
      sortable: true,
      filterable: true,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'N/A'} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 130,
      sortable: true,
      filterable: true,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'N/A'} 
          size="small" 
          variant="filled"
          color="secondary"
        />
      )
    },
    { 
      field: 'subcategory', 
      headerName: 'Subcategory', 
      width: 130,
      sortable: true,
      filterable: true,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'N/A'} 
          size="small" 
          variant="outlined"
          color="default"
        />
      )
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      renderCell: (params) => (
        <Chip 
          label={params.value || 0} 
          size="small" 
          variant="filled"
          color="success"
        />
      )
    },
    { 
      field: 'acquisition_date', 
      headerName: 'Acquisition Date', 
      width: 140,
      type: 'date',
      sortable: true,
      filterable: true,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        const date = typeof params.value === 'string' ? new Date(params.value) : params.value;
        return date.toLocaleDateString();
      }
    },
    { 
      field: 'remarks', 
      headerName: 'Remarks', 
      width: 150,
      sortable: true,
      filterable: true,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No remarks'}>
          <Typography variant="body2" noWrap>
            {params.value || 'No remarks'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewAcquisition(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => {
                setSelectedAcquisition(params.row);
                setEditDialogOpen(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteAcquisition(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Load asset acquisition records
  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ipcRenderer.invoke('get-asset-acquisitions');
      setRecords(result || []);
    } catch (err) {
      setError(err.message || 'Failed to load asset acquisitions');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRecords();
  }, []);
  // Load orders (from asset_acquisitions table via IPC)
  useEffect(() => {
    async function loadOrders() {
      try {
        if (window.electron && window.electron.ipcRenderer) {
          const orders = await window.electron.ipcRenderer.invoke('get-asset-acquisitions');
          setOrders(orders);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
        setOrders([]);
      }
    }
    loadOrders();
  }, []);

  // Multi-select row handler
  const handleRowSelect = (id) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds([id]);
    } else {
      setSelectedIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  // Multi-delete handler
  const handleMultiDelete = async () => {
    if (!window.confirm('Delete selected asset acquisitions?')) return;
    for (const id of selectedIds) {
      await ipcRenderer.invoke('delete-asset-acquisition', id);
    }
    setSelectedIds([]);
    setSelectionMode(false);
    loadRecords();
  };

  // Single delete handler
  const handleDeleteAcquisition = async (record) => {
    if (window.confirm('Are you sure you want to delete this asset acquisition?')) {
      try {
        await ipcRenderer.invoke('delete-asset-acquisition', record.id);
        await loadRecords();
        setSnackbar({ open: true, message: 'Asset acquisition deleted successfully', severity: 'success' });
      } catch (err) {
        console.error('Failed to delete asset acquisition:', err);
        setSnackbar({ open: true, message: 'Failed to delete asset acquisition', severity: 'error' });
      }
    }
  };

  const handleViewAcquisition = (record) => {
    setSelectedAcquisition(record);
    setViewDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (rowSelectionModel.length === 0) {
      setSnackbar({ open: true, message: 'Please select records to delete', severity: 'warning' });
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${rowSelectionModel.length} selected asset acquisition(s)?`)) {
      try {
        for (const id of rowSelectionModel) {
          await ipcRenderer.invoke('delete-asset-acquisition', id);
        }
        await loadRecords();
        setRowSelectionModel([]);
        setSnackbar({ open: true, message: `${rowSelectionModel.length} asset acquisition(s) deleted successfully`, severity: 'success' });
      } catch (err) {
        console.error('Failed to delete asset acquisitions:', err);
        setSnackbar({ open: true, message: 'Failed to delete some asset acquisitions', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Add handler (updated flow)
  const handleAddAcquisition = async (acquisition) => {
    // 1. Add acquisition record
    await ipcRenderer.invoke('add-asset-acquisition', acquisition);
    setAddDialogOpen(false);
    await loadRecords();
    // 2. Prepare to collect asset details for each piece
    const qty = parseInt(acquisition.quantity) || 1;
    // Map DB fields to frontend asset object
    const assetTemplate = {
      id: undefined,
      name: acquisition.asset_name,
      asset_name: acquisition.asset_name,
      category: acquisition.category,
      subcategory: acquisition.subcategory,
      serial_number: acquisition.serial_number,
      department: acquisition.department,
      location: acquisition.location,
      custodian: acquisition.custodian,
      status: acquisition.status || 'Available',
      purchase_cost: acquisition.unit_cost,
      acquisition_date: acquisition.acquisition_date,
      description: acquisition.description,
      useful_life: acquisition.useful_life,
      depreciation_method: acquisition.depreciation_method,
      annual_depreciation: acquisition.annual_depreciation,
      accumulated_depreciation: acquisition.accumulated_depreciation,
      book_value: acquisition.book_value,
      supplier: acquisition.supplier,
      supplier_contact_person: acquisition.supplier_contact_person,
      supplier_contact_number: acquisition.supplier_contact_number,
      supplier_email: acquisition.supplier_email,
      supplier_address: acquisition.supplier_address,
      updated_at: acquisition.updated_at,
      remarks: acquisition.remarks,
      document_number: acquisition.document_number
    };
    setPendingAssetDetails(Array.from({ length: qty }, () => ({ ...assetTemplate })));
    setCurrentAssetIndex(0);
    setNewAsset(assetTemplate);
    setShowAddAssetModal(true);
  };

  // Edit handler
  const handleEditAcquisition = async (acquisition) => {
    try {
      console.log('Editing acquisition:', acquisition);
      const result = await ipcRenderer.invoke('update-asset-acquisition', acquisition);
      console.log('Edit result:', result);
      setEditDialogOpen(false);
      setSelectedAcquisition(null);
      await loadRecords();
      setSnackbar({ open: true, message: 'Asset acquisition updated successfully', severity: 'success' });
    } catch (err) {
      console.error('Failed to update asset acquisition:', err);
      setSnackbar({ open: true, message: 'Failed to update asset acquisition: ' + err.message, severity: 'error' });
    }
  };
  // Load orders (added)

  // Filter records using global search
  let filteredRecords = records;
  if (search && search.trim()) {
    const s = String(search).toLowerCase();
    filteredRecords = records.filter(record =>
      (record.asset_name && String(record.asset_name).toLowerCase().includes(s)) ||
      (record.supplier && String(record.supplier).toLowerCase().includes(s)) ||
      (record.category && String(record.category).toLowerCase().includes(s)) ||
      (record.subcategory && String(record.subcategory).toLowerCase().includes(s)) ||
      (record.remarks && String(record.remarks).toLowerCase().includes(s)) ||
      (record.quantity !== undefined && String(record.quantity).toLowerCase().includes(s))
    );
  }
  // Calendar date filter
  function matchesDateFilter(record, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    if (!record.acquisition_date) return false;
    const date = new Date(record.acquisition_date);
    if (filter.year && date.getFullYear() !== filter.year) return false;
    if (filter.month && (date.getMonth() + 1) !== filter.month) return false;
    if (filter.day && date.getDate() !== filter.day) return false;
    return true;
  }
  filteredRecords = filteredRecords.filter(r => matchesDateFilter(r, dateFilter));

  return (
    <div className="asset-acquisitions-root">
      <div className="asset-acquisitions-header">
        <span>Asset Acquisitions</span>
      </div>
      {/* Search bar removed, now handled by Navbar */}
      <div className="asset-acquisitions-table-wrapper">
        {loading ? (
          <div style={{ padding: 16 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red', padding: 16 }}>{error}</div>
        ) : (
          <>
            {/* Bulk Actions */}
            {rowSelectionModel.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {rowSelectionModel.length} record(s) selected
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  size="small"
                >
                  DELETE SELECTED ({rowSelectionModel.length})
                </Button>
              </Box>
            )}
            
            {/* Material-UI DataGrid */}
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={filteredRecords}
                columns={columns}
                loading={loading}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newRowSelectionModel) => {
                  setRowSelectionModel(newRowSelectionModel);
                }}
                slots={{
                  toolbar: GridToolbar,
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                  sorting: {
                    sortModel: [{ field: 'id', sort: 'desc' }],
                  },
                }}
                sx={{
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                    borderBottom: '2px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: '#ffffff',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />
            </Box>
          </>
        )}
      </div>
      {/* Add Asset Acquisition Modal */}
      <AddAssetAcquisitionModal
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddAcquisition}
      />
      {/* Edit Asset Acquisition Modal */}
      <EditAcquisitionsModal
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setSelectedAcquisition(null); }}
        onSubmit={handleEditAcquisition}
        initialAcquisition={selectedAcquisition}
      />
      {/* View Asset Acquisition Modal (MUI Dialog) */}
      <Dialog open={viewDialogOpen && !!selectedAcquisition} onClose={() => { setViewDialogOpen(false); setSelectedAcquisition(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>View Asset Acquisition</DialogTitle>
        <DialogContent dividers>
          {selectedAcquisition && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ fontWeight: 'bold', width: 140 }}>Asset Name:</td><td>{selectedAcquisition.asset_name}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Supplier:</td><td>{selectedAcquisition.supplier}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Category:</td><td>{selectedAcquisition.category}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Subcategory:</td><td>{selectedAcquisition.subcategory}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Quantity:</td><td>{selectedAcquisition.quantity}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Acquisition Date:</td><td>{selectedAcquisition.acquisition_date ? (typeof selectedAcquisition.acquisition_date === 'string' ? selectedAcquisition.acquisition_date.slice(0, 10) : new Date(selectedAcquisition.acquisition_date).toLocaleDateString()) : ''}</td></tr>
                <tr><td style={{ fontWeight: 'bold' }}>Remarks:</td><td>{selectedAcquisition.remarks}</td></tr>
              </tbody>
            </table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setViewDialogOpen(false); setSelectedAcquisition(null); }} color="primary">CLOSE</Button>
        </DialogActions>
      </Dialog>
      {/* Add Asset Modal (shown after PO status set to Received) */}
      <AddAssetModal
        open={showAddAssetModal}
        onClose={() => {
          setShowAddAssetModal(false);
          setNewAsset(null);
          setPendingAssetDetails([]);
          setCurrentAssetIndex(0);
        }}
        newAsset={newAsset || { status: 'Available' }}
        setNewAsset={setNewAsset}
        progressLabel={pendingAssetDetails.length > 1 ? `${currentAssetIndex + 1}/${pendingAssetDetails.length}` : ''}
        onSubmit={async (asset) => {
          // Ensure custodian_id is set if custodian name is provided
          let custodian_id = null;
          if (asset.custodian) {
            custodian_id = await getOrCreateCustodianId(asset.custodian, ipcRenderer);
          }
          const assetToAdd = buildAssetForSave({ ...asset, custodian_id });
          await ipcRenderer.invoke('add-asset', assetToAdd);
          // Always refresh records after each add
          await loadRecords();
          // If more assets to enter, show next
          if (pendingAssetDetails.length > 1 && currentAssetIndex < pendingAssetDetails.length - 1) {
            setCurrentAssetIndex(currentAssetIndex + 1);
            // Reset serial number and other user-input fields for next asset
            const nextAsset = { ...pendingAssetDetails[currentAssetIndex + 1] };
            nextAsset.serial_number = '';
            setNewAsset(nextAsset);
          } else {
            setShowAddAssetModal(false);
            setNewAsset(null);
            setPendingAssetDetails([]);
            setCurrentAssetIndex(0);
          }
        }}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Add Asset Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: 'fixed',
          right: 36,
          bottom: 36,
          width: 56,
          height: 56,
          borderRadius: '50%',
          minWidth: 'unset',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1201,
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          }
        }}
        onClick={() => setAddDialogOpen(true)}
        title="Add Asset Acquisition"
      >
        <AddIcon />
      </Button>
    </div>
  );

}

export default AssetAcquisitions;

