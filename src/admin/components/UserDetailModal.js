import React from 'react';
import './comp_styles/UserDetailModal.css';

function UserDetailModal({ open, onClose, user }) {
  if (!open || !user) return null;

  return (
    <div className="user-profile-modal-overlay">
      <div className="user-profile-modal">
        <div className="user-profile-modal-header">
          <h2>User Details</h2>
          <button className="user-profile-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="user-profile-modal-content">
          <div className="user-profile-avatar-section">
            <div className="user-profile-avatar">
              <img src={user.image || 'https://randomuser.me/api/portraits/men/44.jpg'} alt="User Avatar" />
            </div>
          </div>
          <div className="user-profile-info-section">
            <div className="user-profile-info-row"><span className="label">Name:</span> <span>{user.name}</span></div>
            <div className="user-profile-info-row"><span className="label">Email:</span> <span>{user.email}</span></div>
            <div className="user-profile-info-row"><span className="label">Department:</span> <span>{user.department}</span></div>
            <div className="user-profile-info-row"><span className="label">Position:</span> <span>{user.position_designation}</span></div>
            <div className="user-profile-info-row"><span className="label">Account Type:</span> <span>{user.account_type}</span></div>
            <div className="user-profile-info-row"><span className="label">Phone:</span> <span>{user.phone}</span></div>
            <div className="user-profile-info-row"><span className="label">User Group:</span> <span>{user.user_group}</span></div>
            <div className="user-profile-info-row"><span className="label">Employment Status:</span> <span>{user.employment_status}</span></div>
            <div className="user-profile-info-row"><span className="label">System Status:</span> <span>{user.system_status}</span></div>
            <div className="user-profile-info-row"><span className="label">Date Registered:</span> <span>{user.date_registered ? new Date(user.date_registered).toLocaleDateString() : '-'}</span></div>
          </div>
        </div>
        <div className="user-profile-modal-actions">
          <button className="user-profile-btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;
