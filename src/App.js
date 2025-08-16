import UserDashboard from './user/UserDashboard';
import MyAssets from './user/MyAssets';
import UserHistory from './user/UserHistory';
import UserLayout from './user/UserLayout';
// App.js - Main React Application Component
// This file defines the main App component, which sets up routing and layout for the Inventory Management System frontend. 
// It includes the Navbar and Sidebar, and renders the appropriate page based on the current route.
//
// Key responsibilities:
// - Set up React Router for page navigation
// - Render shared UI components (Navbar, Sidebar)
// - Render page components (Dashboard, Assets, Custodians, etc.)
// - Pass props and manage shared state as needed
// - Entry point for frontend logic

import React, { useState, useEffect } from 'react';                                // basic React functionality
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './login/LoginPage';
import './App.css';

// Components
import Navbar, { SearchContext, DateFilterContext } from './admin/components/Navbar';
import Sidebar from './admin/components/Sidebar';
import Dashboard from './admin/pages/Dashboard';
import CategoriesManagement from './admin/pages/CategoriesManagement';
import Assets from './admin/pages/Assets';
// import Products from './admin/pages/Products'; // Products.js not found in admin/pages, comment out for now
import Custodians from './admin/pages/Custodians';
import Departments from './admin/pages/Departments';
import Reports from './admin/pages/Reports';
import History from './admin/pages/History';
import Settings from './admin/pages/Settings';
import AssetAcquisitions from './admin/pages/AssetAcquisitions';
import StockAdjustments from './admin/pages/StockAdjustments';
// import InventoryMovements from './admin/pages/InventoryMovements'; // Not found, comment out for now
import NotFound from './admin/pages/NotFound';
import AssetDetailsPage from './admin/pages/AssetDetailsPage';

// Theme Context
import { ThemeProvider } from './contexts/ThemeContext';

/*You define a dark theme with custom colors and styles.
Components like MuiAppBar, MuiDrawer, and MuiButton are visually customized to fit your design.
This theme is applied globally via <ThemeProvider> so your app has a consistent look.*/
function App() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Global search function
  const handleGlobalSearch = (searchTerm) => {
    localStorage.setItem('currentSearch', searchTerm);
    setSearch(searchTerm);
  };

  useEffect(() => {
    const savedSearch = localStorage.getItem('currentSearch');
    if (savedSearch) setSearch(savedSearch);
  }, []);

  return (
    <ThemeProvider>
      <div className="app-root">
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />} />
            {/* Public asset details route */}
            <Route path="/asset/:assetId" element={<AssetDetailsPage />} />
            {/* User routes */}
            <Route
              path="/user-dashboard"
              element={isAuthenticated ? (
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              ) : <Navigate to="/login" replace />}
            />
            <Route
              path="/user-assets"
              element={isAuthenticated ? (
                <UserLayout>
                  <MyAssets />
                </UserLayout>
              ) : <Navigate to="/login" replace />}
            />
            <Route
              path="/user-history"
              element={isAuthenticated ? (
                <UserLayout>
                  <UserHistory />
                </UserLayout>
              ) : <Navigate to="/login" replace />}
            />
            {/* Admin routes */}
            <Route
              path="/*"
              element={
                isAuthenticated ? (
                  <SearchContext.Provider value={{ search, setSearch }}>
                    <DateFilterContext.Provider value={{ dateFilter, setDateFilter }}>
                      <div style={{ display: 'flex' }}>
                        <Navbar search={search} setSearch={setSearch} onSearch={handleGlobalSearch} />
                        <Sidebar />
                        <main key={window.location.hash} style={{ flexGrow: 1, padding: 24, marginTop: 88 }}>
                          <Routes>
                            <Route exact path="/" element={<Dashboard />} />
                            <Route path="/assets" element={<Assets />} />
                            <Route path="/products" element={<Assets />} />
                            <Route path="/departments" element={<Departments />} />
                            <Route path="/custodians" element={<Custodians />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/history" element={<History />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/acquisitions" element={<AssetAcquisitions />} />
                            <Route path="/adjustments" element={<StockAdjustments />} />
                            <Route path="/categories" element={<CategoriesManagement />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </DateFilterContext.Provider>
                  </SearchContext.Provider>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;

// Notes: This file is the root of the frontend and depends on all page and component files. It is rendered by index.js.