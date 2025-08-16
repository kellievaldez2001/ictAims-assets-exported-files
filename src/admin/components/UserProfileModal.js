import React, { useState, useEffect } from 'react';
import './comp_styles/UserProfileModal.css';

function UserProfileModal({ open, onClose, user, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'Admin User',
        email: user.email || 'admin@ict-aims.com',
        role: user.role || 'System Administrator',
        department: user.department || 'Information Technology',
        phone: user.phone || '+1 (555) 123-4567',
        avatar: user.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Basic validation
      if (!formData.name.trim()) {
        alert('Name is required');
        return;
      }
      
      if (!formData.email.trim()) {
        alert('Email is required');
        return;
      }
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      setIsLoading(true);
      
      if (onUpdateProfile) {
        await onUpdateProfile(formData);
      }
      setIsEditing(false);
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (user) {
      setFormData({
        name: user.name || 'Admin User',
        email: user.email || 'admin@ict-aims.com',
        role: user.role || 'System Administrator',
        department: user.department || 'Information Technology',
        phone: user.phone || '+1 (555) 123-4567',
        avatar: user.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'
      });
    }
  };

  if (!open) return null;

  return (
    <div className="user-profile-modal-overlay">
      <div className="user-profile-modal">
        <div className="user-profile-modal-header">
          <h2>User Profile</h2>
          <button className="user-profile-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="user-profile-modal-content">
          {/* Avatar Section */}
          <div className="user-profile-avatar-section">
            <div className="user-profile-avatar">
              <img src={formData.avatar} alt="User Avatar" />
              {isEditing && (
                <div className="user-profile-avatar-edit">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setFormData(prev => ({ ...prev, avatar: e.target.result }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                    Change Photo
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="user-profile-info">
            <div className="user-profile-field">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="user-profile-input"
                />
              ) : (
                <span className="user-profile-value">{formData.name}</span>
              )}
            </div>

            <div className="user-profile-field">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="user-profile-input"
                />
              ) : (
                <span className="user-profile-value">{formData.email}</span>
              )}
            </div>

            <div className="user-profile-field">
              <label>Role</label>
              {isEditing ? (
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="user-profile-input"
                >
                  <option value="System Administrator">System Administrator</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Regular User">Regular User</option>
                </select>
              ) : (
                <span className="user-profile-value">{formData.role}</span>
              )}
            </div>

            <div className="user-profile-field">
              <label>Department</label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="user-profile-input"
                />
              ) : (
                <span className="user-profile-value">{formData.department}</span>
              )}
            </div>

            <div className="user-profile-field">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="user-profile-input"
                />
              ) : (
                <span className="user-profile-value">{formData.phone}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="user-profile-actions">
            {!isEditing ? (
              <>
                <button 
                  className="user-profile-btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
                <button 
                  className="user-profile-btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button 
                  className="user-profile-btn-save"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="user-profile-btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal; 