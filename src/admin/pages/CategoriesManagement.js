import React, { useState, useEffect, useRef, useContext } from 'react';
import { SearchContext } from '../components/Navbar';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Add as AddIcon } from '@mui/icons-material';
import ViewCategoryModal from '../components/ViewCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal';
import AddCategoryModal from '../components/AddCategoryModal';
import './pages_styles/CategoriesManagement.css';
const ipcRenderer = window.electron && window.electron.ipcRenderer ? window.electron.ipcRenderer : null;


function CategoriesManagement() {
  const [selectedIds, setSelectedIds] = useState([]);

  // Multi-delete handler
  const handleMultiDelete = async () => {
    if (selectedIds.length === 0) {
      alert('No categories selected for deletion.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected categories?`)) return;
    try {
      await ipcRenderer.invoke('delete-categories-bulk', selectedIds);
      // Refresh categories
      const data = await ipcRenderer.invoke('get-categories');
      setCategories(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (err) {
      alert('Failed to delete selected categories: ' + (err?.message || err));
    }
  };
  const [categories, setCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('az');
  const [openDropdown, setOpenDropdown] = useState(null); // category id for open dropdown
  const [subcatList, setSubcatList] = useState({}); // { [category_name]: [subcat1, subcat2, ...] }
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const dropdownRefs = useRef({});
  const { search } = useContext(SearchContext) || {};

  useEffect(() => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('get-categories').then((data) => {
      console.log('[CategoriesManagement] Received from backend:', data);
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);


  // Fetch subcategories for a category from backend
  const fetchSubcategories = async (categoryName) => {
    if (!ipcRenderer) return;
    if (subcatList[categoryName]) return; // already fetched
    const result = await ipcRenderer.invoke('get-subcategories-for-category', categoryName);
    setSubcatList((prev) => ({ ...prev, [categoryName]: result || [] }));
  };

  // Filter and sort
  let filteredCategories = categories;
  filteredCategories = [...filteredCategories].sort((a, b) => {
    if (sortOrder === 'az') {
      return (a.category_name || '').localeCompare(b.category_name || '');
    } else {
      return (b.category_name || '').localeCompare(a.category_name || '');
    }
  });

  // DataGrid columns
  const columns = [
    { field: 'idx', headerName: '#', width: 60, valueGetter: (params) => params.row.idx + 1 },
    { field: 'category_name', headerName: 'Category', width: 180 },
    { field: 'description', headerName: 'Description', width: 200, renderCell: (params) => params.value || '-' },
    { field: 'asset_count', headerName: 'Asset Count', width: 120, renderCell: (params) => params.value != null ? params.value : 0 },
    {
      field: 'subcategories',
      headerName: 'Subcategories',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const category = params.row;
        const isOpen = openDropdown === category.id;
        return (
          <Box sx={{ position: 'relative', width: '100%' }}>
            {category.subcategories != null ? category.subcategories : 0}
            {/* ...existing code for subcategory dropdown button and dropdown... */}
          </Box>
        );
      }
    },
    {
      field: 'date_created',
      headerName: 'Date Created',
      width: 140,
      renderCell: (params) => params.value ? (typeof params.value === 'string' ? params.value.slice(0, 10) : new Date(params.value).toLocaleDateString()) : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View">
            <span>
              <IconButton size="small" color="primary" onClick={() => { setSelectedCategory(params.row); setViewModalOpen(true); }}>
                <VisibilityIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit">
            <span>
              <IconButton size="small" color="secondary" onClick={() => { setSelectedCategory(params.row); setEditModalOpen(true); }}>
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete">
            <span>
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Save handler for edit modal
  const handleEditSave = async (updatedCategory) => {
    // Update in backend
    if (ipcRenderer && updatedCategory && updatedCategory.id) {
      await ipcRenderer.invoke('update-category', updatedCategory);
      // Refresh categories
      const data = await ipcRenderer.invoke('get-categories');
      setCategories(Array.isArray(data) ? data : []);
    }
    setEditModalOpen(false);
    setSelectedCategory(null);
  };

  // Save handler for add modal
  const handleAddSave = async (newCategory) => {
    if (ipcRenderer && newCategory && newCategory.name) {
      await ipcRenderer.invoke('add-category', newCategory);
      // Refresh categories
      const data = await ipcRenderer.invoke('get-categories');
      setCategories(Array.isArray(data) ? data : []);
    }
    setAddModalOpen(false);
  };

  // Debug: log the rows that will be passed to DataGrid and check for id issues
  const dataGridRows = filteredCategories.map((cat, idx) => ({ ...cat, idx }));
  // ...existing debug logs...

  // Check for missing or duplicate ids
  const ids = dataGridRows.map(row => row.id);
  const missingId = dataGridRows.some(row => row.id === undefined || row.id === null);
  const duplicateIds = ids.length !== new Set(ids).size;
  if (missingId) {
    console.warn('[CategoriesManagement] WARNING: One or more rows are missing an id field. DataGrid will not display these rows.');
  }
  if (duplicateIds) {
    console.warn('[CategoriesManagement] WARNING: Duplicate id values found in rows. DataGrid requires unique ids.');
  }

  // --- STRUCTURE AND CSS MATCHING AssetAcquisitions.js ---
  return (
    <div className="categories-management-root">
      <div className="categories-management-header">
        <span>Categories</span>
      </div>
      <div className="categories-management-table-wrapper">
        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666', fontSize: 14 }}>{selectedIds.length} record(s) selected</span>
            <button
              className="categories-management-btn-primary"
              onClick={handleMultiDelete}
              style={{ background: '#e53935', color: '#fff', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 14 }}
            >
              DELETE SELECTED ({selectedIds.length})
            </button>
          </Box>
        )}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={dataGridRows}
            columns={columns}
            getRowId={row => row.id}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={ids => setSelectedIds(ids)}
            rowSelectionModel={selectedIds}
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
      </div>
      <button
        className="categories-management-fab"
        title="Add Category"
        onClick={() => setAddModalOpen(true)}
      >
        <AddIcon style={{ fontSize: 28, color: '#fff' }} />
      </button>
      <AddCategoryModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddSave} />
      <ViewCategoryModal open={viewModalOpen} category={selectedCategory} onClose={() => { setViewModalOpen(false); setSelectedCategory(null); }} />
      <EditCategoryModal open={editModalOpen} category={selectedCategory} onClose={() => { setEditModalOpen(false); setSelectedCategory(null); }} onSave={handleEditSave} />
    </div>
  );
}

export default CategoriesManagement;
