
import React, { useState, useRef, useEffect } from 'react';
import './UserFloatingActions.css';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';


function UserFloatingActions() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="user-floating-actions">
      <button className="user-action-btn">
        <CalendarTodayIcon />
        <span className="btn-label">Calendar</span>
      </button>
      <button className="user-action-btn">
        <SettingsIcon />
        <span className="btn-label">Settings</span>
      </button>
      <button className="user-action-btn">
        <HistoryIcon />
        <span className="btn-label">History</span>
      </button>
      <button className="user-action-btn">
        <Brightness4Icon />
        <span className="btn-label">Theme</span>
      </button>
      <div className="user-profile-card" ref={profileRef} onClick={() => setDropdownOpen((open) => !open)} style={{ cursor: 'pointer', position: 'relative' }}>
        <AccountCircleIcon className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-name">User Name</div>
          <div className="profile-role">User</div>
        </div>
        <span style={{ marginLeft: 4, color: '#888', fontSize: 18, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        {dropdownOpen && (
          <div className="user-profile-dropdown">
            <div className="dropdown-header">
              <AccountCircleIcon className="dropdown-avatar" />
              <div className="dropdown-name">User Name</div>
              <div className="dropdown-email">user@email.com</div>
            </div>
            <div className="dropdown-menu">
              <button className="dropdown-item"><PersonIcon /> View Profile</button>
              <button className="dropdown-item"><SettingsOutlinedIcon /> Account Settings</button>
              <button className="dropdown-item"><SystemUpdateAltIcon /> System Updates</button>
              <hr className="dropdown-divider" />
              <button className="dropdown-item logout"><LogoutIcon /> Log Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserFloatingActions;
