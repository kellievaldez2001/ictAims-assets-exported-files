import React from 'react';
import './UserNavbar.css';

function UserNavbar() {
  return (
    <header className="user-navbar">
      <div className="user-navbar-title">ICT-AIMS User Portal</div>
      <div className="user-navbar-profile">
        <span className="user-navbar-avatar">👤</span>
        <span className="user-navbar-name">User</span>
      </div>
    </header>
  );
}

export default UserNavbar;
