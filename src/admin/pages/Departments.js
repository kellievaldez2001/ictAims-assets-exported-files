// Bulk delete handler will be declared inside the Departments function
import React, { useEffect, useState, useContext, useRef } from 'react';
import ReactDOM from 'react-dom';
import AddDepartmentModal from '../components/AddDepartmentModal';
import EditDepartmentModal from '../components/EditDepartmentModal';
// Departments.js - Page for Managing Departments
// This React component displays and manages departments in the inventory system. It fetches department data from the backend via Electron IPC, allows adding/editing/deleting departments, and displays them in a table.
//
// Key responsibilities:
// - Fetch and display department data
// - Provide UI for adding/editing/deleting departments
// - Communicate with backend using Electron IPC
// - Interacts with other pages/components via navigation and shared state

import { SearchContext } from '../components/Navbar';
import './pages_styles/departments.css';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, IconButton, Tooltip, Box, Typography } from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const ipcRenderer = window.electron && window.electron.ipcRenderer;

function Departments() {
  // Dropdown position state for personnel dropdown
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const handleMultiDelete = async () => {
    if (selectedIds.length === 0) {
      alert('No departments selected for deletion.');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedIds.length} selected department(s)?`);
    if (!confirmed) return;
    try {
      await ipcRenderer.invoke('delete-departments-bulk', selectedIds);
      setDepartments(prev => prev.filter(dep => !selectedIds.includes(dep.department)));
      setSelectedIds([]);
    } catch (error) {
      alert('Failed to delete selected departments: ' + (error.message || 'Unknown error'));
    }
  };
  const [departments, setDepartments] = useState([]);
  // Dropdown position state for personnel dropdown
  const { search } = useContext(SearchContext);
  const [sort, setSort] = useState('A-Z');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDept, setNewDept] = useState('');
  const [assets, setAssets] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [openPersonnelAccordion, setOpenPersonnelAccordion] = useState(null);
  const [personnelDropdownAnchor, setPersonnelDropdownAnchor] = useState(null); // { code, top, cellHeight } or null
  const [personnelAssetsModal, setPersonnelAssetsModal] = useState({ open: false, personnel: '', assets: [] });
  const [personnelDropdownList, setPersonnelDropdownList] = useState({}); // { [deptCode]: [person1, person2, ...] }
  // Dropdown position state for personnel dropdown
  // Handler to open modal for personnel assets
  const handleShowPersonnelAssets = (personnelName) => {
    const assetsForPersonnel = assets.filter(a => a.custodian_name === personnelName);
    setPersonnelAssetsModal({ open: true, personnel: personnelName, assets: assetsForPersonnel });
  };

  useEffect(() => {
    loadDepartments();
    loadAssets();
  }, []);

  // Debug: log departments and assets after fetch
  useEffect(() => {
    if (departments.length > 0) {
      console.log('[Departments.js] Departments from backend:', departments);
    }
    if (assets.length > 0) {
      const assetDepts = Array.from(new Set(assets.map(a => a.department).filter(Boolean)));
      console.log('[Departments.js] Unique department names from assets:', assetDepts);
    }
  }, [departments, assets]);

  const loadDepartments = async () => {
    const result = await ipcRenderer.invoke('get-departments');
    setDepartments(result || []);
  };
  const loadAssets = async () => {
    const result = await ipcRenderer.invoke('get-assets');
    setAssets(result || []);
  };

  // Delete department handler
  const handleDeleteDepartment = async (deptName) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      await ipcRenderer.invoke('delete-department', deptName);
      await loadDepartments();
    }
  };


// Only use departments from the backend for display


// Only show departments referenced by assets
const assetDeptSet = new Set(assets.map(a => a.department).filter(Boolean));
const seenCodes = new Set();
const departmentRows = departments
  .map((deptObj) => {
    const deptCode = deptObj.department;
    if (!deptCode || seenCodes.has(deptCode) || !assetDeptSet.has(deptCode)) return null;
    seenCodes.add(deptCode);
    const description = deptObj.description || '';
    const deptAssets = assets.filter(a => (a.department || 'Unassigned') === deptCode);
    const personnelSet = new Set();
    deptAssets.forEach(a => {
      if (a.custodian_name) {
        personnelSet.add(a.custodian_name);
      } else if (a.custodian) {
        personnelSet.add(a.custodian);
      }
    });
    const personnelCount = (typeof deptObj.assigned_personnel_count === 'number') ? deptObj.assigned_personnel_count : personnelSet.size;
    const totalAssets = (typeof deptObj.total_assets === 'number') ? deptObj.total_assets : deptAssets.length;
    return {
      code: deptCode,
      name: deptCode,
      description,
      personnelList: Array.from(personnelSet),
      personnelCount,
      totalAssets,
      original: deptObj,
    };
  })
  .filter(Boolean);

console.log('[Departments.js] departmentRows:', departmentRows);

  // Filter and sort

  // Use fuzzyFilter for context-aware, case-insensitive search on department code and name
  let filteredDepartments = departmentRows;
  // if (search && search.trim()) {
  //   const fuzzyFilter = require('../../fuzzyFilter').default;
  //   filteredDepartments = fuzzyFilter(departmentRows, search, ['code', 'name']);
  // }

  filteredDepartments = filteredDepartments.sort((a, b) => {
    const aDesc = (a.description || '').toString();
    const bDesc = (b.description || '').toString();
    return sort === 'A-Z' ? aDesc.localeCompare(bDesc) : bDesc.localeCompare(aDesc);
  });

  console.log('[Departments.js] filteredDepartments:', filteredDepartments);

  const handleAddDepartment = async (deptObj) => {
    if (!deptObj?.name?.trim() || !deptObj?.description?.trim()) return;
    setAddDialogOpen(false);
    setNewDept('');
    try {
      await ipcRenderer.invoke('add-department', {
        name: deptObj.name.trim(),
        description: deptObj.description.trim(),
      });
      await loadDepartments();
    } catch (err) {
      alert('Failed to add department: ' + (err?.message || err));
    }
  };

  // Handler for Edit button
  const handleEditDepartmentOpen = (dep) => {
    setEditDept(dep);
    setEditDialogOpen(true);
  };

  // Handler for saving edits
  const handleEditDepartmentSave = async (updated) => {
    if (!updated.code?.trim() || !updated.description?.trim()) return;
    await ipcRenderer.invoke('update-department', {
      original: editDept,
      code: updated.code.trim(),
      description: updated.description.trim(),
    });
    setEditDialogOpen(false);
    setEditDept(null);
    await loadDepartments();
  };

  // Handler for view button
  const handleViewDepartment = (deptName) => {
    setSelectedDept(deptName);
    setViewDialogOpen(true);
  };

  return (
    <div className="departments-root">
      <div className="departments-header">
        <span>Departments Management</span>
      </div>
      <div className="departments-table-wrapper">
        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666', fontSize: 14 }}>{selectedIds.length} record(s) selected</span>
            <button
              className="departments-btn-primary"
              onClick={handleMultiDelete}
              style={{ background: '#e53935', color: '#fff', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 14 }}
            >
              DELETE SELECTED ({selectedIds.length})
            </button>
          </Box>
        )}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredDepartments.map((dep, idx) => ({ ...dep, idx }))}
            columns={[
                { field: 'idx', headerName: 'No.', width: 60, valueGetter: (params) => params.row.idx + 1 },
                { field: 'code', headerName: 'Department', width: 140 },
                { field: 'description', headerName: 'Description', width: 180 },
                { field: 'personnelCount', headerName: 'Assigned Personnels Count', width: 180, renderCell: (params) => {
                  const isOpen = openPersonnelAccordion === params.row.code && params.value > 0;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                      <Typography variant="body2">{params.value}</Typography>
                      {params.value > 0 && (
                        <Tooltip title="Show Personnels">
                          <IconButton size="small" onClick={async (event) => {
                            event.stopPropagation();
                            const dep = params.row;
                            if (!personnelDropdownList[dep.code]) {
                              const list = await ipcRenderer.invoke('get-department-personnels', dep.code);
                              setPersonnelDropdownList(prev => ({ ...prev, [dep.code]: list }));
                            }
                            if (isOpen) {
                              setOpenPersonnelAccordion(null);
                            } else {
                              // Calculate dropdown position
                              const rect = event.currentTarget.getBoundingClientRect();
                              setDropdownPos({
                                left: rect.left + rect.width / 2,
                                top: rect.bottom + 4
                              });
                              setOpenPersonnelAccordion(dep.code);
                            }
                          }}>
                            <svg style={{ marginLeft: 6, verticalAlign: 'middle', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                          </IconButton>
                        </Tooltip>
                      )}
                      {isOpen && dropdownPos && ReactDOM.createPortal(
                        <Box className="departments-personnel-dropdown" sx={{
                          position: 'absolute',
                          left: dropdownPos.left,
                          top: dropdownPos.top,
                          transform: 'translateX(-50%)',
                          zIndex: 1302,
                          background: 'transparent',
                          boxShadow: 'none',
                          minWidth: 0,
                          padding: 0,
                          maxHeight: 240,
                          overflowY: 'visible',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}>
                          {(personnelDropdownList[params.row.code] && personnelDropdownList[params.row.code].length > 0) ? (
                            personnelDropdownList[params.row.code].map((p, i) => (
                              <div
                                key={`${params.row.code}-${p}-${i}`}
                                className="departments-personnel-dropdown-item"
                                onClick={() => handleShowPersonnelAssets(p)}
                                style={{
                                  padding: '6px 18px',
                                  cursor: 'pointer',
                                  background: '#f7fbff',
                                  borderRadius: '20px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                                  color: '#2a3b4d',
                                  fontWeight: 500,
                                  fontSize: '1rem',
                                  margin: '0 0 4px 0',
                                  border: '1px solid #e3e8ee',
                                  transition: 'background 0.15s',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {p}
                              </div>
                            ))
                          ) : (
                            <div className="departments-personnel-dropdown-item" style={{
                              color: '#888',
                              padding: '6px 18px',
                              background: '#f7fbff',
                              borderRadius: '20px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                              fontWeight: 500,
                              fontSize: '1rem',
                              border: '1px solid #e3e8ee',
                              whiteSpace: 'nowrap',
                            }}>No personnels</div>
                          )}
                        </Box>,
                        document.body
                      )}
                    </Box>
                  );
                } },
                { field: 'totalAssets', headerName: 'Total Assets', width: 120 },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 140,
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="secondary" onClick={() => handleEditDepartmentOpen(params.row.original)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteDepartment(params.row.code)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }
              ]}
            getRowId={row => row.code || row.name || row.idx}
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
        className="departments-fab"
        title="Add Department"
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon style={{ fontSize: 28, color: '#fff' }} />
      </button>
      <AddDepartmentModal
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddDepartment}
        newDept={newDept}
        setNewDept={setNewDept}
      />
      <EditDepartmentModal
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setEditDept(null); }}
        department={editDept}
        onSave={handleEditDepartmentSave}
      />
      {/* View Department Dialog */}
      {viewDialogOpen && (() => {
        // Find department object by code or name
        const deptObj = departments.find(
          d => d.code === selectedDept || d.department_code === selectedDept || d.name === selectedDept
        );
        const deptCode = deptObj ? (deptObj.code || deptObj.department_code || deptObj.name || '-') : selectedDept;
        const deptName = deptObj ? (deptObj.department_name || deptObj.name || '-') : selectedDept;
        return (
          <div className="departments-modal-overlay">
            <div className="departments-modal" style={{ maxWidth: 800 }}>
              <div className="departments-modal-header">
                <span className="departments-modal-title">{deptName} ({deptCode})</span>
                <button className="departments-modal-close" onClick={() => setViewDialogOpen(false)}>&times;</button>
              </div>
              <div className="departments-form-group">
                <label>Assigned Personnel:</label>
                <div style={{ marginBottom: 12 }}>
                  {(() => {
                    const deptAssets = assets.filter(a => (a.department || 'Unassigned') === deptCode || (a.department || 'Unassigned') === deptName);
                    const personnelSet = new Set();
                    deptAssets.forEach(a => { if (a.custodian_name) personnelSet.add(a.custodian_name); });
                    return Array.from(personnelSet).join(', ') || '-';
                  })()}
                </div>
              </div>
              <div className="departments-form-group">
                <label>Assets in this Department:</label>
                <div className="departments-table-section" style={{ marginBottom: 12 }}>
                  <table className="departments-table" style={{ fontSize: '0.98rem' }}>
                    <thead>
                      <tr>
                        <th>Asset Name</th>
                        <th>Asset Tag</th>
                        <th>Custodian</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.filter(a => (a.department || 'Unassigned') === deptCode || (a.department || 'Unassigned') === deptName).map((asset, idx) => (
                        <tr key={asset.id || asset.asset_tag || `asset-${idx}`}>
                          <td>{asset.name || asset.asset_name}</td>
                          <td>{asset.asset_tag}</td>
                          <td>{asset.custodian_name || '-'}</td>
                          <td>{asset.status || '-'}</td>
                          <td>
                            <button
                              className="departments-action-btn delete"
                              title="Delete Asset"
                              style={{ color: 'red', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this asset?')) {
                                  await ipcRenderer.invoke('delete-asset', asset.id);
                                  await loadAssets();
                                  setViewDialogOpen(false);
                                }
                              }}
                            >
                              &#128465;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="departments-modal-actions">
                <button className="departments-btn-primary" onClick={() => setViewDialogOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Departments;

// React imports and state setup
// - React, { useEffect, useState }: Core React libraries for building the component and managing state
//
// Component function: Departments
// - State variables
// -- departments: Stores the list of departments fetched from the backend
// -- search: Stores the current search query for filtering departments
// -- sort: Stores the current sort order (A-Z or Z-A) for department names
// -- addDialogOpen: Controls the open/close state of the add department dialog
// -- newDept: Stores the name of the new department being added
// -- assets: Stores the list of assets fetched from the backend
// -- custodians: Stores the list of custodians fetched from the backend
// -- viewDialogOpen: Controls the open/close state of the view department dialog
// -- selectedDept: Stores the name of the currently selected department for viewing details
//
// - useEffect: Fetches department data from backend on mount
// -- loadDepartments: Invokes the 'get-departments' IPC method to fetch departments
// -- loadAssets: Invokes the 'get-assets' IPC method to fetch assets
// -- loadCustodians: Invokes the 'get-custodians' IPC method to fetch custodians
//
// - Functions for handling add, edit, and delete actions
// -- handleAddDepartment: Adds a new department and refreshes the department list
// -- (Not implemented in the provided code, but implied by the component's responsibilities)
// -- handleViewDepartment: Sets the selected department and opens the view department dialog
//
// - Render: Table of departments and UI controls
// -- Displays a search box and sort dropdown
// -- Displays a table of departments with columns for No., Department, Assigned Personnel, Total Assets, and View
// -- Each row represents a department, with data aggregated from the assets
// -- View column contains an IconButton with a VisibilityIcon for viewing department details
// -- Floating action button for adding a new department
// -- Dialog for adding a new department with a text field and action buttons
// -- Dialog for viewing department details, showing assigned personnel and a table of assets
//
// Notes: This page depends on backend IPC handlers in main.js and may use shared UI components like Navbar/Sidebar.
