import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './admin/components/pages/Dashboard';
import Assets from './admin/components/pages/Assets';
import Custodians from './admin/components/pages/Custodians';
import Departments from './admin/components/pages/Departments';
import CategoriesManagement from './admin/components/pages/CategoriesManagement';
import History from './admin/components/pages/History';
import PurchaseOrders from './admin/components/pages/PurchaseOrders';
import StockAdjustments from './admin/components/pages/StockAdjustments';
// import InventoryMovements from './pages/InventoryMovements';
import AssetAcquisitions from './admin/components/pages/AssetAcquisitions';
import Settings from './admin/components/pages/Settings';
import './App.css';
import './theme.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in (you can implement your own auth logic)
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleProfileUpdate = (updatedProfile) => {
    const updatedUser = { ...currentUser, ...updatedProfile };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  if (!currentUser) {
    // Simple login for demo purposes
    return (
      <ThemeProvider>
        <div className="login-container">
          <div className="login-box">
            <h2>Inventory Management System V2</h2>
            <p>MySQL Database Version</p>
            <button 
              onClick={() => {
                const demoUser = { 
                  name: 'Admin User', 
                  role: 'System Administrator',
                  email: 'admin@ict-aims.com',
                  department: 'Information Technology',
                  phone: '+1 (555) 123-4567',
                  avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
                };
                setCurrentUser(demoUser);
                localStorage.setItem('currentUser', JSON.stringify(demoUser));
              }}
              className="login-button"
            >
              Login (Demo)
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Sidebar isOpen={sidebarOpen} />
          <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Navbar onMenuClick={toggleSidebar} user={currentUser} onProfileUpdate={handleProfileUpdate} />
            <div className="content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/custodians" element={<Custodians />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/categories" element={<CategoriesManagement />} />
                <Route path="/history" element={<History />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                <Route path="/stock-adjustments" element={<StockAdjustments />} />
                {/* <Route path="/inventory-movements" element={<InventoryMovements />} /> */}
                <Route path="/asset-acquisitions" element={<AssetAcquisitions />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 