import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './comp_styles/AccountSettingsModal.css';

function AccountSettingsModal({ open, onClose, user, onUpdateSettings }) {
  const [activeTab, setActiveTab] = useState('security');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inventoryAlerts: true,
    systemUpdates: true,
    weeklyReports: false
  });
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'public',
      activityVisibility: 'friends',
      locationSharing: false
    }
  });

  const { theme, setThemeMode } = useTheme();

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    if (key === 'theme') {
      setThemeMode(value);
    }
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    try {
      if (onUpdateSettings) {
        await onUpdateSettings({ type: 'password', data: passwordData });
      }
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully!');
    } catch (error) {
      alert('Failed to update password: ' + error.message);
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (onUpdateSettings) {
        await onUpdateSettings({ 
          type: 'settings', 
          data: { notifications: notificationSettings, preferences } 
        });
      }
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    }
  };

  if (!open) return null;

  return (
    <div className="account-settings-modal-overlay">
      <div className="account-settings-modal">
        <div className="account-settings-modal-header">
          <h2>Account Settings</h2>
          <button className="account-settings-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="account-settings-modal-content">
          {/* Tab Navigation */}
          <div className="account-settings-tabs">
            <button
              className={`account-settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`account-settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`account-settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          {/* Tab Content */}
          <div className="account-settings-tab-content">
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="account-settings-section">
                <h3>Change Password</h3>
                <div className="account-settings-form">
                  <div className="account-settings-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="account-settings-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="account-settings-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button 
                    className="account-settings-btn-primary"
                    onClick={handlePasswordUpdate}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="account-settings-section">
                <h3>Notification Preferences</h3>
                <div className="account-settings-options">
                  <div className="account-settings-option">
                    <label className="account-settings-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                      <span className="checkmark"></span>
                      Email Notifications
                    </label>
                    <p>Receive important updates via email</p>
                  </div>
                  
                  <div className="account-settings-option">
                    <label className="account-settings-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={() => handleNotificationChange('pushNotifications')}
                      />
                      <span className="checkmark"></span>
                      Push Notifications
                    </label>
                    <p>Receive real-time alerts in the application</p>
                  </div>
                  
                  <div className="account-settings-option">
                    <label className="account-settings-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationSettings.inventoryAlerts}
                        onChange={() => handleNotificationChange('inventoryAlerts')}
                      />
                      <span className="checkmark"></span>
                      Inventory Alerts
                    </label>
                    <p>Get notified about low stock and critical items</p>
                  </div>
                  
                  <div className="account-settings-option">
                    <label className="account-settings-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationSettings.systemUpdates}
                        onChange={() => handleNotificationChange('systemUpdates')}
                      />
                      <span className="checkmark"></span>
                      System Updates
                    </label>
                    <p>Receive notifications about system maintenance</p>
                  </div>
                  
                  <div className="account-settings-option">
                    <label className="account-settings-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReports}
                        onChange={() => handleNotificationChange('weeklyReports')}
                      />
                      <span className="checkmark"></span>
                      Weekly Reports
                    </label>
                    <p>Get weekly summary reports</p>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="account-settings-section">
                <h3>User Preferences</h3>
                <div className="account-settings-form">
                  <div className="account-settings-field">
                    <label>Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="tr">Turkish</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <div className="account-settings-field">
                    <label>Timezone</label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div className="account-settings-field">
                    <label>Date Format</label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>
                  
                  <div className="account-settings-field">
                    <label>Time Format</label>
                    <select
                      value={preferences.timeFormat}
                      onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                    >
                      <option value="24h">24-hour</option>
                      <option value="12h">12-hour (AM/PM)</option>
                    </select>
                  </div>
                  
                  <div className="account-settings-field">
                    <label>Theme</label>
                    <select
                      value={theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="account-settings-actions">
            <button 
              className="account-settings-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            {activeTab !== 'security' && (
              <button 
                className="account-settings-btn-primary"
                onClick={handleSaveSettings}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettingsModal; 