
import './UserDashboard.css';
import React from 'react';
import UserFloatingActions from './UserFloatingActions';


function UserDashboard() {
  return (
    <div>
      <UserFloatingActions />
      <div className="user-title">User Dashboard</div>
      <div className="user-dashboard-card">
        <p>Welcome, user! This is your dashboard.</p>
      </div>
    </div>
  );
}

export default UserDashboard;
