import React, { useState, useEffect } from 'react';
import './comp_styles/SystemUpdatesModal.css';

function SystemUpdatesModal({ open, onClose, onCheckUpdates, onInstallUpdate }) {
  const [isChecking, setIsChecking] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('2.1.0');
  const [latestVersion, setLatestVersion] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateHistory, setUpdateHistory] = useState([
    {
      version: '2.1.0',
      date: '2024-01-15',
      type: 'Feature Update',
      description: 'Added new inventory movement tracking system and improved user interface.',
      size: '15.2 MB'
    },
    {
      version: '2.0.5',
      date: '2024-01-01',
      type: 'Security Update',
      description: 'Security patches and bug fixes for improved system stability.',
      size: '8.7 MB'
    },
    {
      version: '2.0.0',
      date: '2023-12-15',
      type: 'Major Update',
      description: 'Complete system redesign with new database architecture and enhanced features.',
      size: '45.3 MB'
    }
  ]);

  useEffect(() => {
    if (open) {
      // Simulate checking for updates
      checkForUpdates();
    }
  }, [open]);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate update check result
      const mockLatestVersion = '2.1.1';
      const mockUpdateInfo = {
        version: '2.1.1',
        date: '2024-01-20',
        type: 'Patch Update',
        description: 'Bug fixes and performance improvements for inventory management system.',
        size: '12.8 MB',
        releaseNotes: [
          'Fixed issue with asset search functionality',
          'Improved database query performance',
          'Enhanced error handling for bulk operations',
          'Updated security protocols',
          'Minor UI improvements'
        ]
      };
      
      setLatestVersion(mockLatestVersion);
      setUpdateInfo(mockUpdateInfo);
      setUpdateAvailable(mockLatestVersion !== currentVersion);
      
      if (onCheckUpdates) {
        onCheckUpdates({ available: mockLatestVersion !== currentVersion, version: mockLatestVersion });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInstallUpdate = async () => {
    if (!updateInfo) return;
    
    try {
      if (onInstallUpdate) {
        await onInstallUpdate(updateInfo);
      }
      
      // Simulate installation
      alert('Update installed successfully! The system will restart in 5 seconds.');
      
      // Update current version
      setCurrentVersion(updateInfo.version);
      setUpdateAvailable(false);
      
      // Add to update history
      setUpdateHistory(prev => [updateInfo, ...prev]);
      
    } catch (error) {
      alert('Failed to install update: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!open) return null;

  return (
    <div className="system-updates-modal-overlay">
      <div className="system-updates-modal">
        <div className="system-updates-modal-header">
          <h2>System Updates</h2>
          <button className="system-updates-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="system-updates-modal-content">
          {/* Current Version Info */}
          <div className="system-updates-current">
            <div className="system-updates-version-info">
              <h3>Current Version</h3>
              <div className="system-updates-version">
                <span className="version-number">{currentVersion}</span>
                <span className="version-status">Up to date</span>
              </div>
            </div>
            
            <button 
              className="system-updates-check-btn"
              onClick={checkForUpdates}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </button>
          </div>

          {/* Update Available Section */}
          {updateAvailable && updateInfo && (
            <div className="system-updates-available">
              <div className="system-updates-available-header">
                <h3>🆕 Update Available</h3>
                <span className="update-badge">New</span>
              </div>
              
              <div className="system-updates-available-info">
                <div className="update-version">
                  <strong>Version {updateInfo.version}</strong>
                  <span className="update-date">{formatDate(updateInfo.date)}</span>
                </div>
                
                <div className="update-type">
                  <span className={`update-type-badge ${updateInfo.type.toLowerCase().replace(' ', '-')}`}>
                    {updateInfo.type}
                  </span>
                  <span className="update-size">{updateInfo.size}</span>
                </div>
                
                <p className="update-description">{updateInfo.description}</p>
                
                {updateInfo.releaseNotes && (
                  <div className="update-release-notes">
                    <h4>Release Notes:</h4>
                    <ul>
                      {updateInfo.releaseNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="system-updates-actions">
                <button 
                  className="system-updates-install-btn"
                  onClick={handleInstallUpdate}
                >
                  Install Update
                </button>
                <button 
                  className="system-updates-later-btn"
                  onClick={() => setUpdateAvailable(false)}
                >
                  Install Later
                </button>
              </div>
            </div>
          )}

          {/* Update History */}
          <div className="system-updates-history">
            <h3>Update History</h3>
            <div className="system-updates-history-list">
              {updateHistory.map((update, index) => (
                <div key={index} className="system-updates-history-item">
                  <div className="history-item-header">
                    <div className="history-version">
                      <strong>Version {update.version}</strong>
                      <span className="history-date">{formatDate(update.date)}</span>
                    </div>
                    <div className="history-type">
                      <span className={`history-type-badge ${update.type.toLowerCase().replace(' ', '-')}`}>
                        {update.type}
                      </span>
                      <span className="history-size">{update.size}</span>
                    </div>
                  </div>
                  <p className="history-description">{update.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="system-updates-modal-actions">
            <button 
              className="system-updates-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemUpdatesModal; 