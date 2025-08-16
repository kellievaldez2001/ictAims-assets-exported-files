import React, { useState, useEffect, useContext } from 'react';
import { DateFilterContext, SearchContext } from '../components/Navbar';
import { 
  DataGrid, 
  GridToolbar 
} from '@mui/x-data-grid';
import { 
  Button, 
  IconButton, 
  Tooltip, 
  Box,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';

import AddStockAdjustmentModal from '../components/AddStockAdjustmentModal';
import ViewStockAdjustmentModal from '../components/ViewStockAdjustmentModal';
import './pages_styles/StockAdjustments.css';

const ipcRenderer = window.electron && window.electron.ipcRenderer;

function StockAdjustments() {
  const [selectionModel, setSelectionModel] = useState([]);
  const { dateFilter } = useContext(DateFilterContext);
  const { search } = useContext(SearchContext);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [newAdjustment, setNewAdjustment] = useState({
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Define columns inside the component to access handler functions
  const columns = [
    {
      field: 'department',
      headerName: 'Department',
      width: 130,
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
      field: 'location',
      headerName: 'Location',
      width: 130,
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
      field: 'custodian',
      headerName: 'Custodian',
      width: 130,
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
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      type: 'number',
      sortable: true,
      filterable: true
    },
    {
      field: 'asset_id',
      headerName: 'Asset ID',
      width: 110,
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
      field: 'serial_number', 
      headerName: 'Serial Number', 
      width: 150,
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
      field: 'category', 
      headerName: 'Category', 
      width: 130,
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
      field: 'subcategory',
      headerName: 'Subcategory',
      width: 130,
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
      field: 'adjustment_type', 
      headerName: 'Adjustment Type', 
      width: 130,
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
      field: 'reason', 
      headerName: 'Reason', 
      width: 150,
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
      field: 'adjustment_date', 
      headerName: 'Adjustment Date', 
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
  // 'Created By' column removed as requested
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleView(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const loadAdjustments = () => {
    setLoading(true);
    ipcRenderer.invoke('get-stock-adjustments')
      .then(data => {
        setAdjustments(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch stock adjustments');
        setLoading(false);
      });
  };

  const handleView = async (adjustment) => {
    // Fetch asset details by asset_id and merge into adjustment
    let mergedAdjustment = { ...adjustment };
    if (adjustment.asset_id) {
      try {
        const assetsList = await ipcRenderer.invoke('get-assets');
        const asset = assetsList.find(a => a.id == adjustment.asset_id);
        if (asset) {
          mergedAdjustment = {
            ...asset,
            ...adjustment, // adjustment fields override asset fields if duplicate
          };
        }
      } catch (err) {
        // If error, just use adjustment as is
      }
    }
    setSelectedAdjustment(mergedAdjustment);
    setViewDialogOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
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
  };

  useEffect(() => {
    loadAdjustments();
  }, []);

  // Filter adjustments using global search and date filter
  let filteredAdjustments = adjustments;
  
  // Search filter
  if (search && search.trim()) {
    const s = String(search).toLowerCase();
    filteredAdjustments = adjustments.filter(adjustment =>
      (adjustment.asset_name && String(adjustment.asset_name).toLowerCase().includes(s)) ||
      (adjustment.serial_number && String(adjustment.serial_number).toLowerCase().includes(s)) ||
      (adjustment.category && String(adjustment.category).toLowerCase().includes(s)) ||
      (adjustment.adjustment_type && String(adjustment.adjustment_type).toLowerCase().includes(s)) ||
      (adjustment.reason && String(adjustment.reason).toLowerCase().includes(s)) ||
      (adjustment.created_by && String(adjustment.created_by).toLowerCase().includes(s))
    );
  }

  // Calendar date filter
  function matchesDateFilter(adj, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    if (!adj.adjustment_date) return false;
    const date = new Date(adj.adjustment_date);
    if (filter.year && date.getFullYear() !== filter.year) return false;
    if (filter.month && (date.getMonth() + 1) !== filter.month) return false;
    if (filter.day && date.getDate() !== filter.day) return false;
    return true;
  }
  filteredAdjustments = filteredAdjustments.filter(a => matchesDateFilter(a, dateFilter));

    return (
      <div className="asset-acquisitions-root">
        <div className="asset-acquisitions-header">
          <span>Stock Adjustments</span>
        </div>
        <div className="asset-acquisitions-table-wrapper">
          {loading ? (
            <div style={{ padding: 16 }}>Loading...</div>
          ) : error ? (
            <div style={{ color: 'red', padding: 16 }}>{error}</div>
          ) : (
            <>
              {selectionModel.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectionModel.length} record(s) selected
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={async () => {
                      if (!window.confirm(`Delete ${selectionModel.length} selected record(s)?`)) return;
                      try {
                        for (const id of selectionModel) {
                          await ipcRenderer.invoke('delete-stock-adjustment', id);
                        }
                        setSnackbar({ open: true, message: `Deleted ${selectionModel.length} record(s)`, severity: 'success' });
                        setSelectionModel([]);
                        loadAdjustments();
                      } catch (err) {
                        setSnackbar({ open: true, message: 'Failed to delete selected: ' + (err.message || err), severity: 'error' });
                      }
                    }}
                    size="small"
                  >
                    DELETE SELECTED ({selectionModel.length})
                  </Button>
                </Box>
              )}
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={filteredAdjustments}
                  columns={columns}
                  loading={loading}
                  checkboxSelection
                  disableRowSelectionOnClick
                  selectionModel={selectionModel}
                  onRowSelectionModelChange={setSelectionModel}
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
        <AddStockAdjustmentModal
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            resetForm();
          }}
          onSubmit={async (adjustment) => {
            try {
              await ipcRenderer.invoke('add-stock-adjustment', adjustment);
              setAddDialogOpen(false);
              resetForm();
              loadAdjustments();
              setSnackbar({ open: true, message: 'Stock adjustment added successfully', severity: 'success' });
            } catch (err) {
              console.error('Failed to add stock adjustment:', err);
              setSnackbar({ open: true, message: 'Failed to add stock adjustment: ' + err.message, severity: 'error' });
            }
          }}
          newAdjustment={newAdjustment}
          setNewAdjustment={setNewAdjustment}
        />
        <ViewStockAdjustmentModal
          open={viewDialogOpen}
          onClose={() => { setViewDialogOpen(false); setSelectedAdjustment(null); }}
          adjustment={selectedAdjustment}
        />
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
          title="Add Stock Adjustment"
        >
          <AddIcon />
        </Button>
      </div>
    );
  
}

export default StockAdjustments;
