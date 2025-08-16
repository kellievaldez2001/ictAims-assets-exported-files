// Dashboard.js - Main Dashboard Page
// This React component serves as the main dashboard for the inventory system. It displays summary statistics, charts, and quick links to other pages. Data is fetched from the backend via Electron IPC.
//
// Key responsibilities:
// - Display summary data (counts, charts, etc.)
// - Fetch dashboard data from backend
// - Provide navigation to other pages
// - Uses shared UI components (Navbar, Sidebar)

import React, { useState, useEffect, useContext } from 'react';
import { DateFilterContext } from '../components/Navbar';
import { Box, Grid, Card, CardContent, Typography, Paper, Divider } from '@mui/material';
// Helper to check if a purchase order is overdue
function isPurchaseOrderOverdue(po) {
  if (!po.delivery_date || !po.status) return false;
  const today = new Date();
  const deliveryDate = new Date(po.delivery_date);
  // Only overdue if not received and delivery date is before today
  return deliveryDate < today && po.status !== 'Received';
}
// ErrorBoundary for chart
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('PieChart error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', fontSize: 12, textAlign: 'center' }}>Unable to display chart.</div>;
    }
    return this.props.children;
  }
}
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import './pages_styles/dashboard.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CancelIcon from '@mui/icons-material/Cancel';

const ipcRenderer = window.electron && window.electron.ipcRenderer;

