import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  {
    text: 'Dashboard',
    path: '/user-dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    ),
  },
  {
    text: 'My Assets',
    path: '/user-assets',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
    ),
  },
  {
    text: 'History',
    path: '/user-history',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 2.13-9.36"/></svg>
    ),
  },
];

function UserSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="user-sidebar sidebar-root">
      <div className="sidebar-navbar-spacer" />
      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <button
            key={item.text}
            className={`sidebar-menu-btn${location.pathname === item.path ? ' selected' : ''}`}
            onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', width: '100%', background: 'none', border: 'none', padding: '12px 24px', fontSize: '1.08rem', cursor: 'pointer', color: '#232323', gap: 12 }}
          >
            <span>{item.icon}</span>
            <span className="sidebar-menu-text">{item.text}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default UserSidebar;
