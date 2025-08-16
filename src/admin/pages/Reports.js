// Reports.js - Page for Generating and Viewing Reports
// This React component allows users to generate and view inventory reports. It fetches report data from the backend via Electron IPC and displays it in tables or charts.
//
// Key responsibilities:
// - Fetch and display report data
// - Provide UI for selecting/generating reports
// - Communicate with backend using Electron IPC
// - Interacts with other pages/components via navigation and shared state

import React, { useState, useEffect, useRef } from 'react';
import './pages_styles/reports.css';
import { exportAssetsToPDF } from '../../utils/exportReport';
import logo from '../../assets/ict-aims-logo.png';

const ipcRenderer = window.electron && window.electron.ipcRenderer;

function Reports() {
  // Dynamically get filter options from assets
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    department: '',
    custodian: '',
    category: '',
    status: '',
    format: '',
  });
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        setLoading(true);
        const assetsList = await ipcRenderer.invoke('get-assets');
        setAssets(assetsList);
      } catch (err) {
        console.error('Error fetching assets:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  useEffect(() => {
    let results = assets;
    
    // Use fuzzyFilter for context-aware, case-insensitive search on all relevant fields
    const searchVal = [filters.department, filters.custodian, filters.category, filters.status].filter(Boolean).join(' ');
    if (searchVal && searchVal.trim()) {
  const fuzzyFilter = require('../../fuzzyFilter').default;
      results = fuzzyFilter(results, searchVal, [
        'department',
        'custodian_name',
        'category',
        'status',
      ]);
    }
    
    if (filters.category) {
      results = results.filter(a => a.category === filters.category);
    }
    if (filters.department) {
      results = results.filter(a => a.department === filters.department);
    }
    if (filters.custodian) {
      results = results.filter(a => a.custodian_name === filters.custodian);
    }
    if (filters.status) {
      results = results.filter(a => a.status === filters.status);
    }
    if (filters.from) {
      results = results.filter(a => a.acquisition_date && a.acquisition_date >= filters.from);
    }
    if (filters.to) {
      results = results.filter(a => a.acquisition_date && a.acquisition_date <= filters.to);
    }
    setFilteredAssets(results);
  }, [filters, assets]);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Only show results if any filter is set
  const anyFilterSet = Object.values(filters).some(v => v && v !== '');

  // Dynamic filter options
  const departments = Array.from(new Set(assets.map(a => a.department).filter(Boolean)));
  const custodians = Array.from(new Set(assets.map(a => a.custodian_name).filter(Boolean)));
  const categories = Array.from(new Set(assets.map(a => a.category).filter(Boolean)));
  const statuses = Array.from(new Set(assets.map(a => a.status).filter(Boolean)));
  const formats = ['PDF', 'Excel'];
  
  // Export columns configuration
  const exportColumns = [
    { key: 'id', label: 'Asset ID' },
    { key: 'asset_name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'category', label: 'Category' },
    { key: 'subcategory', label: 'Sub-Category' },
    { key: 'custodian_name', label: 'Custodian' },
    { key: 'acquisition_date', label: 'Acquired' },
    { key: 'status', label: 'Status' },
  ];

  const handleExport = () => {
    if (filters.format === 'PDF') {
      exportAssetsToPDF({
        assets: filteredAssets,
        filters,
        columns: exportColumns,
        systemName: 'ICT-AIMS',
      });
    } else {
      alert('Only PDF export is supported at this time.');
    }
  };

  if (loading) {
    return (
      <div className="reports-root" style={{ margin: 0, padding: 0, background: '#fafbfc', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
        <div className="reports-title" style={{ fontSize: 22, fontWeight: 700, color: '#222', margin: '24px 0 8px 0', letterSpacing: 0.5 }}>Reports</div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading assets...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-root" style={{ margin: 0, padding: 0, background: '#fafbfc', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="reports-title" style={{ fontSize: 22, fontWeight: 700, color: '#222', margin: '24px 0 8px 0', letterSpacing: 0.5 }}>Reports</div>
      <div className="reports-filters-row">
        {/* FROM date picker */}
        <div className="reports-date-filter">
          <span>FROM</span>
          <input
            ref={fromInputRef}
            type="text"
            value={filters.from}
            readOnly
            onClick={() => setShowFromCalendar(true)}
          />
          <button
            onClick={() => setShowFromCalendar(v => !v)}
            tabIndex={-1}
            aria-label="Open calendar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><rect x="7" y="13" width="2" height="2" rx="0.5"/><rect x="11" y="13" width="2" height="2" rx="0.5"/><rect x="15" y="13" width="2" height="2" rx="0.5"/></svg>
          </button>
          {showFromCalendar && (
            <div style={{ position: 'absolute', top: 38, right: 0, zIndex: 9999, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, boxShadow: '0 2px 12px #0002', padding: 10 }}>
              <input
                type="date"
                value={filters.from}
                onChange={e => { handleChange('from', e.target.value); setShowFromCalendar(false); }}
                style={{ fontSize: 15, padding: '4px 10px', borderRadius: 6, border: '1px solid #e0e0e0', color: '#222', background: '#f7f7f7' }}
                autoFocus
              />
            </div>
          )}
        </div>
        {/* TO date picker */}
        <div className="reports-date-filter">
          <span>TO</span>
          <input
            ref={toInputRef}
            type="text"
            value={filters.to}
            readOnly
            onClick={() => setShowToCalendar(true)}
          />
          <button
            onClick={() => setShowToCalendar(v => !v)}
            tabIndex={-1}
            aria-label="Open calendar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><rect x="7" y="13" width="2" height="2" rx="0.5"/><rect x="11" y="13" width="2" height="2" rx="0.5"/><rect x="15" y="13" width="2" height="2" rx="0.5"/></svg>
          </button>
          {showToCalendar && (
            <div style={{ position: 'absolute', top: 38, right: 0, zIndex: 9999, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, boxShadow: '0 2px 12px #0002', padding: 10 }}>
              <input
                type="date"
                value={filters.to}
                onChange={e => { handleChange('to', e.target.value); setShowToCalendar(false); }}
                style={{ fontSize: 15, padding: '4px 10px', borderRadius: 6, border: '1px solid #e0e0e0', color: '#222', background: '#f7f7f7' }}
                autoFocus
              />
            </div>
          )}
        </div>
  <select className="reports-filter-input" value={filters.category} onChange={e => handleChange('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
  <select className="reports-filter-input" value={filters.department} onChange={e => handleChange('department', e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
        </select>
  <select className="reports-filter-input" value={filters.custodian} onChange={e => handleChange('custodian', e.target.value)}>
          <option value="">All Custodians</option>
          {custodians.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
  <select className="reports-filter-input" value={filters.status} onChange={e => handleChange('status', e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
  <select className="reports-filter-input" value={filters.format} onChange={e => handleChange('format', e.target.value)}>
          <option value="">Select Format</option>
          {formats.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <button className="reports-btn-export" title="Export Report" onClick={handleExport} disabled={filteredAssets.length === 0 || filters.format !== 'PDF'} style={{ fontSize: 13, padding: '4px 18px', borderRadius: 8, border: 'none', background: '#222', color: '#fff', fontWeight: 600, letterSpacing: 0.5, boxShadow: '0 1px 4px #0001', cursor: filteredAssets.length === 0 || filters.format !== 'PDF' ? 'not-allowed' : 'pointer', opacity: filteredAssets.length === 0 || filters.format !== 'PDF' ? 0.5 : 1 }}>EXPORT</button>
      </div>
      <div className="reports-paper" style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px #0001', padding: '18px 22px', marginTop: 8 }}>
        {!anyFilterSet ? (
          <div style={{ color: '#888', fontSize: 13, textAlign: 'center', margin: '24px 0' }}>Select filters to generate a report</div>
        ) : filteredAssets.length === 0 ? (
          <div style={{ color: '#888', fontSize: 15, textAlign: 'center', margin: '24px 0' }}>No results found.</div>
        ) : (
          <div className="reports-table-section" style={{ marginTop: 0 }}>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
              Showing {filteredAssets.length} of {assets.length} assets
            </div>
            <table className="reports-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #0001' }}>
              <thead>
                <tr style={{ background: '#f7f7f7', color: '#222', fontWeight: 600, fontSize: 13 }}>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>ID</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Name</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Category</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Sub-Category</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Department</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Custodian</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Serial Number</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Acquired</th>
                  <th style={{ padding: '6px 8px', borderBottom: '1px solid #e0e0e0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid #f0f0f0', color: '#222', fontWeight: 400 }}>
                    <td style={{ padding: '6px 8px' }}>{asset.id}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.asset_name || asset.name || '-'}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.category || '-'}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.subcategory || '-'}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.department || '-'}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.custodian_name || '-'}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.serial_number || '-'}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.acquisition_date ? formatDisplayDate(asset.acquisition_date) : '-'}</td>
                    <td style={{ padding: '6px 8px' }}>{asset.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;

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