// Dynamic color generation for departments
const generateDeptColors = (deptCount) => {
  const baseColors = ['#4b7bec', '#ffa502', '#ff4757', '#2ed573', '#a55eea', '#fd79a8', '#00b894', '#fdcb6e', '#e17055', '#6c5ce7'];
  const colors = [];
  for (let i = 0; i < deptCount; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

// Default department colors array
const DEPT_COLORS = ['#4b7bec', '#ffa502', '#ff4757', '#2ed573', '#a55eea', '#fd79a8', '#00b894', '#fdcb6e', '#e17055', '#6c5ce7'];


function Dashboard() {
  const { dateFilter } = useContext(DateFilterContext);
  const [assets, setAssets] = useState([]); // All real assets
  const [departmentCounts, setDepartmentCounts] = useState({});
  // Removed local dateFilter state, now using context
  const [anchorEl, setAnchorEl] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [custodians, setCustodians] = useState([]);
  // Removed purchaseOrders state, as purchase_orders table no longer exists
  const [overduePOCount, setOverduePOCount] = useState(0);

  // Fetch all real asset data for everything
  useEffect(() => {
    // Fetch assets, departments, custodians in parallel
    Promise.all([
      ipcRenderer.invoke('get-assets'),
      ipcRenderer.invoke('get-departments'),
      ipcRenderer.invoke('get-custodians'),
    ]).then(([assetsData, departmentsData, custodiansData]) => {
      setAssets(assetsData);
      setDepartments(departmentsData || []);
      setCustodians(custodiansData || []);
      // Only count assets with allowed statuses (exclude LOST)
      const allowedStatuses = ['Available', 'In Use', 'Maintenance'];
      const counts = {};
      assetsData.forEach(asset => {
        if (allowedStatuses.includes(asset.status) && asset.status !== 'LOST') {
          const dept = asset.department || 'Unassigned';
          counts[dept] = (counts[dept] || 0) + 1;
        }
      });
      // Ensure all departments from the table are present, even if 0 assets
      (departmentsData || []).forEach(d => {
        if (!counts[d.name]) counts[d.name] = 0;
      });
      setDepartmentCounts(counts);
    });
  }, []);

  // For Active Assets, count all assets returned from backend (already filtered for LOST/DAMAGED)
  // const allowedStatuses = ['Available', 'In Use', 'Maintenance'];
  // function matchesDateFilter(asset, filter) {
  //   if (!filter || Object.keys(filter).length === 0) return true;
  //   if (!asset.timestamp && !asset.acquisition_date && !asset.updated_at) return false;
  //   let dateStr = asset.timestamp || asset.acquisition_date || asset.updated_at;
  //   if (!dateStr) return false;
  //   const date = new Date(dateStr);
  //   if (filter.year && date.getFullYear() !== filter.year) return false;
  //   if (filter.month && (date.getMonth() + 1) !== filter.month) return false;
  //   if (filter.day && date.getDate() !== filter.day) return false;
  //   return true;
  // }
  // const filteredAssets = assets.filter(asset => allowedStatuses.includes(asset.status) && asset.status !== 'LOST' && matchesDateFilter(asset, dateFilter));
  const totalAssets = assets.length;




  // Helper to check if asset matches filter
  function isAssetInDateRange(asset, filter) {
    if (!asset.timestamp) return false;
    const assetDate = new Date(asset.timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (filter) {
      case 'Today':
        return assetDate >= today;
      case 'Yesterday': {
        const yest = new Date(today); yest.setDate(today.getDate() - 1);
        return assetDate >= yest && assetDate < today;
      }
      case 'Last 2 days': {
        const d = new Date(today); d.setDate(today.getDate() - 1);
        return assetDate >= d;
      }
      case 'Last 3 days': {
        const d = new Date(today); d.setDate(today.getDate() - 2);
        return assetDate >= d;
      }
      case 'Last 4 days': {
        const d = new Date(today); d.setDate(today.getDate() - 3);
        return assetDate >= d;
      }
      case 'Last 5 days': {
        const d = new Date(today); d.setDate(today.getDate() - 4);
        return assetDate >= d;
      }
      case 'Last 6 days': {
        const d = new Date(today); d.setDate(today.getDate() - 5);
        return assetDate >= d;
      }
      case 'Last 7 days': {
        const d = new Date(today); d.setDate(today.getDate() - 6);
        return assetDate >= d;
      }
      case 'Last week': {
        const d = new Date(today); d.setDate(today.getDate() - 7);
        return assetDate >= d;
      }
      case 'Last month': {
        const d = new Date(today); d.setMonth(today.getMonth() - 1);
        return assetDate >= d;
      }
      default:
        return true;
    }
  }


  // Dynamically get all department names (from both assets and departments table)
  const allDepartmentNames = Array.from(new Set([
    ...departments.map(d => d.name),
    ...Object.keys(departmentCounts)
  ]));
  // Assign colors dynamically
  const getDeptColor = (i) => {
    const colors = generateDeptColors(Object.keys(departmentCounts).length);
    return colors[i % colors.length] || '#888';
  };

  // Count assets per main category (category), exclude LOST
  const mainCategoryCounts = Array.isArray(assets) ? assets.reduce((acc, asset) => {
    if (asset.status === 'LOST') return acc;
    const mainCat = asset && asset.category ? asset.category : 'Uncategorized';
    acc[mainCat] = (acc[mainCat] || 0) + 1;
    return acc;
  }, {}) : {};
  let mainCategoryData = Object.entries(mainCategoryCounts).map(([name, value], i) => ({
    name,
    value,
    color: generateDeptColors(Object.keys(mainCategoryCounts).length)[i % Object.keys(mainCategoryCounts).length] || `hsl(${i * 60},70%,60%)`
  }));
  if (!Array.isArray(mainCategoryData)) mainCategoryData = [];

  // Count assets per sub-category (subcategory), exclude LOST
  const subCategoryCounts = Array.isArray(assets) ? assets.reduce((acc, asset) => {
    if (asset.status === 'LOST') return acc;
    const subCat = asset && asset.subcategory ? asset.subcategory : 'Uncategorized';
    acc[subCat] = (acc[subCat] || 0) + 1;
    return acc;
  }, {}) : {};
  let subCategoryData = Object.entries(subCategoryCounts).map(([name, value], i) => ({
    name,
    value,
    color: DEPT_COLORS[i % DEPT_COLORS.length] || `hsl(${i * 60},70%,60%)`
  }));
  if (!Array.isArray(subCategoryData)) subCategoryData = [];

  // Count assets per department (safe), exclude LOST
  const departmentAssetCounts = Array.isArray(assets) ? assets.reduce((acc, asset) => {
    if (asset.status === 'LOST') return acc;
    const dept = asset && asset.department ? asset.department : 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {}) : {};
  let departmentData = Object.entries(departmentAssetCounts).map(([name, value], i) => ({
    name,
    value,
    color: DEPT_COLORS[i % DEPT_COLORS.length] || `hsl(${i * 60},70%,60%)`
  }));
  if (!Array.isArray(departmentData)) departmentData = [];

  // Count assets per status (safe)
  const statusAssetCounts = Array.isArray(assets) ? assets.reduce((acc, asset) => {
    const status = asset && asset.status ? asset.status : 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) : {};
  let statusData = Object.entries(statusAssetCounts).map(([name, value]) => ({
    name,
    value,
  }));
  if (!Array.isArray(statusData)) statusData = [];
  // Status icon map
  const statusIcons = {
    'Available': <CheckCircleIcon style={{ color: '#4caf50', fontSize: 18, marginRight: 4 }} />,
    'In Use': <HourglassBottomIcon style={{ color: '#1976d2', fontSize: 18, marginRight: 4 }} />,
    'Maintenance': <BuildCircleIcon style={{ color: '#ff9800', fontSize: 18, marginRight: 4 }} />,
    'Disposed': <CancelIcon style={{ color: '#e53935', fontSize: 18, marginRight: 4 }} />,
    'Unknown': <CancelIcon style={{ color: '#bdbdbd', fontSize: 18, marginRight: 4 }} />,
  };

  // Helper to compute annual depreciation summary data
  function getDepreciationSummaryData(assets) {
    if (!Array.isArray(assets) || assets.length === 0) return [];
    // Find min and max years
    let minYear = new Date().getFullYear();
    let maxYear = new Date().getFullYear();
    assets.forEach(asset => {
      if (!asset.acquisition_date || !asset.purchase_cost || !asset.useful_life) return;
      const acqYear = new Date(asset.acquisition_date).getFullYear();
      minYear = Math.min(minYear, acqYear);
      maxYear = Math.max(maxYear, acqYear + Number(asset.useful_life || 0));
    });
    // For each year, sum remaining book value of all assets
    const years = [];
    for (let y = minYear; y <= maxYear; y++) years.push(y);
    const data = years.map(year => {
      let totalBookValue = 0;
      assets.forEach(asset => {
        if (!asset.acquisition_date || !asset.purchase_cost || !asset.useful_life) return;
        const acqYear = new Date(asset.acquisition_date).getFullYear();
        const cost = parseFloat(asset.purchase_cost) || 0;
        const life = parseFloat(asset.useful_life) || 0;
        if (year < acqYear) return;
        let yearsElapsed = year - acqYear + 1;
        if (yearsElapsed > life) yearsElapsed = life;
        if (yearsElapsed < 0) yearsElapsed = 0;
        const annualDep = life > 0 ? cost / life : 0;
        const accumulated = annualDep * yearsElapsed;
        const bookValue = Math.max(0, cost - accumulated);
        totalBookValue += bookValue;
      });
      return { year: String(year), value: +totalBookValue.toFixed(2) };
    });
    return data;
  }

  return (
    <Box sx={{ background: '#fff', minHeight: '100vh', width: '83vw', p: 0, m: 0 }}>
  <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', py: 0, px: 0, m: 0, p: 0 }}>
        <Box sx={{
          width: '100%',
          maxWidth: '1400px',
          mx: 'auto',
          px: 0,
          py: 0,
          background: '#fff', // blue shade
          borderRadius: 3,
          mb: 3,
          boxSizing: 'border-box',
        }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>Dashboard Overview</Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={3}>
            Monitor performance, equipment, and inventory across all departments.
          </Typography>
        </Box>
  <Box sx={{ width: '100%', maxWidth: '99.5%', pb: 1, m: 0, p: 0 }}>
    <Grid container spacing={1} mb={2} wrap="wrap" sx={{ width: '100%' }}>            {/* Slimmer cards, smaller charts, and always visible scroll if needed */}
            <Grid item xs zeroMinWidth sx={{ flex: '1 1 0', minWidth: 100, maxWidth: 'none' }}>
              <Card className="dashboard-card" elevation={3} sx={{ borderRadius: 3, p: 0.5, minHeight: 150, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: { xs: 12, sm: 13, md: 14 } }}>
                <Typography variant="subtitle1" color="text.secondary" fontWeight={600} mb={1} align="center">Active Assets</Typography>
                <Typography variant="h2" color="primary" fontWeight={700} align="center">{totalAssets}</Typography>
              </Card>
            </Grid>
            <Grid item xs zeroMinWidth sx={{ flex: '1 1 0', minWidth: 80, maxWidth: 'none' }}>
              <Card className="dashboard-card" elevation={3} sx={{ borderRadius: 3, p: 0.5, minHeight: 150, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: { xs: 12, sm: 13, md: 14 } }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1} align="center">Assets per Category</Typography>
                <ErrorBoundary>
                  <Box sx={{ width: '100%', height: 120 }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={mainCategoryData || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          innerRadius={20}
                          paddingAngle={2}
                          label={false}
                        >
                          {(mainCategoryData || []).map((entry, idx) => (
                            <Cell key={`cell-maincat-${idx}`} fill={entry.color || '#ccc'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxHeight: 90, overflowY: 'auto' }}>
                    {(mainCategoryData || []).map((entry, idx) => (
                      <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: entry.color, borderRadius: 1, display: 'inline-block', mr: 1 }} />
                        {entry.name} ({entry.value})
                      </Box>
                    ))}
                  </Box>
                </ErrorBoundary>
              </Card>
            </Grid>
            <Grid item xs zeroMinWidth sx={{ flex: '1 1 0', minWidth: 80, maxWidth: 'none' }}>
              <Card className="dashboard-card" elevation={3} sx={{ borderRadius: 3, p: 0.5, minHeight: 150, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: { xs: 12, sm: 13, md: 14 } }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1} align="center">Assets per Sub-Category</Typography>
                <ErrorBoundary>
                  <Box sx={{ width: '100%', height: 120 }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={subCategoryData || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          innerRadius={20}
                          paddingAngle={2}
                          label={false}
                        >
                          {(subCategoryData || []).map((entry, idx) => (
                            <Cell key={`cell-subcat-${idx}`} fill={entry.color || '#ccc'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxHeight: 90, overflowY: 'auto' }}>
                    {(subCategoryData || []).map((entry, idx) => (
                      <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: entry.color, borderRadius: 1, display: 'inline-block', mr: 1 }} />
                        {entry.name} ({entry.value})
                      </Box>
                    ))}
                  </Box>
                </ErrorBoundary>
              </Card>
            </Grid>
            <Grid item xs zeroMinWidth sx={{ flex: '1 1 0', minWidth: 80, maxWidth: 'none' }}>
              <Card className="dashboard-card" elevation={3} sx={{ borderRadius: 3, p: 0.5, minHeight: 100, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: { xs: 12, sm: 13, md: 14 } }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1} align="center">Assets per Department</Typography>
                <ErrorBoundary>
                  <Box sx={{ width: '100%', height: 100 }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={departmentData || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          innerRadius={22}
                          paddingAngle={2}
                          label={false}
                        >
                          {(departmentData || []).map((entry, idx) => (
                            <Cell key={`cell-dept-${idx}`} fill={entry.color || '#ccc'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} assets`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxHeight: 90, overflowY: 'auto' }}>
                    {(departmentData || []).map((dept, idx) => (
                      <Box key={dept.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: dept.color || '#ccc', borderRadius: 1, display: 'inline-block', mr: 1 }} />
                        {dept.name} ({dept.value})
                      </Box>
                    ))}
                  </Box>
                </ErrorBoundary>
              </Card>
            </Grid>
            <Grid item xs zeroMinWidth sx={{ flex: '1 1 0', minWidth: 80, maxWidth: 'none' }}>
              <Card className="dashboard-card" elevation={3} sx={{ borderRadius: 3, p: 0.5, minHeight: 150, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: { xs: 12, sm: 13, md: 14 } }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1} align="center">Assets per Status</Typography>
                <ErrorBoundary>
                  <Box sx={{ width: '100%', height: 90 }}>
                    <ResponsiveContainer width="100%" height={90}>
                      <PieChart>
                        <Pie
                          data={statusData || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          innerRadius={22}
                          paddingAngle={2}
                          label={false}
                        >
                          {(statusData || []).map((entry, idx) => (
                            <Cell key={`cell-status-${idx}`} fill={entry.color || '#ccc'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} assets`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxHeight: 90, overflowY: 'auto' }}>
                    {(statusData || []).map((stat, idx) => (
                      <Box key={stat.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: stat.color || '#ccc', borderRadius: 1, display: 'inline-block', mr: 1 }} />
                        {stat.name} ({stat.value})
                      </Box>
                    ))}
                  </Box>
                </ErrorBoundary>
              </Card>
            </Grid>
          </Grid>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 3, p: 2, minHeight: 280 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2} align="center">Annual Depreciation Summary</Typography>
              <ErrorBoundary>
                <Box sx={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={getDepreciationSummaryData(assets)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#222', color: '#fff', borderRadius: 8, fontSize: 13, border: 'none' }} formatter={v => `₱${v}`}/>
                      <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorDep)" dot={{ r: 3 }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </ErrorBoundary>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;

// Notes: Depends on backend IPC handlers in main.js and uses shared UI components.