// History.js - Page for Viewing Historical Records (Audit Trail)
// This React component displays a table of all historical actions (add, edit, delete, assignments, etc.) performed in the system.
// Data is fetched from the backend via Electron IPC and shown in a table for transparency and auditing.
//
// Key responsibilities:
// - Fetch and display historical records from the backend
// - Provide filters/search for easier navigation
// - Show details such as date, user, action, item, and description
//
// Depends on:
// - Electron's ipcRenderer for backend communication
// - Material-UI for UI components

import React, { useEffect, useState, useContext } from 'react';
import { DateFilterContext } from '../components/Navbar';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import './pages_styles/history.css';

const ipcRenderer = window.electron && window.electron.ipcRenderer;

function History() {
  const { dateFilter } = useContext(DateFilterContext);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch historical records from backend
    ipcRenderer.invoke('get-history-records').then(setRecords);
  }, []);

  // Filter records by search
  let filtered = records.filter(r =>
    r.user?.toLowerCase().includes(search.toLowerCase()) ||
    r.action?.toLowerCase().includes(search.toLowerCase()) ||
    r.item?.toLowerCase().includes(search.toLowerCase()) ||
    r.details?.toLowerCase().includes(search.toLowerCase())
  );
  // Calendar date filter
  function matchesDateFilter(r, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    if (!r.timestamp) return false;
    const date = new Date(r.timestamp);
    if (filter.year && date.getFullYear() !== filter.year) return false;
    if (filter.month && (date.getMonth() + 1) !== filter.month) return false;
    if (filter.day && date.getDate() !== filter.day) return false;
    return true;
  }
  filtered = filtered.filter(r => matchesDateFilter(r, dateFilter));

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'No.', width: 70, valueGetter: (params) => params.row.idx + 1 },
    { field: 'timestamp', headerName: 'Date/Time', width: 180, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
    { field: 'user', headerName: 'User', width: 140 },
    { field: 'action', headerName: 'Action', width: 120 },
    { field: 'item', headerName: 'Item', width: 120 },
    { field: 'details', headerName: 'Details', width: 320, flex: 1 },
  ];
  const dataGridRows = filtered.map((row, idx) => ({ ...row, idx, id: idx }));

  return (
    <div className="history-root">
      <div className="history-header">
        <span>Historical Records (Audit Trail)</span>
      </div>
      <div className="history-table-wrapper">
       
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={dataGridRows}
            columns={columns}
            getRowId={row => row.id}
            disableRowSelectionOnClick
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
            localeText={{ noRowsLabel: 'No records found.' }}
          />
        </Box>
      </div>
    </div>
  );
}

export default History;
