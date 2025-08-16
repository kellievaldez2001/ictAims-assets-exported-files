// Navbar.js - Shared Navigation Bar Component
// This React component renders the top navigation bar for the Inventory Management System. It provides navigation links, branding, and user controls. Used on all main pages.
//
// Key responsibilities:
// - Display app branding and navigation links
// - Provide user controls (logout, profile, etc.)
// - Used by App.js and all main pages
// - Receives props for dynamic content if needed
//
// Dependencies:
// - React: for component structure and state management
// - @mui/material: for UI components like AppBar, Toolbar, Box, Avatar, InputBase, IconButton, Divider
// - @mui/icons-material/Search: for search icon
// - react-router-dom: for navigation handling (useLocation)

import React, { useState, useRef, useEffect, useContext } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import UserProfileModal from './UserProfileModal';
import AccountSettingsModal from './AccountSettingsModal';
import SystemUpdatesModal from './SystemUpdatesModal';
import SettingsPopup from './SettingsPopup';
import { useLocation } from 'react-router-dom';
import './comp_styles/navbar.css';
import ictAimsLogo from '../../assets/ict-aims-logo.png';

export const SearchContext = React.createContext({ search: '', setSearch: () => {} });
export const DateFilterContext = React.createContext({ dateFilter: null, setDateFilter: () => {} });

