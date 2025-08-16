

import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Chip, Box, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './MyAssets.css';

function MyAssets() {
  // Sample data for demonstration
  const [assets] = useState([
    { id: 1, assetId: 44, name: 'wed night', category: 'ICT', subcategory: 'Tablet', department: '-', location: 'Storage', status: 'Available', custodian: 'Not Assigned', dateUpdated: '08-13-2025' },
    { id: 2, assetId: 42, name: 'tuesday', category: 'ICT', subcategory: 'Projector', department: '-', location: 'Storage', status: 'Available', custodian: 'Not Assigned', dateUpdated: '08-12-2025' },
    { id: 3, assetId: 35, name: 'pls', category: 'ICT', subcategory: 'Laptop', department: 'IICT', location: 'CLA', status: 'In Use', custodian: 'Mac Quiming', dateUpdated: '08-10-2025' },
    // ... add more rows as needed
  ]);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [loading] = useState(false);
  const [error] = useState(null);

  const columns = [
    { field: 'id', headerName: '#', width: 60 },
    { field: 'assetId', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Asset Name', width: 180, flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>{params.value}</Typography>
      )
    },
    { field: 'category', headerName: 'Category', width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="secondary" variant="filled" />
      )
    },
    { field: 'subcategory', headerName: 'Sub-Category', width: 130,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    { field: 'department', headerName: 'Department', width: 120 },
    { field: 'location', headerName: 'Location', width: 120 },
    { field: 'status', headerName: 'Status', width: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'In Use' ? 'primary' : 'success'} variant="filled" />
      )
    },
    { field: 'custodian', headerName: 'Custodian', width: 140 },
    { field: 'dateUpdated', headerName: 'Date Updated', width: 120 },
  ];

  // Handler for bulk delete (demo only, no real delete)
  const handleBulkDelete = () => {
    alert(`Delete Selected (${rowSelectionModel.length})`);
  };

  // Filtered records (no search/filter logic for demo)
  const filteredRecords = assets;

  return (
    <div className="asset-acquisitions-root">
      <div className="asset-acquisitions-header">
        <span>My Assets</span>
      </div>
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
                  Delete Selected ({rowSelectionModel.length})
                </Button>
              </Box>
            )}
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
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                  sorting: {
                    sortModel: [{ field: 'id', sort: 'desc' }],
                  },
                }}
                sx={{
                  border: 'none',
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
    </div>
  );
}

export default MyAssets;
