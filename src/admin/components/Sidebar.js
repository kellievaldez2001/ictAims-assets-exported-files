import React, { useState, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { SearchContext } from './Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
// Sidebar.js - Shared Sidebar Navigation Component
// This React component renders the sidebar navigation for the Inventory Management System. It provides links to all main pages and highlights the current page. Used on all main pages.
//
// Key responsibilities:
// - Display navigation links to all pages
// - Highlight the active/current page
// - Used by App.js and all main pages
// - Receives props for navigation state if needed
  // {
  //   label: 'Inventory Movements',
  //   icon: <SomeIcon />,
  //   path: '/inventory-movements',
  // },
import './comp_styles/sidebar.css';

const menuItems = [
  { text: 'Dashboard', path: '/', icon: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'block', margin: '0 auto', verticalAlign: 'middle' }}>
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ) },
  {
    text: 'Transactions',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="7 9 12 4 17 9"/><line x1="12" y1="4" x2="12" y2="16"/></svg>
    ),
    subMenu: [
      { text: 'Asset Acquisitions', path: '/acquisitions', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
        ) },
      { text: 'Stock Adjustments', path: '/adjustments', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="10" width="4" height="8"/>
            <rect x="10" y="6" width="4" height="12"/>
            <rect x="17" y="3" width="4" height="15"/>
          </svg>
        ) }
    ],
  },
  {
    text: 'Utilities',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
    ),
    subMenu: [
      { text: 'Asset Records', path: '/products', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
        ) },
      { text: 'Categories', path: '/categories', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16"/><path d="M10 4v16"/></svg>
        ) },
      { text: 'Departments', path: '/departments', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="10" width="4" height="8"/>
            <rect x="10" y="6" width="4" height="12"/>
            <rect x="17" y="3" width="4" height="15"/>
          </svg>
        ) },
      { text: 'Users and Roles', path: '/custodians', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
        ) },
      { text: 'Reports', path: '/reports', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
        ) },
      { text: 'History', path: '/history', icon: (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 2.13-9.36"/></svg>
        ) },
      
    ],
  },
];
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const { search, setSearch } = React.useContext(SearchContext);
  const { theme, setThemeMode } = useTheme();

  // Only show main menus by default, submenus revealed on click
  const handleMenuClick = (item) => {
    if (item.subMenu) {
      setOpenMenus((prev) => ({ ...prev, [item.text]: !prev[item.text] }));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="sidebar-root" style={{ width: 220, minWidth: 220, padding: 2 }}>
      <div className="sidebar-navbar-spacer" />
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <div className="sidebar-menu-item" title={item.text}>
              <button
                className={`sidebar-menu-btn${location.pathname === item.path ? ' selected' : ''}`}
                onClick={() => handleMenuClick(item)}
                style={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  alignItems: 'center',
                  paddingLeft: 10,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                }}
              >
                <span
                  className={`sidebar-icon-highlight${location.pathname === item.path ? ' active' : ''}`}
                  style={{
                    minWidth: 0,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 12,
                    padding: '0 12px',
                    transition: 'background 0.2s ease',
                    justifyContent: 'flex-start',
                  }}
                >
                  {item.icon}
                </span>
                <span 
                  style={{ 
                    fontSize: 13, 
                    lineHeight: '22px', 
                    display: 'inline-block', 
                    textAlign: 'left' ,
                    minWidth: 110,
                    maxWidth: 140,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.text}
                </span>
                {item.subMenu && (
                  <span
                    className={`sidebar-arrow${openMenus[item.text] ? ' open' : ''}`}
                    style={{
                      marginLeft: 0,
                      minWidth: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s',
                    }}
                  >
                    ▶
                  </span>
                )}
              </button>
            </div>
            {item.subMenu && (
              <div
                className="sidebar-submenu-animated"
                style={{
                  paddingLeft: 32,
                  maxHeight: openMenus[item.text] ? 500 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s cubic-bezier(.4,0,.2,1)',
                  opacity: openMenus[item.text] ? 1 : 0,
                }}
              >
                {item.subMenu.map((sub) => (
                  <button
                    key={sub.text}
                    className={`sidebar-menu-btn sidebar-submenu-btn${location.pathname === sub.path ? ' selected' : ''}`}
                    onClick={() => navigate(sub.path)}
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      alignItems: 'center',
                      paddingLeft: 10,
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: 24 }}>
                      {sub.icon}
                    </span>
                    <span style={{ fontSize: 13, marginLeft: 8 }}>{sub.text}</span>
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="sidebar-divider" />
      <div className="sidebar-theme-toggle" style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', margin: '12px 0' }}>
        <button
          className={`sidebar-theme-btn${theme === 'light' ? ' selected' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #333', background: theme === 'light' ? '#222' : 'transparent', color: theme === 'light' ? '#fff' : '#aaa', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
          onClick={() => setThemeMode('light')}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          Light
        </button>
        <button
          className={`sidebar-theme-btn${theme === 'dark' ? ' selected' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, border: '1px solid #333', background: theme === 'dark' ? '#222' : 'transparent', color: theme === 'dark' ? '#fff' : '#aaa', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
          onClick={() => setThemeMode('dark')}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
          Dark
        </button>
      </div>
      <div className="sidebar-logout">
        <button
          className="sidebar-logout-btn"
          title="Logout"
          onClick={() => { window.location.hash = '/login'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: 6}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
// Notes: This component is imported by App.js and used on all pages. It may receive props for navigation state or user info.