function Navbar({ search, setSearch, onSearch, user, onProfileUpdate }) {
  const { theme, toggleTheme } = useTheme();
  const { setDateFilter } = useContext(DateFilterContext);
  
  // Default user data if not provided
  const currentUser = user || {
    name: 'Admin User',
    email: 'admin@ict-aims.com',
    role: 'System Administrator',
    department: 'Information Technology',
    phone: '+1 (555) 123-4567',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  };
  const [settingsSection, setSettingsSection] = useState(null);
  const [focused, setFocused] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [systemUpdatesOpen, setSystemUpdatesOpen] = useState(false);
  // Filtering handler (replace with your actual filter logic)
  const onFilterDates = () => {
    // Compose filter object
    const filter = {};
    if (filterYear) filter.year = Number(filterYear);
    if (filterMonth) filter.month = Number(filterMonth);
    if (filterDay) filter.day = Number(filterDay);
    // Call a prop or log for now
    if (window && window.console) window.console.log('Filter dates:', filter);
    // You can call a prop like onFilterDates(filter) here if needed
  };
  const [now, setNow] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const settingsClickCount = useRef(0);
  const settingsRef = useRef(null);
  const profileMenuRef = useRef(null);
  const calendarRef = useRef(null);
  const searchTimeout = useRef(null);
  const location = useLocation();
  // Live ticking time for calendar modal
  React.useEffect(() => {
    if (!calendarOpen) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [calendarOpen]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClick = (e) => {
      if (profileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (settingsOpen && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
      if (calendarOpen && calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
        setDateFilter(null); // Reset date filter when calendar closes
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileMenuOpen, settingsOpen, calendarOpen, setDateFilter]);

  const handleSearch = () => {
    if (search.trim()) {
      // Trigger search across all components
      if (onSearch) onSearch(search);
      
      // Store search in recent searches
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      if (!recentSearches.includes(search)) {
        recentSearches.unshift(search);
        if (recentSearches.length > 10) recentSearches.pop(); // Keep only 10 recent searches
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      }
      
      // Clear search after successful search
      setSearch('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setSearch('');
      setFocused(false);
    }
  };

  // Handle real-time search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    // Real-time search trigger (debounced)
    if (onSearch && value.trim()) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        onSearch(value);
      }, 300); // 300ms delay for better performance
    }
  };

  // Get recent searches for suggestions
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

  // Add this above your return statement
  const isFilterActive = filterYear || filterMonth || filterDay;

  const handleToday = () => {
    const today = new Date();
    setFilterYear(String(today.getFullYear()));
    setFilterMonth(String(today.getMonth() + 1));
    setFilterDay(String(today.getDate()));
    setCalendarDate(today);
  };

  // Profile action handlers
  const handleViewProfile = () => {
    setProfileMenuOpen(false);
    setUserProfileOpen(true);
  };

  const handleAccountSettings = () => {
    setProfileMenuOpen(false);
    setAccountSettingsOpen(true);
  };

  const handleSystemUpdates = () => {
    setProfileMenuOpen(false);
    setSystemUpdatesOpen(true);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    // Redirect to login page
    window.location.reload();
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      // Update user data in localStorage
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Call parent component's profile update handler
      if (onProfileUpdate) {
        onProfileUpdate(profileData);
      }
      
      // In a real app, you would make an API call here
      console.log('Profile updated:', profileData);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleUpdateSettings = async (settingsData) => {
    try {
      // In a real app, you would make an API call here
      console.log('Settings updated:', settingsData);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleCheckUpdates = async (updateInfo) => {
    try {
      // In a real app, you would make an API call here
      console.log('Update check result:', updateInfo);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleInstallUpdate = async (updateInfo) => {
    try {
      // In a real app, you would make an API call here
      console.log('Installing update:', updateInfo);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleOkay = () => {
    // Compose filter object
    const filter = {};
    if (filterYear) filter.year = parseInt(filterYear, 10);
    if (filterMonth) filter.month = parseInt(filterMonth, 10);
    if (filterDay) filter.day = parseInt(filterDay, 10);
    setDateFilter(filter); // Set the shared date filter context
    if (window && window.console) window.console.log('Filter dates:', filter);
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-container">
        {/* Brand Section */}
        <div className="navbar-brand-section">
          <div className="navbar-logo">
            <img src={ictAimsLogo} alt="ICT-AIMS Logo" />
          </div>
          <div className="navbar-title">
            <h1 className="navbar-main-title">ICT-AIMS</h1>
            <p className="navbar-subtitle">Institute of Information and Communication Technology</p>
            <p className="navbar-system-name">Assets Inventory and Management System</p>
          </div>
          </div>

          {/* Right Section: Actions + Profile */}
          <div className="navbar-right-section">
            {/* Actions Section */}
            <div className="navbar-actions-section">
          {/* Calendar Button */}
          <button 
            className={`navbar-action-btn ${calendarOpen ? 'active' : ''}`}
            title="Calendar & Date Filter"
            onClick={() => setCalendarOpen((open) => !open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="btn-label">Calendar</span>
          </button>

          {/* Calendar Popup */}
          {calendarOpen && (
            <div ref={calendarRef} className="calendar-popup">
              {/* Today's Date and Time */}
              <div className="calendar-header">
                <div className="current-time">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>
                    {now.toLocaleString('default', { weekday: 'long' })} {now.toLocaleString('default', { month: 'long' })} {now.getDate()}, {now.getFullYear()}
                  </span>
                  <span className="time-display">
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="filter-section">
                <h3>Filter Dates</h3>
                <div className="filter-controls">
                  <select
                    value={filterYear}
                    onChange={e => setFilterYear(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 11 }).map((_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                  <select
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i + 1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                  <select
                    value={filterDay}
                    onChange={e => setFilterDay(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Day</option>
                    {filterYear && filterMonth ?
                      Array.from({ length: new Date(Number(filterYear), Number(filterMonth), 0).getDate() }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      )) :
                      Array.from({ length: 31 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="filter-actions">
                  <button className="filter-btn secondary" onClick={handleToday}>Today</button>
                  <button 
                    className={`filter-btn primary ${!isFilterActive ? 'disabled' : ''}`}
                    onClick={isFilterActive ? handleOkay : undefined}
                    disabled={!isFilterActive}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>

              {/* Calendar View Toggle */}
              <div className="calendar-toggle">
                <button 
                  className="toggle-btn"
                  onClick={() => setShowCalendar(v => !v)}
                >
                  {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                </button>
              </div>

              {/* Calendar Table */}
              {showCalendar && (
                <div className="calendar-view">
                  <table className="calendar-table">
                    <thead>
                      <tr>
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <th key={d}>{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const year = calendarDate.getFullYear();
                        const month = calendarDate.getMonth();
                        const firstDay = new Date(year, month, 1);
                        const lastDay = new Date(year, month + 1, 0);
                        const startDay = (firstDay.getDay() + 6) % 7;
                        const days = [];
                        let dayNum = 1 - startDay;
                        for (let w = 0; w < 6; w++) {
                          const week = [];
                          for (let d = 0; d < 7; d++, dayNum++) {
                            if (dayNum > 0 && dayNum <= lastDay.getDate()) {
                              week.push(
                                <td key={d}>
                                  <button 
                                    className={`calendar-day ${dayNum === calendarDate.getDate() ? 'selected' : ''}`}
                                    onClick={() => setCalendarDate(new Date(year, month, dayNum))}
                                  >
                                    {dayNum}
                                  </button>
                                </td>
                              );
                            } else {
                              week.push(<td key={d} />);
                            }
                          }
                          days.push(<tr key={w}>{week}</tr>);
                        }
                        return days;
                      })()}
                    </tbody>
                  </table>
                  
                  {/* Month Selector */}
                  <div className="month-selector">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`month-btn ${i === calendarDate.getMonth() ? 'selected' : ''}`}
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), i, 1))}
                      >
                        {new Date(2000, i, 1).toLocaleString('default', { month: 'short' })}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Button */}
          <button 
            className={`navbar-action-btn ${settingsOpen ? 'active' : ''}`}
            title="Settings"
            onClick={() => {
              settingsClickCount.current += 1;
              setSettingsOpen(settingsClickCount.current % 2 === 1);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.31-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.12.6 1.82.33h.09c.7 0 1.31.4 1.51 1V3a2 2 0 1 1 4 0v.09c0 .7.4 1.31 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .7.4 1.31 1 1.51H21a2 2 0 1 1 0 4h-.09c-.7 0-1.31.4-1.51 1z"/>
            </svg>
            <span className="btn-label">Settings</span>
          </button>

          {/* Settings Popup */}
          <SettingsPopup
            settingsOpen={settingsOpen}
            settingsRef={settingsRef}
            settingsSection={settingsSection}
            setSettingsSection={setSettingsSection}
          />

          {/* History Button */}
          <button className="navbar-action-btn" title="History">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.05 13a9 9 0 1 0 2.13-9.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="btn-label">History</span>
          </button>

          {/* Theme Button */}
          <button className="navbar-action-btn" title="Change Theme" onClick={toggleTheme}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="btn-label">Theme</span>
          </button>
          </div>

          {/* User Profile Section */}
          <div className="navbar-profile-section">
          <div 
            className="profile-container"
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <div className="profile-avatar">
              <img
                src={currentUser.avatar}
                alt="User Profile"
              />
              <div className="profile-status"></div>
            </div>
            
            <div className="profile-info">
              <span className="profile-name">{currentUser.name}</span>
              <span className="profile-role">{currentUser.role}</span>
            </div>

            <svg className="profile-dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div ref={profileMenuRef} className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  <img
                    src={currentUser.avatar}
                    alt="User Profile"
                  />
                </div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{currentUser.name}</span>
                  <span className="dropdown-email">{currentUser.email}</span>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleViewProfile}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5.5 21a7.5 7.5 0 0 1 13 0" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>View Profile</span>
                </button>
                
                <button className="dropdown-item" onClick={handleAccountSettings}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Account Settings</span>
                </button>
                
                <button className="dropdown-item" onClick={handleSystemUpdates}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>System Updates</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserProfileModal
        open={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
        user={currentUser}
        onUpdateProfile={handleUpdateProfile}
      />
      
      <AccountSettingsModal
        open={accountSettingsOpen}
        onClose={() => setAccountSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />
      
      <SystemUpdatesModal
        open={systemUpdatesOpen}
        onClose={() => setSystemUpdatesOpen(false)}
        onCheckUpdates={handleCheckUpdates}
        onInstallUpdate={handleInstallUpdate}
      />
    </nav>
  );
}

export default Navbar;