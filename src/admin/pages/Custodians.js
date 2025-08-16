
import React, { useState, useEffect, useContext } from 'react';
import { SearchContext } from '../components/Navbar';
import './pages_styles/custodians.css';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, IconButton, Tooltip, Box, Typography } from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
// Removed duplicate imports from './pages_styles/components/'
import AddCustodianModal from '../components/AddCustodianModal';
import UserDetailModal from '../components/UserDetailModal';
import EditCustodianModal from '../components/EditCustodianModal';
import { advancedSearch } from '../../fuzzyFilter';
import './pages_styles/assets.css';

//const { ipcRenderer } = window.require('electron');
const ipcRenderer = window.electron && window.electron.ipcRenderer;


function Custodians() {
  // State to control if selection mode is active
  const [selectionMode, setSelectionMode] = useState(false);

  // Ref for table and toolbar to detect outside clicks
  const tableRef = React.useRef(null);
  const toolbarRef = React.useRef(null);
  const sidebarRef = React.useRef(null);

  // Click outside handler
  useEffect(() => {
    if (!selectionMode) return;
    const handleClick = (e) => {
      // If click is inside table, toolbar, or sidebar, do nothing
      if (
        (tableRef.current && tableRef.current.contains(e.target)) ||
        (toolbarRef.current && toolbarRef.current.contains(e.target)) ||
        (sidebarRef.current && sidebarRef.current.contains(e.target))
      ) {
        return;
      }
      setSelectionMode(false);
      setSelectedIds([]);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectionMode]);

  // Long press detection for mobile
  let longPressTimer = null;
  const handleNameMouseDown = () => {
    longPressTimer = setTimeout(() => setSelectionMode(true), 500);
  };
  const handleNameMouseUp = () => {
    clearTimeout(longPressTimer);
  };
  const handleNameMouseLeave = () => {
    clearTimeout(longPressTimer);
  };
  const handleNameDoubleClick = () => {
    setSelectionMode(true);
  };
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };
  // Bulk selection state for checkboxes
  const [selectedIds, setSelectedIds] = useState([]);
  const [custodians, setCustodians] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCustodian, setNewCustodian] = useState({
    id_no: '',
    image: '',
    name: '',
    position_designation: '',
    account_type: 'Viewer',
    email: '',
    phone: '',
    user_group: '',
    department: '',
    employment_status: '',
    system_status: '',
    date_registered: '',
    description: '',
  });
  const { search } = useContext(SearchContext);
  const [filteredCustodians, setFilteredCustodians] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustodian, setSelectedCustodian] = useState(null);

  // React imports and state setup

  useEffect(() => {
    loadCustodians();
  }, []);

  useEffect(() => {
    // Use fuzzyFilter for context-aware, case-insensitive search
    // if (search && search.trim()) {
    //   const fuzzyFilter = require('../../fuzzyFilter').default;
    //   setFilteredCustodians(fuzzyFilter(custodians, search, [
    //     'name',
    //     'department',
    //     'email',
    //     'phone_number',
    //     'description',
    //     'position_designation',
    //     // 'username' removed
    //     'group',
    //     'employment_status',
    //     'system_status',
    //   ]));
    // } else {
      setFilteredCustodians(custodians);
    // }
  }, [search, custodians]);

  // useEffect: Fetches custodian data from backend on mount

  const loadCustodians = async () => {
    try {
      setLoading(true);
      const result = await ipcRenderer.invoke('get-custodians');
      setCustodians(result || []);
    } catch (error) {
      console.error('Error loading custodians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustodian = async () => {
    try {
      if (!newCustodian.name || !newCustodian.email) {
        alert('Name and Email are required fields');
        return;
      }
      await ipcRenderer.invoke('add-custodian', newCustodian);
      setOpenDialog(false);
      setNewCustodian({
        id_no: '',
        image: '',
        name: '',
        position_designation: '',
        account_type: 'Viewer',
        email: '',
        phone: '',
        user_group: '',
        department: '',
        employment_status: '',
        system_status: '',
        date_registered: '',
        description: '',
      });
      loadCustodians();
    } catch (error) {
      console.error('Error adding custodian:', error);
      alert('Error adding custodian. Please try again.');
    }
  };

  const handleView = (custodian) => {
    setSelectedCustodian(custodian);
    setViewDialogOpen(true);
  };
  const handleEdit = (custodian) => {
    // Ensure account_type and user_group are always present and matched
    setSelectedCustodian({
      ...custodian,
      account_type: custodian.account_type || '',
      user_group: custodian.user_group || '',
    });
    setEditDialogOpen(true);
  };
  const handleEditSave = async () => {
    try {
      if (!selectedCustodian.name || !selectedCustodian.email) {
        alert('Name and Email are required fields');
        return;
      }
      await ipcRenderer.invoke('update-custodian', selectedCustodian);
      await loadCustodians(); // Ensure table is refreshed before closing modal
      setEditDialogOpen(false);
      setSelectedCustodian(null);
    } catch (error) {
      alert('Error updating user.');
    }
  };
  const handleDelete = async (custodian) => {
    if (!window.confirm(`Are you sure you want to delete custodian "${custodian.name}"?`)) return;
    try {
      await ipcRenderer.invoke('delete-custodian', custodian.id, custodian.name);
      loadCustodians();
    } catch (error) {
      alert('Error deleting custodian.');
    }
  };
  // Functions for handling add, edit, and delete actions

  // Checkbox selection handlers
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selectedIds.length === filteredCustodians.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustodians.map((c) => c.id));
    }
  };
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected custodians?`)) return;
    try {
      await ipcRenderer.invoke('delete-custodians-bulk', selectedIds);
      setSelectedIds([]);
      loadCustodians();
    } catch (error) {
      alert('Error deleting custodians.');
    }
  };
  return (
    <div className="custodians-root">
      <div className="custodians-header">
        <span>User Management</span>
      </div>
      <div className="custodians-table-wrapper">
        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666', fontSize: 14 }}>{selectedIds.length} record(s) selected</span>
            <button
              className="custodians-btn-primary"
              onClick={handleBulkDelete}
              style={{ background: '#e53935', color: '#fff', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 14 }}
            >
              DELETE SELECTED ({selectedIds.length})
            </button>
          </Box>
        )}
        {loading ? (
          <div className="assets-loading"><span className="spinner" /></div>
        ) : (
          <Box sx={{ height: 600, width: '100%' }} ref={tableRef}>
            <DataGrid
              rows={filteredCustodians.map((c, idx) => ({ ...c, idx }))}
              columns={[
                { field: 'idx', headerName: 'No.', width: 60, valueGetter: (params) => params.row.idx + 1 },
                { field: 'id_no', headerName: 'ID No.', width: 100 },
                { field: 'image', headerName: 'Image', width: 80, renderCell: (params) => params.value ? <img src={params.value} alt="profile" style={{width:32,height:32,borderRadius:'50%'}} /> : <span style={{color:'#bbb'}}>No Image</span> },
                { field: 'name', headerName: 'Name', width: 150 },
                { field: 'position_designation', headerName: 'Position/Designation', width: 150 },
                { field: 'account_type', headerName: 'Account Type', width: 120 },
                { field: 'email', headerName: 'Email', width: 180, renderCell: (params) => <a href={`mailto:${params.value}`} style={{ color: '#4fc3f7', textDecoration: 'underline' }}>{params.value}</a> },
                { field: 'phone', headerName: 'Phone #', width: 120 },
                { field: 'user_group', headerName: 'Group', width: 120 },
                { field: 'department', headerName: 'Department', width: 120 },
                { field: 'employment_status', headerName: 'Employment Status', width: 140 },
                { field: 'system_status', headerName: 'System Status', width: 120, renderCell: (params) => params.value && params.value.trim() !== '' ? params.value : '-' },
                { field: 'date_registered', headerName: 'Date Registered', width: 120, renderCell: (params) => {
                  const date = params.value || params.row.created_at;
                  if (!date) return '-';
                  try {
                    const d = new Date(date);
                    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
                  } catch {
                    return '-';
                  }
                } },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 140,
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleView(params.row)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="secondary" onClick={() => handleEdit(params.row)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(params.row)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }
              ]}
              getRowId={row => row.id}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={(newSelection) => setSelectedIds(newSelection)}
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
      <button
        className="custodians-fab"
        title="Add Custodian"
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon style={{ fontSize: 28, color: '#fff' }} />
      </button>
      <EditCustodianModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        custodian={selectedCustodian}
        onSave={handleEditSave}
        setCustodian={setSelectedCustodian}
      />
      <UserDetailModal open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} user={selectedCustodian} />
      {/* AddCustodianModal usage should be completed or removed if not needed. Placeholder below: */}
      <AddCustodianModal open={openDialog} onClose={() => setOpenDialog(false)} onAdd={handleAddCustodian} newCustodian={newCustodian} setNewCustodian={setNewCustodian} />
    </div>
  );
}
export default Custodians;